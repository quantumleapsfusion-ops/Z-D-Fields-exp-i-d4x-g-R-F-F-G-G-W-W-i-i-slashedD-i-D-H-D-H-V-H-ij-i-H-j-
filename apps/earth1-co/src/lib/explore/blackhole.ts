export const G = 6.6743e-11;
export const c = 299792458;
export const hbar = 1.054571817e-34;
export const kB = 1.380649e-23;
// IAU nominal solar mass value, used consistently for the preset masses.
export const Msun = 1.98847e30;
const YEAR_SECONDS = 365.25 * 24 * 60 * 60;

export function schwarzschildRadius(massKg: number): number {
  return (2 * G * massKg) / c ** 2;
}

export function photonSphere(massKg: number): number {
  return 1.5 * schwarzschildRadius(massKg);
}

export function isco(massKg: number): number {
  return 3 * schwarzschildRadius(massKg);
}

export function hawkingTemperature(massKg: number): number {
  return (hbar * c ** 3) / (8 * Math.PI * G * massKg * kB);
}

export function evaporationTimeSeconds(massKg: number): number {
  return (5120 * Math.PI * G ** 2 * massKg ** 3) / (hbar * c ** 4);
}

export function evaporationTimeYears(massKg: number): number {
  return evaporationTimeSeconds(massKg) / YEAR_SECONDS;
}

export function timeDilation(rOverRs: number): number | null {
  return rOverRs <= 1 ? null : Math.sqrt(1 - 1 / rOverRs);
}

export function lightDeflection(impactParameterM: number, massKg: number): number {
  return (4 * G * massKg) / (c ** 2 * impactParameterM);
}

/** Angular Einstein radius for a point lens; distances are from observer and source. */
export function einsteinRingRadians(
  massKg: number,
  lensDistanceM: number,
  sourceDistanceM: number,
): number {
  if (lensDistanceM <= 0 || sourceDistanceM <= lensDistanceM) return 0;
  return Math.sqrt(
    ((4 * G * massKg) / c ** 2) *
      ((sourceDistanceM - lensDistanceM) / (lensDistanceM * sourceDistanceM)),
  );
}

export type BlackHolePreset = {
  id: string;
  name: string;
  massSolar: number;
  note: string;
};

export const blackHolePresets: BlackHolePreset[] = [
  {
    id: "stellar",
    name: "10 M☉ stellar",
    massSolar: 10,
    note: "A representative stellar-mass black hole.",
  },
  {
    id: "sgr-a",
    name: "Sagittarius A*",
    massSolar: 4.3e6,
    note: "The Milky Way's central black hole; the EHT estimate is about 4 million solar masses.",
  },
  {
    id: "m87",
    name: "M87*",
    massSolar: 6.5e9,
    note: "The Event Horizon Telescope's 2019 target, about 6.5 billion solar masses.",
  },
  {
    id: "ton-618",
    name: "TON 618",
    massSolar: 6.6e10,
    note: "Estimated mass; published estimates vary by method.",
  },
  {
    id: "sun",
    name: "Sun, collapsed",
    massSolar: 1,
    note: "The Sun is not massive enough to collapse into a black hole; this is a thought experiment.",
  },
];
