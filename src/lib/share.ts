/** Absolute, hash-router aware URL for a product page with query params. */
export function buildShareUrl(slug: string, params: Record<string, string>) {
  const q = new URLSearchParams(params);
  return `${window.location.origin}${window.location.pathname}#/product/${slug}?${q}`;
}

/** Native share sheet, then clipboard, then a visible fallback. */
export async function shareLink(
  url: string,
  title: string,
  toast: (m: string, tone?: "default" | "success" | "error") => void,
) {
  if (navigator.share) {
    try {
      await navigator.share({ url, title });
      return;
    } catch (e) {
      if ((e as DOMException)?.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast("Link copied to clipboard", "success");
  } catch {
    toast("Copy this link: " + url);
  }
}
