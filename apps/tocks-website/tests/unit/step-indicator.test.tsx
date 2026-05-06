import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StepIndicator } from '@/components/molecules/step-indicator'

describe('StepIndicator', () => {
  it('renders the announce text "Etapa N de M" by default', () => {
    render(<StepIndicator steps={4} current={2} />)
    expect(screen.getByText('Etapa 2 de 4')).toBeInTheDocument()
  })

  it('honors custom label prop', () => {
    render(<StepIndicator steps={3} current={1} label="Passo" />)
    expect(screen.getByText('Passo 1 de 3')).toBeInTheDocument()
  })

  it('renders one <li> per step', () => {
    const { container } = render(<StepIndicator steps={5} current={3} />)
    expect(container.querySelectorAll('li').length).toBe(5)
  })

  it('marks the current step with aria-current="step"', () => {
    const { container } = render(<StepIndicator steps={3} current={2} />)
    const lis = container.querySelectorAll('li')
    expect(lis[0].getAttribute('aria-current')).toBeNull()
    expect(lis[1].getAttribute('aria-current')).toBe('step')
    expect(lis[2].getAttribute('aria-current')).toBeNull()
  })

  it('clamps current value below 1 to 1', () => {
    render(<StepIndicator steps={3} current={0} />)
    expect(screen.getByText('Etapa 1 de 3')).toBeInTheDocument()
  })

  it('clamps current value above steps to steps', () => {
    render(<StepIndicator steps={3} current={99} />)
    expect(screen.getByText('Etapa 3 de 3')).toBeInTheDocument()
  })

  it('exposes aria-live="polite" on the announce span', () => {
    const { container } = render(<StepIndicator steps={2} current={1} />)
    const live = container.querySelector('[aria-live="polite"]')
    expect(live).not.toBeNull()
    expect(live?.textContent).toBe('Etapa 1 de 2')
  })
})
