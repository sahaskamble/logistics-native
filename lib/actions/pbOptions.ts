export type PbQueryOptions = {
  filter?: string;
  expand?: string;
  sort?: string;
  fields?: string;
  page?: number;
  perPage?: number;
};

export function mergeFilters(base?: string, extra?: string) {
  const a = (base || "").trim();
  const b = (extra || "").trim();
  if (a && b) return `(${a}) && (${b})`;
  return a || b;
}
