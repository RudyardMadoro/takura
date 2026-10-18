export const ENQUIRY_SERVICES = [
  ['PROPERTY_TRANSFORMATION', 'Property transformation'],
  ['CONSTRUCTION', 'Construction'],
  ['RENOVATION', 'Renovation'],
  ['EXTENSION', 'Extension'],
  ['MAINTENANCE', 'Maintenance'],
  ['INTERIORS', 'Interiors'],
  ['CABINETRY', 'Cabinetry'],
  ['BOARD_SALES', 'Board sales'],
  ['BOARD_CUTTING', 'Board cutting'],
  ['HARDWARE', 'Hardware supplies'],
] as const;

export type EnquiryServiceCode = (typeof ENQUIRY_SERVICES)[number][0];

const SERVICE_CODES = new Set<string>(ENQUIRY_SERVICES.map(([code]) => code));

export function supportedService(value: string | null): EnquiryServiceCode | null {
  const code = value?.toUpperCase() ?? '';
  return SERVICE_CODES.has(code) ? (code as EnquiryServiceCode) : null;
}

export function serviceLabel(code: string): string {
  return ENQUIRY_SERVICES.find(([candidate]) => candidate === code)?.[1] ?? code;
}
