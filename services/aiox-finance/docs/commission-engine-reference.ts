/**
 * AIOX Finance Commission System - Commission Engine
 * Strategy Pattern Implementation (7 Commission Types)
 * TypeScript - Production Ready
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CommissionRule {
  id: string;
  typeId: number;
  config: unknown;
  validFrom: Date;
  validTo?: Date;
  active: boolean;
}

interface Sale {
  id: string;
  sellerId: string;
  netValue: number;
  category: string;
  productName: string;
  createdAt: Date;
}

interface Seller {
  id: string;
  name: string;
  role: string;
}

interface CommissionCalculationResult {
  baseValue: number;
  commissionValue: number;
  ruleId: string;
  typeId: number;
  calculationDetails: Record<string, unknown>;
}

// ============================================================================
// COMMISSION STRATEGIES (7 Types)
// ============================================================================

interface ICommissionStrategy {
  calculate(sale: Sale, rule: CommissionRule, seller: Seller): number;
  validate(config: unknown): { valid: boolean; errors: string[] };
}

/**
 * Type 1: FIXA (Fixed Amount)
 * Config: { "amount": 50 }
 * Calculation: commission = amount
 */
class FixedCommissionStrategy implements ICommissionStrategy {
  calculate(sale: Sale, rule: CommissionRule): number {
    const config = rule.config as { amount: number };
    if (!config.amount || config.amount < 0) {
      throw new Error('Invalid fixed commission config: amount required and must be >= 0');
    }
    return config.amount;
  }

  validate(config: unknown): { valid: boolean; errors: string[] } {
    const c = config as any;
    const errors: string[] = [];

    if (!c.amount) errors.push('amount is required');
    if (typeof c.amount !== 'number') errors.push('amount must be a number');
    if (c.amount < 0) errors.push('amount must be >= 0');

    return { valid: errors.length === 0, errors };
  }
}

/**
 * Type 2: PERCENTUAL (Percentage)
 * Config: { "percentage": 5 }
 * Calculation: commission = net_value * percentage / 100
 */
class PercentualCommissionStrategy implements ICommissionStrategy {
  calculate(sale: Sale, rule: CommissionRule): number {
    const config = rule.config as { percentage: number };
    if (!config.percentage || config.percentage < 0 || config.percentage > 100) {
      throw new Error('Invalid percentage config: must be 0-100');
    }
    return (sale.netValue * config.percentage) / 100;
  }

  validate(config: unknown): { valid: boolean; errors: string[] } {
    const c = config as any;
    const errors: string[] = [];

    if (c.percentage === undefined) errors.push('percentage is required');
    if (typeof c.percentage !== 'number') errors.push('percentage must be a number');
    if (c.percentage < 0 || c.percentage > 100) errors.push('percentage must be 0-100');

    return { valid: errors.length === 0, errors };
  }
}

/**
 * Type 3: ESCALAS (Tiered/Banded)
 * Config: { "scales": [{ "min": 0, "max": 10000, "pct": 3 }, { "min": 10000, "pct": 5 }] }
 * Calculation: find matching scale by net_value, apply percentage
 */
class ScaledCommissionStrategy implements ICommissionStrategy {
  calculate(sale: Sale, rule: CommissionRule): number {
    const config = rule.config as {
      scales: Array<{ min: number; max?: number; pct: number }>;
    };

    if (!config.scales || config.scales.length === 0) {
      throw new Error('Invalid scaled commission config: scales array required');
    }

    // Find matching scale (last match wins for overlaps)
    let appliedPercentage = 0;
    for (const scale of config.scales) {
      const isAboveMin = sale.netValue >= scale.min;
      const isBelowMax = scale.max === undefined || sale.netValue < scale.max;
      if (isAboveMin && isBelowMax) {
        appliedPercentage = scale.pct;
      }
    }

    return (sale.netValue * appliedPercentage) / 100;
  }

  validate(config: unknown): { valid: boolean; errors: string[] } {
    const c = config as any;
    const errors: string[] = [];

    if (!c.scales) errors.push('scales array is required');
    if (!Array.isArray(c.scales)) errors.push('scales must be an array');
    if (Array.isArray(c.scales) && c.scales.length === 0) {
      errors.push('scales must have at least 1 entry');
    }

    (c.scales || []).forEach((scale: any, idx: number) => {
      if (typeof scale.min !== 'number') errors.push(`scales[${idx}].min must be a number`);
      if (scale.max !== undefined && typeof scale.max !== 'number') {
        errors.push(`scales[${idx}].max must be a number or undefined`);
      }
      if (typeof scale.pct !== 'number') errors.push(`scales[${idx}].pct must be a number`);
      if (scale.pct < 0 || scale.pct > 100) {
        errors.push(`scales[${idx}].pct must be 0-100`);
      }
    });

    return { valid: errors.length === 0, errors };
  }
}

