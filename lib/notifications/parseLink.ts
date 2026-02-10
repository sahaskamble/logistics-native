/**
 * Parse link1 (full URL) from notification and map to Expo Router path for in-app navigation.
 * Web paths like: /customer/cfs/orders/view/xyz, /customer/warehouse/..., etc.
 */

const PATH_MAPPINGS: Array<{ pattern: RegExp; build: (m: RegExpMatchArray) => string }> = [
  // CFS order view
  { pattern: /\/customer\/cfs\/orders\/view\/([^/?#]+)/i, build: (m) => `/(protected)/cfs/order/view/${m[1]}` },
  // Warehouse order view
  { pattern: /\/customer\/warehouse\/orders\/view\/([^/?#]+)/i, build: (m) => `/(protected)/warehouse/order/view/${m[1]}` },
  // Transport order view
  { pattern: /\/customer\/transport\/orders\/view\/([^/?#]+)/i, build: (m) => `/(protected)/transport/order/view/${m[1]}` },
  // 3PL order view
  { pattern: /\/customer\/orders\/3pl\/view\/([^/?#]+)/i, build: (m) => `/(protected)/orders/3pl/order/view/${m[1]}` },
  { pattern: /\/customer\/3pl\/orders\/view\/([^/?#]+)/i, build: (m) => `/(protected)/orders/3pl/order/view/${m[1]}` },
  // CFS service requests (e.g. container-grounding, eir-copy)
  { pattern: /\/customer\/cfs\/([^/]+)\/view\/([^/?#]+)/i, build: (m) => `/(protected)/cfs/${m[1]}/view/${m[2]}` },
  // Warehouse service requests
  { pattern: /\/customer\/warehouse\/([^/]+)\/view\/([^/?#]+)/i, build: (m) => `/(protected)/warehouse/${m[1]}/view/${m[2]}` },
  // Transport service requests
  { pattern: /\/customer\/transport\/service-requests\/view\/([^/?#]+)/i, build: (m) => `/(protected)/transport/service-requests/view/${m[1]}` },
  // Generic orders_id or order view (fallback)
  { pattern: /\/view\/([a-z0-9]{15})\/?/i, build: (m) => `/(protected)/cfs/order/view/${m[1]}` },
];

export function parseLinkToRoute(link: string | undefined): string | null {
  if (!link || typeof link !== "string") return null;
  const trimmed = link.trim();
  if (!trimmed) return null;

  try {
    const url = trimmed.startsWith("http") ? new URL(trimmed) : new URL("https://x" + (trimmed.startsWith("/") ? trimmed : "/" + trimmed));
    const path = url.pathname;
    const fullPath = path.startsWith("/") ? path : `/${path}`;

    for (const { pattern, build } of PATH_MAPPINGS) {
      const match = fullPath.match(pattern);
      if (match) return build(match);
    }

    // Fallback: if path contains "order" and an id-like segment
    const segments = fullPath.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    if (lastSegment && /^[a-z0-9]{15}$/i.test(lastSegment)) {
      if (segments.some((s) => s.toLowerCase().includes("cfs"))) {
        return `/(protected)/cfs/order/view/${lastSegment}`;
      }
      if (segments.some((s) => s.toLowerCase().includes("warehouse"))) {
        return `/(protected)/warehouse/order/view/${lastSegment}`;
      }
      if (segments.some((s) => s.toLowerCase().includes("transport"))) {
        return `/(protected)/transport/order/view/${lastSegment}`;
      }
      if (segments.some((s) => s.toLowerCase().includes("3pl"))) {
        return `/(protected)/orders/3pl/order/view/${lastSegment}`;
      }
      return `/(protected)/cfs/order/view/${lastSegment}`;
    }

    return null;
  } catch {
    return null;
  }
}
