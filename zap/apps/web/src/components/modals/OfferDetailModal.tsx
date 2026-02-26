'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import type { CapturedOffer } from '@/stores/captured-offers'

interface OfferDetailModalProps {
  offer: CapturedOffer | null
  isOpen: boolean
  onClose: () => void
}

export function OfferDetailModal({
  offer,
  isOpen,
  onClose,
}: OfferDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !offer) return null

  const getMarketplaceColor = (marketplace: string) => {
    const colors: Record<string, string> = {
      shopee: 'text-orange-600',
      mercadolivre: 'text-yellow-600',
      amazon: 'text-blue-600',
    }
    return colors[marketplace] || 'text-gray-600'
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      new: { bg: 'bg-blue-100', text: 'text-blue-800' },
      pending_substitution: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      ready: { bg: 'bg-green-100', text: 'text-green-800' },
      sent: { bg: 'bg-purple-100', text: 'text-purple-800' },
      expired: { bg: 'bg-gray-100', text: 'text-gray-800' },
    }

    const style = styles[status] || { bg: 'bg-gray-100', text: 'text-gray-800' }

    const label = status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${style.bg} ${style.text}`}>
        {label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-50 border-b px-6 py-4 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {offer.product_title}
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-mono">
              ID: {offer.product_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Image */}
          {offer.product_image_url && (
            <div className="flex justify-center">
              <Image
                src={offer.product_image_url}
                alt={offer.product_title}
                width={256}
                height={256}
                className="max-h-64 rounded-lg object-cover"
              />
            </div>
          )}

          {/* Status & Marketplace */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Status</p>
              {getStatusBadge(offer.status)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Marketplace</p>
              <span className={`text-lg font-semibold ${getMarketplaceColor(offer.marketplace)}`}>
                {offer.marketplace === 'mercadolivre'
                  ? 'Mercado Livre'
                  : offer.marketplace.charAt(0).toUpperCase() +
                    offer.marketplace.slice(1)}
              </span>
            </div>
          </div>

          {/* Prices */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Original Price</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(offer.original_price)}
              </p>
            </div>

            {offer.discounted_price < offer.original_price && (
              <>
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-600">Discounted Price</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(offer.discounted_price)}
                  </p>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-600">Discount</p>
                  <p className="text-xl font-bold text-green-600">
                    -{offer.discount_percent}%
                  </p>
                </div>
              </>
            )}
          </div>

          {/* URLs & Affiliate */}
          <div className="space-y-3">
            {offer.original_url && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Product URL
                </p>
                <a
                  href={offer.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm break-all"
                >
                  {offer.original_url}
                </a>
              </div>
            )}

            {offer.original_affiliate_id && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Affiliate ID
                </p>
                <p className="text-sm text-gray-900 font-mono">
                  {offer.original_affiliate_id}
                </p>
              </div>
            )}
          </div>

          {/* Source & Timestamps */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Source Group
              </p>
              <p className="text-sm text-gray-900">
                {offer.source_group_jid}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Captured At
              </p>
              <p className="text-sm text-gray-900">
                {formatDate(offer.captured_at)}
              </p>
            </div>
          </div>

          {/* Deduplication Info */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm font-medium text-gray-600 mb-2">
              Deduplication Hash
            </p>
            <p className="text-xs text-gray-900 font-mono break-all">
              {offer.dedup_hash}
            </p>

            {offer.is_duplicate && (
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  ⚠️ This is a duplicate offer
                </p>
                {offer.duplicate_of_offer_id && (
                  <p className="text-xs text-yellow-700">
                    Original offer ID: {offer.duplicate_of_offer_id}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Expiration */}
          {offer.expires_at && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-sm font-medium text-gray-600">
                Expires at
              </p>
              <p className="text-sm text-gray-900">
                {formatDate(offer.expires_at)}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
