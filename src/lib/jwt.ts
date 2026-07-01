/**
 * Decodes a JWT token and checks if it has expired.
 * This helper is 100% edge-runtime safe because it uses only standard JS APIs (atob, split, JSON).
 */
export function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = parts[1];
    // Decode base64url safely
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    const { exp } = JSON.parse(decoded);
    
    if (!exp) return false;
    // exp is in seconds, Date.now() in milliseconds
    return Date.now() >= exp * 1000;
  } catch (error) {
    return true; // Assume expired/invalid if decoding fails
  }
}

/**
 * Decodes the user ID from a JWT token.
 */
export function getUserIdFromToken(token: string | null | undefined): number | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    const parsed = JSON.parse(decoded);
    return parsed.id ? Number(parsed.id) : null;
  } catch {
    return null;
  }
}

