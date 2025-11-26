// Utilidades de validacion

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Validar campo requerido
export function required(value: string, fieldName?: string): ValidationResult {
  if (!value || !value.trim()) {
    return {
      valid: false,
      error: fieldName ? `${fieldName} es requerido` : 'Este campo es requerido'
    };
  }
  return { valid: true };
}

// Validar email
export function email(value: string): ValidationResult {
  if (!value) return { valid: true }; // Si está vacío, no validar (usar required para eso)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return {
      valid: false,
      error: 'Ingresa un email valido'
    };
  }
  return { valid: true };
}

// Validar telefono (formato flexible)
export function phone(value: string): ValidationResult {
  if (!value) return { valid: true };

  // Eliminar espacios, guiones y parentesis
  const cleaned = value.replace(/[\s\-\(\)\.]/g, '');

  // Verificar que solo contenga numeros y opcionalmente + al inicio
  const phoneRegex = /^\+?\d{7,15}$/;
  if (!phoneRegex.test(cleaned)) {
    return {
      valid: false,
      error: 'Ingresa un telefono valido'
    };
  }
  return { valid: true };
}

// Validar URL
export function url(value: string): ValidationResult {
  if (!value) return { valid: true };

  try {
    new URL(value);
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Ingresa una URL valida'
    };
  }
}

// Validar longitud minima
export function minLength(value: string, min: number, fieldName?: string): ValidationResult {
  if (!value) return { valid: true };

  if (value.length < min) {
    return {
      valid: false,
      error: fieldName
        ? `${fieldName} debe tener al menos ${min} caracteres`
        : `Minimo ${min} caracteres`
    };
  }
  return { valid: true };
}

// Validar longitud maxima
export function maxLength(value: string, max: number, fieldName?: string): ValidationResult {
  if (!value) return { valid: true };

  if (value.length > max) {
    return {
      valid: false,
      error: fieldName
        ? `${fieldName} no puede exceder ${max} caracteres`
        : `Maximo ${max} caracteres`
    };
  }
  return { valid: true };
}

// Validar precio (numero positivo)
export function price(value: number | string): ValidationResult {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return {
      valid: false,
      error: 'Ingresa un precio valido'
    };
  }

  if (num < 0) {
    return {
      valid: false,
      error: 'El precio no puede ser negativo'
    };
  }

  return { valid: true };
}

// Validar codigo postal (formato flexible)
export function postalCode(value: string): ValidationResult {
  if (!value) return { valid: true };

  // Formato flexible: 3-10 caracteres alfanumericos
  const cpRegex = /^[a-zA-Z0-9]{3,10}$/;
  if (!cpRegex.test(value.replace(/[\s\-]/g, ''))) {
    return {
      valid: false,
      error: 'Codigo postal invalido'
    };
  }
  return { valid: true };
}

// Componer validaciones
export function validate(
  value: string,
  validators: Array<(value: string) => ValidationResult>
): ValidationResult {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}

// Validar objeto completo
export interface FieldValidation {
  field: string;
  value: string | number;
  validators: Array<(value: string) => ValidationResult>;
}

export interface FormValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateForm(fields: FieldValidation[]): FormValidationResult {
  const errors: Record<string, string> = {};
  let valid = true;

  for (const { field, value, validators } of fields) {
    const strValue = typeof value === 'number' ? String(value) : value;
    const result = validate(strValue, validators);

    if (!result.valid && result.error) {
      errors[field] = result.error;
      valid = false;
    }
  }

  return { valid, errors };
}

// Helper para crear validadores con parametros
export const validators = {
  required: (fieldName?: string) => (value: string) => required(value, fieldName),
  email: () => email,
  phone: () => phone,
  url: () => url,
  minLength: (min: number, fieldName?: string) => (value: string) => minLength(value, min, fieldName),
  maxLength: (max: number, fieldName?: string) => (value: string) => maxLength(value, max, fieldName)
};
