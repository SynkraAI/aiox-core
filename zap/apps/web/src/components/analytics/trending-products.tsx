/**
 * AC-051.3: Trending Products Component
 */

'use client'

import { useAnalyticsStore } from '@/stores/analytics'

export function TrendingProducts() {
  const { trendingProducts } = useAnalyticsStore()

  if (!trendingProducts || trendingProducts.length === 0) {
    return <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-600">No trending products</div>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Marketplace</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Times Captured</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Clicks</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Conversions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {trendingProducts.map((product, idx) => (
            <tr key={`${product.product_title}-${idx}`} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{product.product_title}</td>
              <td className="px-6 py-4 capitalize text-gray-600">{product.marketplace}</td>
              <td className="px-6 py-4 text-gray-600">{product.captured_count}</td>
              <td className="px-6 py-4 text-gray-600">{product.clicks}</td>
              <td className="px-6 py-4 text-gray-600">{product.conversions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
