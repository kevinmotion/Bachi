/**
 * Convierte un monto a la moneda base (PEN).
 * @param monto - El monto a convertir.
 * @param moneda - La moneda original (ej. 'USD', 'EUR').
 * @param tc - El tipo de cambio (tasa de conversión a PEN).
 * @returns El monto convertido a PEN.
 */
export const convertirASoles = (monto: number, moneda: string, tc: number): number => {
  if (moneda === 'PEN') return monto;
  return monto * tc;
};
