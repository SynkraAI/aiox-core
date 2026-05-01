import Purchases, { LOG_LEVEL, PURCHASES_ERROR_CODE } from 'react-native-purchases'
import type { PurchasesOfferings, PurchasesPackage } from 'react-native-purchases'

export { PURCHASES_ERROR_CODE }
export type { PurchasesOfferings, PurchasesPackage }

export function configurePurchases(): void {
  const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_KEY
  if (!apiKey) {
    console.warn('[RevenueCat] EXPO_PUBLIC_REVENUECAT_KEY não configurada — SDK desativado')
    return
  }
  Purchases.setLogLevel(LOG_LEVEL.DEBUG)
  Purchases.configure({ apiKey })
}

export async function purchasesLogIn(userId: string): Promise<void> {
  if (!process.env.EXPO_PUBLIC_REVENUECAT_KEY) return
  await Purchases.logIn(userId)
}

export async function purchasesLogOut(): Promise<void> {
  if (!process.env.EXPO_PUBLIC_REVENUECAT_KEY) return
  await Purchases.logOut()
}

export async function getOfferings(): Promise<PurchasesOfferings> {
  return Purchases.getOfferings()
}

export async function purchasePackage(pkg: PurchasesPackage) {
  return Purchases.purchasePackage(pkg)
}

export async function restorePurchases() {
  return Purchases.restorePurchases()
}
