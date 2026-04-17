import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SwatchPicker } from '@/components/molecules/swatch-picker'

describe('SwatchPicker', () => {
  it('renders a radiogroup with the supplied label', () => {
    render(
      <SwatchPicker value="oak" onChange={() => {}} label="Madeira">
        <SwatchPicker.Option value="oak" caption="Carvalho" />
        <SwatchPicker.Option value="walnut" caption="Nogueira" />
      </SwatchPicker>,
    )
    expect(screen.getByRole('radiogroup', { name: 'Madeira' })).toBeInTheDocument()
  })

  it('renders one radio per Option child', () => {
    render(
      <SwatchPicker value="a" onChange={() => {}}>
        <SwatchPicker.Option value="a" caption="A" />
        <SwatchPicker.Option value="b" caption="B" />
        <SwatchPicker.Option value="c" caption="C" />
      </SwatchPicker>,
    )
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('marks only the active option with aria-checked="true"', () => {
    render(
      <SwatchPicker value="b" onChange={() => {}}>
        <SwatchPicker.Option value="a" caption="A" />
        <SwatchPicker.Option value="b" caption="B" />
        <SwatchPicker.Option value="c" caption="C" />
      </SwatchPicker>,
    )
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toHaveAttribute('aria-checked', 'false')
    expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    expect(radios[2]).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange with option value when clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <SwatchPicker value="a" onChange={onChange}>
        <SwatchPicker.Option value="a" caption="A" />
        <SwatchPicker.Option value="b" caption="B" />
      </SwatchPicker>,
    )
    await user.click(screen.getAllByRole('radio')[1])
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('exposes aria-live polite announce text reflecting current value', () => {
    const { container } = render(
      <SwatchPicker value="walnut" onChange={() => {}} label="Madeira">
        <SwatchPicker.Option value="walnut" caption="Nogueira" />
      </SwatchPicker>,
    )
    const live = container.querySelector('[aria-live="polite"]')
    expect(live?.textContent).toBe('Madeira selecionada: walnut')
  })

  it('throws when Option is rendered outside SwatchPicker', () => {
    const Spy = console.error
    console.error = () => {} // suppress React tree boundary noise in test output
    expect(() =>
      render(<SwatchPicker.Option value="x" caption="X" />),
    ).toThrow(/must render inside SwatchPicker/)
    console.error = Spy
  })
})
