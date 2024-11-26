export const HUNT_TYPES = [
  "Drevjakt",
  "Smygjakt",
  "Vakjakt",
  "Skyddsjakt",
  "Fågeljakt",
  "Arbetsdag"
] as const;

export type HuntType = typeof HUNT_TYPES[number];