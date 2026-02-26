import { supabaseAdmin } from '../../db/client.js'
import { logger } from '../../lib/logger.js'

/**
 * MarketplaceStrategy interface for link construction
 */
export interface MarketplaceStrategy {
  buildLink(productId: string, tenantId: string): Promise<string>
}

/**
 * AmazonStrategy
 *
 * Constructs Amazon Associates affiliate links using tenant's Associates ID
 * retrieved from marketplace_credentials table (ZAP-043).
 *
 * Format: https://amazon.com.br/dp/{asin}?tag={associatesId}
 * ASIN Format: B[A-Z0-9]{9} (10 characters starting with B)
 */
export class AmazonStrategy implements MarketplaceStrategy {
  private readonly baseUrl = 'https://amazon.com.br'

  /**
   * Build Amazon Associates affiliate link
   *
   * @param asin - Amazon Standard Identification Number (e.g., B0123456789)
   * @param tenantId - Tenant ID to fetch Associates ID from
   * @returns Constructed Amazon affiliate link
   * @throws Error if ASIN invalid or Amazon not configured
   */
  async buildLink(asin: string, tenantId: string): Promise<string> {
    // AC-046.1: Validate ASIN format (B followed by 9 alphanumeric chars)
    if (!asin || !/^B[A-Z0-9]{9}$/.test(asin)) {
      const error = `Invalid Amazon ASIN: ${asin || 'empty'}`
      logger.error(error)
      throw new Error(error)
    }

    // Fetch Associates ID from credentials (ZAP-043)
    const { data: creds, error: fetchError } = await supabaseAdmin
      .from('marketplace_credentials')
      .select('amazon_associates_id')
      .eq('tenant_id', tenantId)
      .single()

    // AC-046.4: Handle missing credentials gracefully
    if (fetchError || !creds?.amazon_associates_id) {
      const error = 'Amazon not configured'
      logger.error(
        `Failed to fetch Amazon credentials for tenant ${tenantId}: ${fetchError?.message || 'no associates_id'}`
      )
      throw new Error(error)
    }

    const associatesId = creds.amazon_associates_id

    // AC-046.1 & AC-046.5: Build deterministic link (same inputs always produce same output)
    const link = `${this.baseUrl}/dp/${asin}?tag=${associatesId}`

    logger.debug(`Built Amazon link for tenant ${tenantId}`, {
      asin,
      associatesId: associatesId.substring(0, 5) + '...', // Log masked for security
      linkLength: link.length,
    })

    return link
  }
}
