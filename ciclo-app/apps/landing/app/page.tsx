export const revalidate = 3600 // ISR: revalidar a cada 1 hora

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <h1 className="text-5xl font-heading text-base-dark text-center">
        Ciclo das Estações
      </h1>
      <p className="mt-6 max-w-2xl text-center text-xl text-base-dark/70 font-body">
        O primeiro programa de autocuidado cíclico do Brasil.
        Reconecte-se com os ritmos da natureza.
      </p>
      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-[#90EE90]/20 p-6 text-center">
          <span className="text-2xl">🌱</span>
          <p className="mt-2 text-sm font-body">Primavera</p>
        </div>
        <div className="rounded-2xl bg-[#FFD700]/20 p-6 text-center">
          <span className="text-2xl">☀️</span>
          <p className="mt-2 text-sm font-body">Verão</p>
        </div>
        <div className="rounded-2xl bg-[#D2691E]/20 p-6 text-center">
          <span className="text-2xl">🍂</span>
          <p className="mt-2 text-sm font-body">Outono</p>
        </div>
        <div className="rounded-2xl bg-[#4682B4]/20 p-6 text-center">
          <span className="text-2xl">❄️</span>
          <p className="mt-2 text-sm font-body">Inverno</p>
        </div>
      </div>
    </div>
  )
}
