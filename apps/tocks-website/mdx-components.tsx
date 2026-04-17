import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="font-heading text-4xl font-semibold leading-[0.95] text-[var(--text-primary)] mb-8">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="font-heading text-3xl font-medium leading-[1.0] text-[var(--text-primary)] mb-6 mt-12">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display text-2xl font-light tracking-[0.05em] text-[var(--text-primary)] mb-4 mt-8">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="font-body text-base leading-[1.7] text-[var(--text-secondary)] mb-6">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-6 text-[var(--text-secondary)]">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-6 text-[var(--text-secondary)]">
        {children}
      </ol>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-[var(--accent-gold)] pl-6 my-6 italic text-[var(--text-secondary)]">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-[var(--text-primary)]">{children}</strong>
    ),
    ...components,
  }
}
