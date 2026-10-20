// Overlay styles and optional features offered in the broadcast graphics
// popover. A feature shows a switch where it applies and changes the copied
// link. Add new ones here.

import type { OverlayStyle } from "$lib/components/overlay/overlay";

export type LinkStyle = OverlayStyle;

export const linkStyles: { id: LinkStyle; label: string }[] = [
  { id: "broadcast-trail-plain", label: "Lista" },
  { id: "ticker", label: "Tikkeri" },
  { id: "broadcast-results", label: "Lopputulokset" },
  { id: "timetable", label: "Aikataulu" },
];

export type OverlayFeatureContext = {
  // Heats in the selected round.
  heatCount: number;
  style: LinkStyle;
  // Running events: no attempts, and no athlete "on turn" to compare with.
  timed: boolean;
};

export type OverlayFeatureId = "gap" | "records" | "heats";

export type OverlayFeature = {
  id: OverlayFeatureId;
  label: string;
  description: (context: OverlayFeatureContext) => string;
  defaultOn: boolean;
  available: (context: OverlayFeatureContext) => boolean;
};

export const overlayFeatures: OverlayFeature[] = [
  {
    id: "gap",
    label: "Näytä erot",
    description: ({ style, timed }) =>
      style === "broadcast-results" || timed
        ? "Ero voittajaan jokaisella rivillä."
        : "Ero vuorossa olleeseen urheilijaan jokaisella rivillä.",
    defaultOn: true,
    // The ticker has no room for a difference column; a timetable has no
    // results.
    available: ({ style }) => style !== "ticker" && style !== "timetable",
  },
  {
    id: "records",
    label: "Näytä ennätykset",
    // Many entries come without a PB or SB, so a stream may rather show none.
    description: () =>
      "SB- ja PB-merkinnät nimen vieressä ja banneri uudelle ennätykselle.",
    defaultOn: true,
    available: ({ style }) => style !== "timetable",
  },
  {
    id: "heats",
    label: "Erät erikseen",
    description: () => "Yksi erä koko kierroksen sijaan.",
    defaultOn: false,
    available: ({ heatCount, style }) => heatCount > 1 && style !== "timetable",
  },
];

export type OverlayFeatureState = Record<OverlayFeatureId, boolean>;

export const defaultFeatureState = (): OverlayFeatureState =>
  Object.fromEntries(
    overlayFeatures.map((feature) => [feature.id, feature.defaultOn]),
  ) as OverlayFeatureState;

// What is in effect: a feature that does not apply here counts as off.
export function activeFeatures(
  state: OverlayFeatureState,
  context: OverlayFeatureContext,
): OverlayFeatureState {
  return Object.fromEntries(
    overlayFeatures.map((feature) => [
      feature.id,
      feature.available(context) && state[feature.id],
    ]),
  ) as OverlayFeatureState;
}
