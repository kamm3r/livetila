import { expect, test } from "@playwright/test";
import { athleteBadge, countryCode } from "../src/lib/athlete-badge";
import { clubLogoFilename } from "../src/lib/club-logos";

const organization = {
  Name: "Jyväskylän Kenttäurheilijat",
  NameShort: "JyväskKU",
};

test("Tuloslista abbreviation exceptions resolve to verified Tilastopaja filenames", () => {
  for (const [Name, NameShort, filename] of [
    ["IF Åsarna", "IFÅsar", "IFÅsarna"],
    ["IF VOM", "IFVom", "IFVOM"],
    ["Seinäjoen Seudun Urheilijat", "SeinäjSU", "SeinäjsU"],
    ["Kunto-Pirkat", "KUNPIR", "KuntoP"],
    ["SpoVe", "SPOVE", "Spove"],
  ]) {
    const club = { Name, NameShort };
    expect(clubLogoFilename(club)).toBe(filename);
    expect(clubLogoFilename({ NameShort })).toBe(filename);
    expect(
      athleteBadge({ Organization: club, Athletes: [{ Nationality: "FIN" }] })
        ?.src,
    ).toBe(
      `https://www.tilastopaja.info/fi/db/pics/png/${encodeURIComponent(filename!)}.png`,
    );
  }
});

test("club names resolve without abbreviations and unknown clubs retain the API filename", () => {
  expect(clubLogoFilename({ Name: "  SEINÄJOEN SEUDUN URHEILIJAT  " })).toBe(
    "SeinäjsU",
  );
  expect(clubLogoFilename({ NameShort: "IFÅland" })).toBe("IFÅland");
  expect(clubLogoFilename({ Name: "New Club", NameShort: "NewClub" })).toBe(
    "NewClub",
  );
  expect(clubLogoFilename({ Name: "Unknown Club" })).toBeNull();
});

test("Finnish athletes use the club abbreviation and safely encode logo filenames", () => {
  expect(
    athleteBadge({
      Organization: organization,
      Athletes: [{ Nationality: "FIN" }],
    }),
  ).toEqual({
    kind: "club",
    alt: organization.Name,
    src: "https://www.tilastopaja.info/fi/db/pics/png/Jyv%C3%A4skKU.png",
  });
  expect(
    athleteBadge({
      Athletes: [{ Nationality: "FI", Organization: organization }],
    })?.kind,
  ).toBe("club");
});

test("foreign athletes use ISO and athletics country codes rather than Finnish club logos", () => {
  for (const [nationality, code] of [
    ["SWE", "SE"],
    ["GER", "DE"],
    ["NED", "NL"],
    ["SUI", "CH"],
    [" us ", "US"],
  ]) {
    expect(countryCode(nationality)).toBe(code);
    expect(
      athleteBadge({
        Organization: organization,
        Athletes: [{ Nationality: nationality }],
      })?.src,
    ).toBe(`https://flagcdn.com/w40/${code!.toLowerCase()}.png`);
  }
  expect(
    athleteBadge({
      Organization: organization,
      Athletes: [{ Nationality: "SWE" }],
    })?.alt,
  ).toBe("Ruotsi");
});

test("missing and unknown nationality data never invents a flag", () => {
  expect(athleteBadge({})).toBeNull();
  expect(countryCode("unknown")).toBeNull();
  expect(
    athleteBadge({
      Organization: organization,
      Athletes: [{ Nationality: "unknown" }],
    }),
  ).toBeNull();
  expect(athleteBadge({ Organization: organization })?.kind).toBe("club");
});

test("mixed-nationality relay teams use their club instead of the first member's flag", () => {
  expect(
    athleteBadge({
      Organization: organization,
      Athletes: [{ Nationality: "SWE" }, { Nationality: "FIN" }],
    })?.kind,
  ).toBe("club");
  expect(
    athleteBadge({
      Organization: organization,
      Athletes: [{ Nationality: "SWE" }, { Nationality: "SWE" }],
    })?.kind,
  ).toBe("flag");
});
