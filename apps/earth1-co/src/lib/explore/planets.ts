export type Planet = {
  name: string;
  diameterKm: number;
  massEarths: number;
  gravity: number;
  escapeKmS: number;
  dayHours: number;
  orbitDays: number;
  distanceAU: number;
  meanTempC: number;
  moons: number;
  rings: boolean;
  atmosphere: string;
  facts: string[];
  missions: string[];
  colours: { light: string; mid: string; dark: string; bands?: string[] };
};

export const planets: Planet[] = [
  {
    name: "Mercury",
    diameterKm: 4879,
    massEarths: 0.0553,
    gravity: 3.7,
    escapeKmS: 4.3,
    dayHours: 4222.6,
    orbitDays: 87.97,
    distanceAU: 0.387,
    meanTempC: 167,
    moons: 0,
    rings: false,
    atmosphere:
      "A very thin exosphere, mainly oxygen, sodium, hydrogen, helium, and potassium.",
    facts: [
      "Mercury has a 3:2 spin–orbit resonance: it rotates three times for every two orbits.",
      "Its large iron-rich core makes it unusually dense.",
    ],
    missions: ["Mariner 10", "MESSENGER", "BepiColombo (en route)"],
    colours: { light: "#e6e0d8", mid: "#9d948a", dark: "#3b3632" },
  },
  {
    name: "Venus",
    diameterKm: 12104,
    massEarths: 0.815,
    gravity: 8.87,
    escapeKmS: 10.36,
    dayHours: 2802.0,
    orbitDays: 224.7,
    distanceAU: 0.723,
    meanTempC: 464,
    moons: 0,
    rings: false,
    atmosphere:
      "A dense carbon-dioxide atmosphere with clouds of sulfuric acid; surface pressure is about 92 times Earth's.",
    facts: [
      "Venus rotates retrograde, so the Sun rises in the west.",
      "Its thick greenhouse atmosphere makes it the hottest planet at the surface.",
    ],
    missions: ["Venera 7", "Magellan", "Akatsuki"],
    colours: { light: "#fff3d2", mid: "#e0bf7e", dark: "#5b4424" },
  },
  {
    name: "Earth",
    diameterKm: 12756,
    massEarths: 1,
    gravity: 9.80665,
    escapeKmS: 11.2,
    dayHours: 24.0,
    orbitDays: 365.256,
    distanceAU: 1,
    meanTempC: 15,
    moons: 1,
    rings: false,
    atmosphere:
      "Mostly nitrogen (78%) and oxygen (21%), with variable water vapour and trace gases.",
    facts: [
      "Liquid water is stable at the surface across much of Earth.",
      "Earth's magnetic field is generated largely by motion in its liquid outer core.",
    ],
    missions: ["Apollo 11", "International Space Station", "Earth-observing satellites"],
    colours: { light: "#d6f0ff", mid: "#3d86d6", dark: "#0b2143", bands: ["#5fae6b"] },
  },
  {
    name: "Mars",
    diameterKm: 6792,
    massEarths: 0.107,
    gravity: 3.71,
    escapeKmS: 5.0,
    dayHours: 24.7,
    orbitDays: 686.98,
    distanceAU: 1.524,
    meanTempC: -65,
    moons: 2,
    rings: false,
    atmosphere: "A thin atmosphere, about 95% carbon dioxide, with nitrogen and argon.",
    facts: [
      "Olympus Mons is the largest known volcano in the Solar System.",
      "Mars has two small moons, Phobos and Deimos.",
    ],
    missions: ["Viking 1", "Mars Pathfinder", "Perseverance"],
    colours: { light: "#ffc7a3", mid: "#c9562e", dark: "#44160b" },
  },
  {
    name: "Jupiter",
    diameterKm: 142984,
    massEarths: 317.8,
    gravity: 24.79,
    escapeKmS: 59.5,
    dayHours: 9.9,
    orbitDays: 4332.59,
    distanceAU: 5.203,
    meanTempC: -110,
    moons: 97,
    rings: true,
    atmosphere: "Mostly hydrogen and helium, with clouds containing ammonia and water.",
    facts: [
      "Jupiter is the most massive planet, with more than twice the mass of all the other planets combined.",
      "The Great Red Spot is a long-lived storm.",
    ],
    missions: ["Pioneer 10", "Galileo", "Juno"],
    colours: {
      light: "#fff1dc",
      mid: "#cfa47a",
      dark: "#4a3020",
      bands: ["#a9744d", "#e9d4b6", "#9a6a47", "#f1dfc6", "#b98460"],
    },
  },
  {
    name: "Saturn",
    diameterKm: 120536,
    massEarths: 95.2,
    gravity: 10.44,
    escapeKmS: 35.5,
    dayHours: 10.7,
    orbitDays: 10759.22,
    distanceAU: 9.537,
    meanTempC: -140,
    moons: 274,
    rings: true,
    atmosphere: "Mostly hydrogen and helium, with trace methane and ammonia.",
    facts: [
      "Saturn's rings are broad but extremely thin compared with their diameter.",
      "Saturn is less dense than water as a bulk average, though no ocean could contain it.",
    ],
    missions: ["Pioneer 11", "Cassini–Huygens", "Voyager 1"],
    colours: {
      light: "#fff5dc",
      mid: "#d8bb85",
      dark: "#4d3a1e",
      bands: ["#c9a86e", "#efdcb4", "#b8955e"],
    },
  },
  {
    name: "Uranus",
    diameterKm: 51118,
    massEarths: 14.5,
    gravity: 8.87,
    escapeKmS: 21.3,
    dayHours: 17.2,
    orbitDays: 30688.5,
    distanceAU: 19.191,
    meanTempC: -195,
    moons: 28,
    rings: true,
    atmosphere:
      "Hydrogen and helium with methane; deeper layers contain water, ammonia, and other volatiles.",
    facts: [
      "Uranus rotates on its side, with an axial tilt of about 98°.",
      "Its blue-green colour comes largely from methane absorbing red light.",
    ],
    missions: ["Voyager 2"],
    colours: { light: "#e6ffff", mid: "#7fd3dc", dark: "#123f47" },
  },
  {
    name: "Neptune",
    diameterKm: 49528,
    massEarths: 17.1,
    gravity: 11.15,
    escapeKmS: 23.5,
    dayHours: 16.1,
    orbitDays: 60182,
    distanceAU: 30.069,
    meanTempC: -200,
    moons: 16,
    rings: true,
    atmosphere:
      "Mostly hydrogen and helium, with methane and deeper volatile-rich layers.",
    facts: [
      "Neptune was predicted mathematically before it was observed in 1846.",
      "Triton, its largest moon, orbits backward and is likely a captured object.",
    ],
    missions: ["Voyager 2"],
    colours: { light: "#cfe0ff", mid: "#3f63d9", dark: "#0b1647" },
  },
];

export const EARTH_GRAVITY = 9.80665;
export const SECONDS_PER_AU_LIGHT = 499.005;
export const EARTH_YEAR_DAYS = 365.256;

export function weightOn(planet: Planet, earthKg: number): number {
  return (earthKg * planet.gravity) / EARTH_GRAVITY;
}

export function sunlightTravelSeconds(planet: Planet): number {
  return planet.distanceAU * SECONDS_PER_AU_LIGHT;
}

export function ageOnPlanet(planet: Planet, ageOnEarthYears: number): number {
  return (ageOnEarthYears * EARTH_YEAR_DAYS) / planet.orbitDays;
}
