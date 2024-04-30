export type CookieOptions = {
  key: string;
  value: string;
  expires?: Date;
  path?: string;
  samesite?: string;
  secure?: boolean;
};

export function setCookie({
  key,
  value,
  expires,
  path,
  samesite,
  secure,
}: CookieOptions): void {
  document.cookie = `${key}=${value}; ${expires ? `expires=${expires.toString()};` : ''} ${path ? `path=${path};` : ''} ${samesite ? `samesite=${samesite};` : ''} ${secure ? `secure=${secure};` : ''}`;
}

export function deleteCookie(key: string): void {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function getCookie(key: string): string {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieKey, cookieValue] = cookie.split('=');
    if (cookieKey.trim() === key)
      return cookieValue;
  }

  return '';
}

export function hasCookie(key: string): boolean {
  return document.cookie.includes(`${key}=`);
}
