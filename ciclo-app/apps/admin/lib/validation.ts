/**
 * Event form validation utilities.
 * Client-side validation with Portuguese error messages.
 */

export interface EventFormErrors {
  name?: string
  slug?: string
  startDate?: string
  endDate?: string
  capacity?: string
  general?: string
}

export interface EventFormData {
  name: string
  subtitle: string
  slug: string
  season: string
  astronomicalEvent: string
  startDate: string
  endDate: string
  elementMTC: string
  organMTC: string
  description: string
  includedPractices: string[]
  capacity: string
  venue: string
  isPublished: boolean
  isSoldOut: boolean
}

export function validateEventForm(data: EventFormData): EventFormErrors {
  const errors: EventFormErrors = {}

  // Name: required, max 100 chars
  if (!data.name.trim()) {
    errors.name = 'Nome é obrigatório'
  } else if (data.name.length > 100) {
    errors.name = 'Nome deve ter no máximo 100 caracteres'
  }

  // Slug: required
  if (!data.slug.trim()) {
    errors.slug = 'Slug é obrigatório'
  }

  // Dates: start before end
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    if (start >= end) {
      errors.endDate = 'Data fim deve ser posterior a data inicio'
    }
  }

  if (!data.startDate) {
    errors.startDate = 'Data inicio é obrigatória'
  }

  if (!data.endDate) {
    errors.endDate = 'Data fim é obrigatória'
  }

  // Capacity: minimum 1
  const capacityNum = parseInt(data.capacity, 10)
  if (data.capacity && (isNaN(capacityNum) || capacityNum < 1)) {
    errors.capacity = 'Capacidade deve ser no mínimo 1'
  }

  return errors
}

export function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0
}

// ============================================================
// Facilitator Validation
// ============================================================

export interface FacilitatorFormErrors {
  name?: string
  email?: string
  general?: string
}

export interface FacilitatorFormData {
  name: string
  role: string
  bio: string
  photoUrl: string
  instagram: string
  email: string
  phone: string
  specialties: string[]
  isFeatured: boolean
}

/**
 * Normalize instagram handle: remove @ if present, trim whitespace.
 */
export function normalizeInstagram(value: string): string {
  return value.trim().replace(/^@/, '')
}

// ============================================================
// Activity Validation
// ============================================================

export interface ActivityFormErrors {
  title?: string
  time?: string
  durationMinutes?: string
  general?: string
}

export interface ActivityFormData {
  time: string
  title: string
  description: string
  durationMinutes: string
  facilitatorId: string
}

export function validateActivityForm(data: ActivityFormData): ActivityFormErrors {
  const errors: ActivityFormErrors = {}

  // Title: required, max 150 chars
  if (!data.title.trim()) {
    errors.title = 'Título é obrigatório'
  } else if (data.title.length > 150) {
    errors.title = 'Título deve ter no máximo 150 caracteres'
  }

  // Time: required, HH:MM format check (the datetime-local input handles format)
  if (!data.time) {
    errors.time = 'Horário é obrigatório'
  }

  // Duration: >= 1
  const duration = parseInt(data.durationMinutes, 10)
  if (!data.durationMinutes || isNaN(duration) || duration < 1) {
    errors.durationMinutes = 'Duração deve ser no mínimo 1 minuto'
  }

  return errors
}

// ============================================================
// Room (Accommodation) Validation
// ============================================================

export interface RoomFormErrors {
  name?: string
  priceReais?: string
  capacity?: string
  general?: string
}

export interface RoomFormData {
  name: string
  theme: string
  description: string
  priceReais: string
  capacity: string
  isAvailable: boolean
}

export function validateRoomForm(data: RoomFormData): RoomFormErrors {
  const errors: RoomFormErrors = {}

  // Name: required, max 100 chars
  if (!data.name.trim()) {
    errors.name = 'Nome é obrigatório'
  } else if (data.name.length > 100) {
    errors.name = 'Nome deve ter no máximo 100 caracteres'
  }

  // Price: required, valid number > 0
  if (!data.priceReais.trim()) {
    errors.priceReais = 'Preco é obrigatório'
  } else {
    const price = parseFloat(data.priceReais.replace(',', '.'))
    if (isNaN(price) || price <= 0) {
      errors.priceReais = 'Preco deve ser um valor positivo'
    }
  }

  // Capacity: required, minimum 1
  const capacityNum = parseInt(data.capacity, 10)
  if (!data.capacity || isNaN(capacityNum) || capacityNum < 1) {
    errors.capacity = 'Capacidade deve ser no mínimo 1'
  }

  return errors
}

export function validateFacilitatorForm(data: FacilitatorFormData): FacilitatorFormErrors {
  const errors: FacilitatorFormErrors = {}

  // Name: required, max 100 chars
  if (!data.name.trim()) {
    errors.name = 'Nome é obrigatório'
  } else if (data.name.length > 100) {
    errors.name = 'Nome deve ter no máximo 100 caracteres'
  }

  // Email: valid format if filled
  if (data.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Formato de email inválido'
    }
  }

  return errors
}
