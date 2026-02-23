export interface ValidationErrors {
  name?: string;
  email?: string;
  whatsapp?: string;
}

export function validateLeadData(data: { name: string; email: string; whatsapp: string }): ValidationErrors {
  const errors: ValidationErrors = {};

  if (data.name.trim().length < 2) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email.trim())) {
    errors.email = 'Email inválido';
  }

  if (data.whatsapp.trim()) {
    const cleaned = data.whatsapp.replace(/[\s\-()]/g, '');
    const whatsappRegex = /^\+?55?\d{10,11}$/;
    if (!whatsappRegex.test(cleaned)) {
      errors.whatsapp = 'Número de WhatsApp inválido';
    }
  }

  return errors;
}