/**
 * Type 4: PERFORMANCE (Bonus by Target)
 * Config: { "basePct": 5, "targets": [{ "metaPct": 110, "bonusPct": 10 }] }
 * Calculation: base = net_value * basePct; if seller_perf >= metaPct then bonus += bonusPct
 * Note: metaPct is vs seller's monthly target (external data)
 */
class PerformanceCommissionStrategy implements ICommissionStrategy {
  calculate(
    sale: Sale,
    rule: CommissionRule,
    seller: Seller,
    performanceData?: { achievementPct: number }
  ): number {
    const config = rule.config as {
      basePct: number;
      targets: Array<{ metaPct: number; bonusPct: number }>;
    };

    if (!config.basePct || config.basePct < 0) {
      throw new Error('Invalid performance commission: basePct required');
    }

    let baseCommission = (sale.netValue * config.basePct) / 100;
    let bonusCommission = 0;

    if (performanceData && config.targets) {
      for (const target of config.targets) {
        if (performanceData.achievementPct >= target.metaPct) {
          bonusCommission = (sale.netValue * target.bonusPct) / 100;
        }
      }
    }

    return baseCommission + bonusCommission;
  }

  validate(config: unknown): { valid: boolean; errors: string[] } {
    const c = config as any;
    const errors: string[] = [];

    if (typeof c.basePct !== 'number') errors.push('basePct must be a number');
    if (c.basePct < 0) errors.push('basePct must be >= 0');
    if (!Array.isArray(c.targets)) errors.push('targets must be an array');

    (c.targets || []).forEach((target: any, idx: number) => {
      if (typeof target.metaPct !== 'number') {
        errors.push(`targets[${idx}].metaPct must be a number`);
      }
      if (typeof target.bonusPct !== 'number') {
        errors.push(`targets[${idx}].bonusPct must be a number`);
      }
    });

    return { valid: errors.length === 0, errors };
  }
}

/**
 * Type 5: RECORRENTE (Recurring - Subscriptions)
 * Config: { "percentage": 2, "frequency": "monthly" }
 * Calculation: percentage of net_value, paid monthly on renewal
 * Note: In practice, this would be triggered by subscription events, not sales
 */
class RecurringCommissionStrategy implements ICommissionStrategy {
  calculate(sale: Sale, rule: CommissionRule): number {
    const config = rule.config as { percentage: number; frequency: string };

    if (!config.percentage || config.percentage < 0) {
      throw new Error('Invalid recurring commission: percentage required');
    }

    // This is the monthly amount; in reality, total = monthly * months_active
    return (sale.netValue * config.percentage) / 100;
  }

  validate(config: unknown): { valid: boolean; errors: string[] } {
    const c = config as any;
    const errors: string[] = [];

    if (typeof c.percentage !== 'number') errors.push('percentage must be a number');
    if (c.percentage < 0 || c.percentage > 100) errors.push('percentage must be 0-100');
    if (!['monthly', 'quarterly', 'annual'].includes(c.frequency)) {
      errors.push('frequency must be monthly|quarterly|annual');
    }

    return { valid: errors.length === 0, errors };
  }
}

/**
 * Type 6: PRODUTO (Per-Product)
 * Config: { "products": { "prodA": 5, "prodB": 8, "default": 3 } }
 * Calculation: find product commission % by sale.productName, fallback to default
 */
class ProductCommissionStrategy implements ICommissionStrategy {
  calculate(sale: Sale, rule: CommissionRule): number {
    const config = rule.config as { products: Record<string, number>; default?: number };

    if (!config.products || typeof config.products !== 'object') {
      throw new Error('Invalid product commission: products object required');
    }

    const pct =
      config.products[sale.productName] ||
      config.products[sale.category] ||
      config.products['default'] ||
      0;

    if (pct < 0 || pct > 100) {
      throw new Error(`Invalid percentage ${pct} for product ${sale.productName}`);
    }

    return (sale.netValue * pct) / 100;
  }

  validate(config: unknown): { valid: boolean; errors: string[] } {
    const c = config as any;
    const errors: string[] = [];

    if (!c.products || typeof c.products !== 'object') {
      errors.push('products object is required');
    } else {
      Object.entries(c.products as Record<string, unknown>).forEach(([key, val]) => {
        if (typeof val !== 'number') errors.push(`products.${key} must be a number`);
        if (val < 0 || val > 100) errors.push(`products.${key} must be 0-100`);
      });
    }

    return { valid: errors.length === 0, errors };
  }
}

/**
 * Type 7: LUCRO_LIQUIDO (Net Profit)
 * Config: { "percentage": 10, "costPct": 30 }
 * Calculation: profit = net_value * (1 - costPct/100); commission = profit * percentage / 100
 * Note: costPct is assumed cost of goods sold; in practice would be from inventory/costing system
 */
