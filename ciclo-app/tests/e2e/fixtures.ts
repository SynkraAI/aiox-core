/**
 * E2E Test Fixtures — Story E4.6 (AC-7)
 *
 * Helper functions to create/cleanup test data via Prisma.
 * All test data uses "e2e-test-" prefix for safe cleanup.
 */
import { PrismaClient, UserRole, Season, PaymentMethod } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const E2E_PREFIX = 'e2e-test-'
const TEST_PASSWORD = 'E2eTest@2026!'

export interface TestAdmin {
  id: string
  email: string
  name: string
  password: string
}

export interface TestUser {
  id: string
  email: string
  name: string
  password: string
}

export interface TestEvent {
  id: string
  slug: string
  name: string
  ticketTypes: Array<{
    id: string
    name: string
    regularPrice: number
  }>
}

/**
 * Create a test user with ADMIN role (AC-7)
 */
export async function createTestAdmin(): Promise<TestAdmin> {
  const email = `${E2E_PREFIX}admin-${Date.now()}@test.local`
  const hashedPassword = await hash(TEST_PASSWORD, 10)

  const user = await prisma.user.create({
    data: {
      email,
      name: `${E2E_PREFIX}Admin User`,
      password: hashedPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  })

  return {
    id: user.id,
    email,
    name: user.name,
    password: TEST_PASSWORD,
  }
}

/**
 * Create a regular test user with USER role (AC-7)
 */
export async function createTestUser(): Promise<TestUser> {
  const email = `${E2E_PREFIX}user-${Date.now()}@test.local`
  const hashedPassword = await hash(TEST_PASSWORD, 10)

  const user = await prisma.user.create({
    data: {
      email,
      name: `${E2E_PREFIX}Regular User`,
      password: hashedPassword,
      role: UserRole.USER,
      emailVerified: new Date(),
    },
  })

  return {
    id: user.id,
    email,
    name: user.name,
    password: TEST_PASSWORD,
  }
}

/**
 * Create a published event with ticket types (AC-7)
 */
export async function createTestEvent(): Promise<TestEvent> {
  const slug = `${E2E_PREFIX}evento-${Date.now()}`
  const now = new Date()
  const startDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // +30 days
  const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000) // +3 days

  const event = await prisma.event.create({
    data: {
      slug,
      name: `${E2E_PREFIX}Evento Outono`,
      subtitle: 'Retiro de reconexão com a natureza',
      season: Season.AUTUMN,
      startDate,
      endDate,
      venue: 'Espaco Triade - Itajai/SC',
      capacity: 30,
      isPublished: true,
      description: '<p>Um retiro imersivo para conectar com os ciclos da natureza.</p>',
      includedPractices: ['Yoga', 'Meditação', 'Ayurveda'],
      ticketTypes: {
        create: [
          {
            name: 'Integral',
            description: 'Acesso completo ao retiro com hospedagem',
            regularPrice: 120000, // R$ 1.200,00
            earlyBirdPrice: 99000, // R$ 990,00
            earlyBirdDeadline: startDate,
            quantityAvailable: 20,
            includes: ['Hospedagem', 'Alimentação', 'Todas as práticas'],
          },
          {
            name: 'Day Use',
            description: 'Acesso diurno sem hospedagem',
            regularPrice: 35000, // R$ 350,00
            earlyBirdPrice: 28000, // R$ 280,00
            earlyBirdDeadline: startDate,
            quantityAvailable: 10,
            includes: ['Alimentação diurna', 'Práticas do dia'],
          },
        ],
      },
      activities: {
        create: [
          {
            title: 'Abertura do Círculo',
            description: 'Cerimônia de abertura e intenções',
            time: new Date(startDate.getTime() + 10 * 60 * 60 * 1000), // 10h
            durationMinutes: 90,
            order: 1,
          },
          {
            title: 'Prática de Yoga',
            description: 'Yoga restaurativo com foco sazonal',
            time: new Date(startDate.getTime() + 14 * 60 * 60 * 1000), // 14h
            durationMinutes: 60,
            order: 2,
          },
        ],
      },
      faqs: {
        create: [
          {
            question: 'Preciso ter experiência prévia?',
            answer: 'Nao, o retiro e aberto a todos os níveis.',
            order: 1,
          },
          {
            question: 'O que levar?',
            answer: 'Roupas confortaveis, tapete de yoga e itens pessoais.',
            order: 2,
          },
        ],
      },
    },
    include: {
      ticketTypes: true,
    },
  })

  return {
    id: event.id,
    slug: event.slug,
    name: event.name,
    ticketTypes: event.ticketTypes.map((t) => ({
      id: t.id,
      name: t.name,
      regularPrice: t.regularPrice,
    })),
  }
}

/**
 * Create a confirmed registration with QR code for a user+event (used by QR Code tests)
 */
export async function createTestRegistration(
  userId: string,
  eventId: string,
  ticketTypeId: string,
): Promise<{ id: string; qrCode: string }> {
  const qrCode = `${E2E_PREFIX}qr-${Date.now()}`

  const registration = await prisma.registration.create({
    data: {
      userId,
      eventId,
      ticketTypeId,
      status: 'CONFIRMED',
      qrCode,
      payments: {
        create: {
          amount: 120000,
          method: PaymentMethod.PIX,
          status: 'APPROVED',
          confirmedAt: new Date(),
        },
      },
    },
  })

  return {
    id: registration.id,
    qrCode,
  }
}

/**
 * Remove all test records created by fixtures (AC-7)
 * Matches any record with e2e-test- prefix.
 */
export async function cleanupTestData(): Promise<void> {
  // Delete in dependency order to avoid FK violations
  await prisma.payment.deleteMany({
    where: {
      registration: {
        user: { email: { startsWith: E2E_PREFIX } },
      },
    },
  })

  await prisma.registration.deleteMany({
    where: {
      user: { email: { startsWith: E2E_PREFIX } },
    },
  })

  await prisma.activity.deleteMany({
    where: {
      event: { slug: { startsWith: E2E_PREFIX } },
    },
  })

  await prisma.fAQ.deleteMany({
    where: {
      event: { slug: { startsWith: E2E_PREFIX } },
    },
  })

  await prisma.ticketType.deleteMany({
    where: {
      event: { slug: { startsWith: E2E_PREFIX } },
    },
  })

  await prisma.event.deleteMany({
    where: { slug: { startsWith: E2E_PREFIX } },
  })

  await prisma.user.deleteMany({
    where: { email: { startsWith: E2E_PREFIX } },
  })
}

/**
 * Disconnect Prisma client — call in global teardown
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect()
}
