export function getXsrfTokenFromCookie(): string | null {
    const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : null;
}

export function hasAuthCookies(): boolean {
    // Check if we have XSRF token - this is set when user goes through auth flow
    return getXsrfTokenFromCookie() !== null;
}

export function clearAuthCookies(): void {
    // Clear XSRF token cookie
    document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/; SameSite=lax';
}