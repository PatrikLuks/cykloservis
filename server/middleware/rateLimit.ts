import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 10, // max 10 pokusů za 15 minut
  message: { error: 'Příliš mnoho pokusů o přihlášení, zkuste to později.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hodina
  max: 5, // max 5 registrací za hodinu
  message: { error: 'Příliš mnoho registrací, zkuste to později.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const setPasswordLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minut
  max: 5, // max 5 pokusů za 30 minut
  message: { error: 'Příliš mnoho pokusů o nastavení hesla, zkuste to později.' },
  standardHeaders: true,
  legacyHeaders: false,
});
