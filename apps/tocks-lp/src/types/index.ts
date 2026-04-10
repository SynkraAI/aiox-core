export interface ProductSpecs {
  dimensions: string
  weight: string
  material: string
  fabric: string
  slate: string
  legs: string
}

export interface Product {
  id: string
  name: string
  price: number
  line: 'criativa' | 'premium'
  tagline: string
  description: string
  image: string
  images: string[]
  slug: string
  specs: ProductSpecs
}

export interface FAQ {
  id: string
  question: string
  answer: string
}

export interface Testimonial {
  id: string
  name: string
  city: string
  text: string
  rating: number
  model: string
}

export interface ProcessStep {
  id: string
  step: number
  title: string
  description: string
  icon: string
}

export interface Feature {
  id: string
  title: string
  description: string
  icon: string
}

export type ButtonVariant = 'primary' | 'secondary' | 'whatsapp'
export type ButtonSize = 'sm' | 'md' | 'lg'
