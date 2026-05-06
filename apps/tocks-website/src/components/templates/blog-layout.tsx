interface BlogLayoutProps {
  children: React.ReactNode
}

export function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <main className="pt-32 pb-20">
      <article className="container-custom max-w-3xl mx-auto">
        {children}
      </article>
    </main>
  )
}