class NetProfitCommissionStrategy implements ICommissionStrategy {
  calculate(sale: Sale, rule: CommissionRule): number {
    const config = rule.config as { percentage: number; costPct: number };

    if (!config.percentage || config.percentage < 0) {
      throw new Error('Invalid net profit commission: percentage required');
    }
    if (!config.costPct) {
      throw new Error('Invalid net profit commission: costPct (cost percentage) required');
    }

    const profit = sale.netValue * (1 - config.costPct / 100);
    return (profit * config.percentage) / 100;
  }

  validate(config: unknown): { valid: boolean; errors: string[] } {
    const c = config as any;
    const errors: string[] = [];

    if (typeof c.percentage !== 'number') errors.push('percentage must be a number');
    if (c.percentage < 0 || c.percentage > 100) {
      errors.push('percentage must be 0-100');
    }
    if (typeof c.costPct !== 'number') errors.push('costPct must be a number');
    if (c.costPct < 0 || c.costPct > 100) errors.push('costPct must be 0-100');

    return { valid: errors.length === 0, errors };
  }
}

// ============================================================================
// COMMISSION FACTORY & RESOLVER
// ============================================================================

class CommissionCalculator {
  private strategies: Record<number, ICommissionStrategy> = {
    1: new FixedCommissionStrategy(),
    2: new PercentualCommissionStrategy(),
    3: new ScaledCommissionStrategy(),
    4: new PerformanceCommissionStrategy(),
    5: new RecurringCommissionStrategy(),
    6: new ProductCommissionStrategy(),
    7: new NetProfitCommissionStrategy(),
  };

  /**
   * Calculate commission for a sale given a rule
   */
  calculate(
    sale: Sale,
    rule: CommissionRule,
    seller: Seller,
    performanceData?: Record<string, unknown>
  ): CommissionCalculationResult {
    const strategy = this.strategies[rule.typeId];
    if (!strategy) {
      throw new Error(`Unknown commission type: ${rule.typeId}`);
    }

    // Validate rule config
    const validation = strategy.validate(rule.config);
    if (!validation.valid) {
      throw new Error(`Invalid rule config: ${validation.errors.join('; ')}`);
    }

    // Calculate
    let commissionValue: number;
    if (rule.typeId === 4 && performanceData) {
      // Performance commission needs extra context
      commissionValue = (strategy as PerformanceCommissionStrategy).calculate(
        sale,
        rule,
        seller,
        performanceData as { achievementPct: number }
      );
    } else {
      commissionValue = strategy.calculate(sale, rule, seller);
    }

    // Sanity checks
    if (commissionValue < 0) {
      throw new Error('Commission cannot be negative');
    }
    if (commissionValue > sale.netValue) {
      throw new Error('Commission cannot exceed sale net value');
    }

    return {
      baseValue: sale.netValue,
      commissionValue,
      ruleId: rule.id,
      typeId: rule.typeId,
      calculationDetails: {
        saleId: sale.id,
        sellerId: seller.id,
        ruleType: ['FIXA', 'PERCENTUAL', 'ESCALAS', 'PERFORMANCE', 'RECORRENTE', 'PRODUTO', 'LUCRO_LIQUIDO'][rule.typeId - 1],
        config: rule.config,
      },
    };
  }

  /**
   * Find active rule for a seller + context
   */
  findApplicableRule(
    rules: CommissionRule[],
    sale: Sale,
    seller: Seller
  ): CommissionRule {
    const now = new Date();

    // Filter active rules
    const active = rules.filter(
      r =>
        r.active &&
        new Date(r.validFrom) <= now &&
        (!r.validTo || new Date(r.validTo) >= now)
    );

    if (active.length === 0) {
      throw new Error('No active commission rules found');
    }

    // For simplicity, return first active. In production, could use:
    // - seller tier (priority)
    // - product category specificity (product rules over general)
    // - recently updated (latest wins)
    return active[0];
  }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
// Example: Calculate commission for a sale
const calculator = new CommissionCalculator();

const sale: Sale = {
  id: '123',
  sellerId: 'seller-abc',
  netValue: 5000,
  category: 'software',
  productName: 'License Pro',
  createdAt: new Date(),
};

const rule: CommissionRule = {
  id: 'rule-456',
  typeId: 3, // ESCALAS
  config: {
    scales: [
      { min: 0, max: 10000, pct: 3 },
      { min: 10000, pct: 5 },
    ],
  },
  validFrom: new Date('2024-01-01'),
  validTo: new Date('2024-12-31'),
  active: true,
};

const seller: Seller = { id: 'seller-abc', name: 'João Silva', role: 'COMERCIAL' };

try {
  const result = calculator.calculate(sale, rule, seller);
  console.log('Commission:', result.commissionValue); // 150 (5000 * 3% for scale 0-10k)
} catch (err) {
  console.error('Calculation error:', err.message);
}
*/

// ============================================================================
// EXPORT
// ============================================================================

export { CommissionCalculator, CommissionCalculationResult, CommissionRule, Sale, Seller };
