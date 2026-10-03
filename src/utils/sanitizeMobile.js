// Keeps mobile/phone inputs to digits only and at most 10 characters.
export const sanitizeMobile = (value) => String(value ?? '').replace(/\D/g, '').slice(0, 10);