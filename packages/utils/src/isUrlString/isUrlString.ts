export function isUrlString(string: string): boolean {
  return /^https?:\/\/.+/.test(string);
}
