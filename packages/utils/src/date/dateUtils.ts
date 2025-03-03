/**
 * Converts a date string to Brazilian ISO format.
 * @param dateString - The input date string in ISO format.
 * @returns The date string in Brazilian ISO format.
 */
export function toBrazilianIsoString(dateString: string): string {
  const date = new Date(dateString)
  const offset = -3 * 60 // Brazilian time zone offset (BRT: UTC-3)
  date.setMinutes(date.getMinutes() + offset)
  return date.toISOString().slice(0, -1) + '-03:00'
}
