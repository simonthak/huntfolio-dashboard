export const HUNT_TYPES = [
  "Drevjakt",
  "Smygjakt",
  "Vakjakt",
  "Skyddsjakt",
  "Fågeljakt"
] as const;

export type HuntType = (typeof HUNT_TYPES)[number];