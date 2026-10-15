// Client side: what the browser says about this visit, for the saved chats.
// Kept in sessionStorage, so a reload or a new page in the same tab stays one
// session, and it ends when the tab closes. Storage can be blocked (private
// windows, strict settings); then each page load is its own session.

const SESSION_KEY = "assistant-session";
const SOURCE_KEY = "assistant-source";

export interface Source {
  /** The referring site's domain only, e.g. "linkedin.com"; null for direct visits or this site. */
  referrer: string | null;
  utmSource: string | null;
}

/** The referring site's domain, without "www."; null if there's none or it's this site. */
export function referrerDomain(referrer: string, ownHost: string): string | null {
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host && host !== ownHost.replace(/^www\./, "") ? host : null;
  } catch {
    return null;
  }
}

/** What a usable `utm_source` looks like; the server checks the same shape. */
export const UTM_TOKEN = /^[\w.-]{1,50}$/;

/** `utm_source` from a query string, if it's a plain token. */
export function utmSource(search: string): string | null {
  const value = new URLSearchParams(search).get("utm_source")?.trim();
  return value && UTM_TOKEN.test(value) ? value.toLowerCase() : null;
}

function stored<T>(key: string, make: () => T): T {
  try {
    const saved = sessionStorage.getItem(key);
    if (saved) return JSON.parse(saved) as T;
    const value = make();
    sessionStorage.setItem(key, JSON.stringify(value));
    return value;
  } catch {
    return make();
  }
}

/** This tab's chat session ID. */
export const sessionId = () => stored(SESSION_KEY, () => crypto.randomUUID());

/**
 * Where the visitor came from, read once when they land: client-side
 * navigation drops the landing page's query string, so call it on mount.
 */
export const visitSource = () =>
  stored<Source>(SOURCE_KEY, () => ({
    referrer: referrerDomain(document.referrer, location.hostname),
    utmSource: utmSource(location.search),
  }));
