import countries from "i18n-iso-countries";
import type { Organization } from "~/types/comp";
import { clubLogoFilename } from "./club-logos";

export type AthleteBadgeEntry = {
  Organization?: Partial<Organization> | null;
  Athletes?:
    | {
        Nationality?: string | null;
        Organization?: Partial<Organization> | null;
      }[]
    | null;
};

// Athletics uses some IOC abbreviations instead of ISO alpha-3 codes.
const athleticsCountries: Record<string, string> = {
  GER: "DE",
  NED: "NL",
  SUI: "CH",
  DEN: "DK",
  GRE: "GR",
  LAT: "LV",
  POR: "PT",
  SLO: "SI",
  CRO: "HR",
  BUL: "BG",
  RSA: "ZA",
  INA: "ID",
  MAS: "MY",
  PHI: "PH",
  TPE: "TW",
  IRI: "IR",
  ALG: "DZ",
  BRN: "BH",
  KSA: "SA",
  UAE: "AE",
  VIE: "VN",
  KOS: "XK",
};

export function countryCode(nationality?: string | null): string | null {
  const code = nationality?.trim().toUpperCase();
  if (!code) return null;
  const country =
    athleticsCountries[code] ??
    (code.length === 3 ? countries.alpha3ToAlpha2(code) : code);
  return country && (country === "XK" || countries.isValid(country))
    ? country
    : null;
}

const countryNames = new Intl.DisplayNames(["fi"], { type: "region" });

export function athleteBadge(entry: AthleteBadgeEntry) {
  const athletes = entry.Athletes ?? [];
  const countries = athletes.map((athlete) => countryCode(athlete.Nationality));
  const country = countries[0];
  // A mixed-nationality relay team must not inherit its first member's flag.
  if (
    country &&
    country !== "FI" &&
    countries.every((value) => value === country)
  ) {
    return {
      kind: "flag" as const,
      src: `https://flagcdn.com/w40/${country.toLowerCase()}.png`,
      alt: countryNames.of(country) ?? country,
    };
  }
  // Unknown foreign codes should not be presented as Finnish club affiliations.
  if (athletes.length === 1 && athletes[0]?.Nationality?.trim() && !country)
    return null;
  const organization = entry.Organization ?? athletes[0]?.Organization;
  const filename = clubLogoFilename(organization);
  if (!filename) return null;
  return {
    kind: "club" as const,
    src: `https://www.tilastopaja.info/fi/db/pics/png/${encodeURIComponent(filename)}.png`,
    alt: organization?.Name ?? filename,
  };
}
