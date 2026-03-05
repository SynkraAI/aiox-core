/**
 * Seed de Producao — Ciclo das Estacoes
 * Story: E4.7 — Checklist de Lancamento (AC-5)
 *
 * Dados iniciais para o ambiente de producao:
 * - 1 admin user (Bob)
 * - Facilitadoras iniciais (Daniela Lopper, Milena Koch) como isFeatured
 * - 5 espacos Casa do Sol (R$250/noite cada)
 * - Politica de cancelamento global
 * - 1 evento template (Outono 2026)
 * - Produto Passaporte Anual (R$1.997)
 *
 * Precos em CENTAVOS (Int) — R$250 = 25000
 *
 * Uso: cd packages/database && npx prisma db seed
 */

import { PrismaClient, Season, AstronomicalEvent, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding production database...\n')

  // ----------------------------------------------------------
  // 1. Admin User — Bob (ADMIN)
  // ----------------------------------------------------------
  const admin = await prisma.user.upsert({
    where: { email: 'bob@basetriade.com' },
    update: {
      name: 'Bob',
      role: UserRole.ADMIN,
    },
    create: {
      email: 'bob@basetriade.com',
      name: 'Bob',
      role: UserRole.ADMIN,
      // Password set on first login via auth flow
    },
  })
  console.log(`  [OK] Admin user: ${admin.name} (${admin.email})`)

  // ----------------------------------------------------------
  // 2. Facilitadoras Iniciais (isFeatured)
  // ----------------------------------------------------------
  const daniela = await prisma.facilitator.upsert({
    where: { id: 'facilitator-daniela-lopper' },
    update: {
      name: 'Daniela Lopper',
      role: 'Apresentadora e Facilitadora',
      bio: 'Criadora do @podprana, referencia em saude integrativa e bem-estar.',
      instagram: '@podprana',
      specialties: ['Saude Integrativa', 'Bem-estar', 'Facilitacao'],
      isFeatured: true,
    },
    create: {
      id: 'facilitator-daniela-lopper',
      name: 'Daniela Lopper',
      role: 'Apresentadora e Facilitadora',
      bio: 'Criadora do @podprana, referencia em saude integrativa e bem-estar.',
      instagram: '@podprana',
      specialties: ['Saude Integrativa', 'Bem-estar', 'Facilitacao'],
      isFeatured: true,
    },
  })
  console.log(`  [OK] Facilitadora: ${daniela.name} (${daniela.instagram})`)

  const milena = await prisma.facilitator.upsert({
    where: { id: 'facilitator-milena-koch' },
    update: {
      name: 'Milena Koch',
      role: 'Facilitadora Principal',
      bio: 'Especialista em terapias naturais e medicina integrativa.',
      instagram: '@koch.milenar',
      specialties: ['Terapias Naturais', 'Medicina Integrativa'],
      isFeatured: true,
    },
    create: {
      id: 'facilitator-milena-koch',
      name: 'Milena Koch',
      role: 'Facilitadora Principal',
      bio: 'Especialista em terapias naturais e medicina integrativa.',
      instagram: '@koch.milenar',
      specialties: ['Terapias Naturais', 'Medicina Integrativa'],
      isFeatured: true,
    },
  })
  console.log(`  [OK] Facilitadora: ${milena.name} (${milena.instagram})`)

  // ----------------------------------------------------------
  // 3. Espacos Casa do Sol — 5 quartos (R$250/noite cada)
  // ----------------------------------------------------------
  const roomsData = [
    {
      id: 'room-quarto-terra',
      name: 'Quarto Terra',
      theme: 'Elemento Terra',
      description: 'Quarto com decoracao em tons terrosos, materiais naturais e conexao com a estabilidade da terra.',
      pricePerNight: 25000, // R$250
      capacity: 2,
    },
    {
      id: 'room-quarto-agua',
      name: 'Quarto Agua',
      theme: 'Elemento Agua',
      description: 'Quarto em tons azuis e fluidos, remetendo a fluidez e profundidade do elemento agua.',
      pricePerNight: 25000, // R$250
      capacity: 2,
    },
    {
      id: 'room-quarto-fogo',
      name: 'Quarto Fogo',
      theme: 'Elemento Fogo',
      description: 'Quarto com tons quentes e vibrantes, representando a energia transformadora do fogo.',
      pricePerNight: 25000, // R$250
      capacity: 2,
    },
    {
      id: 'room-quarto-ar',
      name: 'Quarto Ar',
      theme: 'Elemento Ar',
      description: 'Quarto leve e arejado, com tons claros que remetem a leveza e expansao do ar.',
      pricePerNight: 25000, // R$250
      capacity: 2,
    },
    {
      id: 'room-cabana-beija-flor',
      name: 'Cabana Beija-Flor',
      theme: 'Natureza Viva',
      description: 'Cabana independente cercada pela natureza, perfeita para conexao com o ambiente natural.',
      pricePerNight: 25000, // R$250
      capacity: 2,
    },
  ]

  for (const room of roomsData) {
    await prisma.room.upsert({
      where: { id: room.id },
      update: {
        name: room.name,
        theme: room.theme,
        description: room.description,
        pricePerNight: room.pricePerNight,
        capacity: room.capacity,
        isAvailable: true,
      },
      create: {
        ...room,
        isAvailable: true,
      },
    })
  }
  console.log(`  [OK] Espacos Casa do Sol: ${roomsData.length} quartos (R$250/noite cada)`)

  // ----------------------------------------------------------
  // 4. Politica de Cancelamento Global
  // ----------------------------------------------------------
  // PRD: +15d = 80%, 7-14d = 50%, <7d = 0%, transferencia sempre permitida
  const existingGlobalPolicy = await prisma.cancellationPolicy.findFirst({
    where: { eventId: null, isActive: true },
  })

  if (!existingGlobalPolicy) {
    await prisma.cancellationPolicy.create({
      data: {
        eventId: null, // Global default (nao vinculado a evento)
        earlyDaysThreshold: 15,
        earlyRefundPercent: 80,
        midDaysLowerThreshold: 7,
        midRefundPercent: 50,
        transferAllowed: true,
        description:
          'Politica padrao: cancelamento com mais de 15 dias = reembolso de 80%. ' +
          'Entre 7 e 14 dias = reembolso de 50%. Menos de 7 dias = sem reembolso. ' +
          'Transferencia de ingresso permitida a qualquer momento.',
        isActive: true,
      },
    })
    console.log('  [OK] Politica de cancelamento global criada')
  } else {
    console.log('  [SKIP] Politica de cancelamento global ja existe')
  }

  // ----------------------------------------------------------
  // 5. Evento Template — Outono 2026
  // ----------------------------------------------------------
  const event = await prisma.event.upsert({
    where: { slug: 'outono-2026' },
    update: {},
    create: {
      slug: 'outono-2026',
      season: Season.AUTUMN,
      name: 'Outono 2026',
      subtitle: 'Ciclo do Outono — Colheita e Recolhimento',
      astronomicalEvent: AstronomicalEvent.AUTUMN_EQUINOX,
      startDate: new Date('2026-05-16T08:00:00-03:00'),
      endDate: new Date('2026-05-17T18:00:00-03:00'),
      elementMTC: 'Metal',
      organMTC: 'Pulmao',
      description:
        'O Outono 2026 e o primeiro evento oficial do Ciclo das Estacoes. ' +
        'Uma jornada imersiva de colheita interior, praticas integrativas e ' +
        'reconexao com os ritmos naturais na transicao para o outono.',
      includedPractices: [
        'Yoga',
        'Meditacao',
        'Sound Healing',
        'Nutricao Ayurvedica',
        'Terapias Naturais',
      ],
      capacity: 50,
      venue: 'Casa do Sol — Base Triade, Itajai/SC',
      isPublished: false, // Publicar manualmente quando pronto
      isSoldOut: false,
    },
  })
  console.log(`  [OK] Evento template: ${event.name} (${event.slug})`)

  // Vincular facilitadoras ao evento
  for (const facilitator of [daniela, milena]) {
    await prisma.eventFacilitator.upsert({
      where: {
        eventId_facilitatorId: {
          eventId: event.id,
          facilitatorId: facilitator.id,
        },
      },
      update: {},
      create: {
        eventId: event.id,
        facilitatorId: facilitator.id,
      },
    })
  }
  console.log('  [OK] Facilitadoras vinculadas ao evento')

  // Tipos de ingresso basicos
  const ticketTypesData = [
    {
      name: 'Passaporte Completo',
      description: 'Acesso completo ao evento (sabado + domingo), incluindo todas as atividades e alimentacao.',
      includes: [
        'Acesso a todas as atividades',
        'Alimentacao consciente inclusa',
        'Material de apoio',
        'Certificado de participacao',
      ],
      earlyBirdPrice: 28700, // R$287
      regularPrice: 34700, // R$347
      lastMinutePrice: 39700, // R$397
      earlyBirdDeadline: new Date('2026-04-30T23:59:59-03:00'),
      lastMinuteStart: new Date('2026-05-13T00:00:00-03:00'),
      quantityAvailable: 40,
      quantitySold: 0,
    },
    {
      name: 'Day Pass Sabado',
      description: 'Acesso ao dia principal do evento no sabado.',
      includes: [
        'Acesso sabado completo',
        'Alimentacao inclusa',
        'Participacao nas atividades do dia',
      ],
      earlyBirdPrice: 19700, // R$197
      regularPrice: 24700, // R$247
      lastMinutePrice: 29700, // R$297
      earlyBirdDeadline: new Date('2026-04-30T23:59:59-03:00'),
      lastMinuteStart: new Date('2026-05-13T00:00:00-03:00'),
      quantityAvailable: 50,
      quantitySold: 0,
    },
  ]

  for (const tt of ticketTypesData) {
    // Check if ticket type already exists for this event
    const existing = await prisma.ticketType.findFirst({
      where: { eventId: event.id, name: tt.name },
    })
    if (!existing) {
      await prisma.ticketType.create({
        data: {
          eventId: event.id,
          ...tt,
        },
      })
    }
  }
  console.log(`  [OK] Tipos de ingresso: ${ticketTypesData.length} criados`)

  // ----------------------------------------------------------
  // 6. Produto — Passaporte Anual
  // ----------------------------------------------------------
  const existingProduct = await prisma.product.findFirst({
    where: { name: 'Passaporte Anual' },
  })

  if (!existingProduct) {
    await prisma.product.create({
      data: {
        name: 'Passaporte Anual',
        description: 'Acesso a todos os 4 eventos do ciclo completo (Primavera, Verao, Outono, Inverno).',
        price: 199700, // R$1.997
        benefits: [
          'Acesso a todos os 4 eventos do ano',
          'Desconto progressivo na Arvore Sazonal',
          'Prioridade nas inscricoes',
          'Comunidade exclusiva',
        ],
        installmentsAllowed: 12,
        discountCash: 19900, // R$199 desconto a vista
        isActive: true,
      },
    })
    console.log('  [OK] Produto: Passaporte Anual (R$1.997)')
  } else {
    console.log('  [SKIP] Produto Passaporte Anual ja existe')
  }

  // ----------------------------------------------------------
  // 7. SiteContent — Textos editaveis
  // ----------------------------------------------------------
  const siteContentData = [
    {
      key: 'hero_title',
      value: { text: 'Ciclo das Estacoes', subtitle: 'Reconecte-se com os ciclos da natureza' },
    },
    {
      key: 'hero_description',
      value: {
        text: 'Uma jornada imersiva de autoconhecimento e reconexao com a natureza atraves dos ciclos sazonais.',
      },
    },
    {
      key: 'contact_info',
      value: {
        email: 'contato@basetriade.com',
        phone: '(47) 99999-9999',
        instagram: '@ciclodasestacoes',
        address: 'Casa do Sol — Base Triade, Itajai/SC',
      },
    },
  ]

  for (const sc of siteContentData) {
    await prisma.siteContent.upsert({
      where: { key: sc.key },
      update: { value: sc.value },
      create: sc,
    })
  }
  console.log(`  [OK] SiteContent: ${siteContentData.length} entradas`)

  console.log('\n--- Seed de producao concluido com sucesso! ---\n')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Seed error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
