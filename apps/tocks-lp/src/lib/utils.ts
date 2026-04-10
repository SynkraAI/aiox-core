export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents)
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getLineName(line: string): string {
  const map: Record<string, string> = {
    criativa: 'Linha Criativa',
    premium: 'Linha Premium',
    pebolim: 'Linha Pebolim',
  }
  return map[line] ?? line
}
