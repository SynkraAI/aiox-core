import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FaqItem } from '@/components/molecules/faq-item'

describe('FaqItem', () => {
  it('renders question in summary and answer in body', () => {
    render(<FaqItem question="Quanto tempo leva?" answer="Cerca de 90 dias." />)
    expect(screen.getByText('Quanto tempo leva?')).toBeInTheDocument()
    expect(screen.getByText('Cerca de 90 dias.')).toBeInTheDocument()
  })

  it('starts collapsed (details has no open attribute)', () => {
    const { container } = render(
      <FaqItem question="Q" answer="A" />,
    )
    const details = container.querySelector('details')
    expect(details?.open).toBe(false)
  })

  it('toggles open on summary click', async () => {
    const user = userEvent.setup()
    const { container } = render(<FaqItem question="Q" answer="A" />)
    const details = container.querySelector('details') as HTMLDetailsElement
    const summary = container.querySelector('summary') as HTMLElement

    await user.click(summary)
    expect(details.open).toBe(true)

    await user.click(summary)
    expect(details.open).toBe(false)
  })

  it('applies custom className to the details wrapper', () => {
    const { container } = render(
      <FaqItem question="Q" answer="A" className="custom-faq" />,
    )
    expect(container.querySelector('details')).toHaveClass('custom-faq')
  })

  it('uses the chevron icon (svg) inside summary, marked aria-hidden', () => {
    const { container } = render(<FaqItem question="Q" answer="A" />)
    const svg = container.querySelector('summary svg')
    expect(svg).not.toBeNull()
    const wrapper = svg?.parentElement
    expect(wrapper?.getAttribute('aria-hidden')).toBe('true')
  })
})
