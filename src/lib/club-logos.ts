import clubLogos from "./data/club-logos.json" with { type: "json" };
import type { Organization } from "~/types/comp";

// Snapshot of Tilastopaja's Seuraliiga 2026 club directory, verified 2026-10-10:
// https://www.tilastopaja.fi/seurakilpailut/seuraliiga/2026/kaikki
// Tuloslista's names and abbreviations can differ, including capitalization.
function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{Mark}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const byName = new Map(
  Object.entries(clubLogos).map(([name, file]) => [normalize(name), file]),
);
const byAbbreviation = new Map(
  Object.values(clubLogos).map((file) => [normalize(file), file]),
);
// Confirmed Tuloslista aliases which also differ after normalization.
byAbbreviation.set(normalize("IFÅsar"), "IFÅsarna");
byAbbreviation.set(normalize("KUNPIR"), "KuntoP");

export function clubLogoFilename(
  organization?: Partial<Organization> | null,
): string | null {
  const name = organization?.Name?.trim();
  const abbreviation = organization?.NameShort?.trim();
  return (
    (name ? byName.get(normalize(name)) : undefined) ??
    (abbreviation ? byAbbreviation.get(normalize(abbreviation)) : undefined) ??
    abbreviation ??
    null
  );
}
