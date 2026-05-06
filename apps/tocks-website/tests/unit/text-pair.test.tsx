import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TextPair } from '@/components/atoms/text-pair'

describe('TextPair', () => {
  it('renders label and value with default (spec) variant', () => {
    render(<TextPair label="Material" value="Carvalho macico" />)
    expect(screen.getByText('Material')).toBeInTheDocument()
    expect(screen.getByText('Carvalho macico')).toBeInTheDocument()
  })

  it('applies stat variant classes to value', () => {
    render(<TextPair label="Anos" value="15" as="stat" />)
    const value = screen.getByText('15')
    expect(value.className).toMatch(/text-5xl/)
    expect(value.className).toMatch(/font-heading/)
  })

  it('applies investimento variant with gold color class', () => {
    render(<TextPair label="A partir de" value="R$ 28.000" as="investimento" />)
    const value = screen.getByText('R$ 28.000')
    expect(value.className).toMatch(/accent-gold/)
  })

  it('passes through custom className on the wrapper', () => {
    const { container } = render(
      <TextPair label="X" value="Y" className="custom-wrap" />,
    )
    expect(container.firstChild).toHaveClass('custom-wrap')
  })

  it('uses uppercase styling for the label across all variants', () => {
    const variants = ['stat', 'spec', 'investimento'] as const
    for (const v of variants) {
      const { unmount } = render(<TextPair label={`L-${v}`} value="V" as={v} />)
      const label = screen.getByText(`L-${v}`)
      expect(label.className).toMatch(/uppercase/)
      unmount()
    }
  })
})
