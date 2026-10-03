export type Element = {
  z: number;
  symbol: string;
  name: string;
  mass: string;
  category:
    | "alkali-metal"
    | "alkaline-earth-metal"
    | "lanthanide"
    | "actinide"
    | "transition-metal"
    | "post-transition-metal"
    | "metalloid"
    | "reactive-nonmetal"
    | "noble-gas"
    | "unknown";
  group: number | null;
  period: number;
  block: "s" | "p" | "d" | "f";
  phase: "solid" | "liquid" | "gas" | "unknown";
  config: string;
  electronegativity: number | null;
  discovered: string;
  fact: string;
};

type BaseElement = Pick<Element, "symbol" | "name" | "mass" | "discovered">;

const baseRows = `
H|Hydrogen|1.008|1766
He|Helium|4.0026|1868
Li|Lithium|6.94|1817
Be|Beryllium|9.0122|1798
B|Boron|10.81|1808
C|Carbon|12.011|ancient
N|Nitrogen|14.007|1772
O|Oxygen|15.999|1774
F|Fluorine|18.998|1886
Ne|Neon|20.180|1898
Na|Sodium|22.990|1807
Mg|Magnesium|24.305|1808
Al|Aluminium|26.982|1825
Si|Silicon|28.085|1824
P|Phosphorus|30.974|1669
S|Sulfur|32.06|ancient
Cl|Chlorine|35.45|1774
Ar|Argon|39.95|1894
K|Potassium|39.098|1807
Ca|Calcium|40.078|1808
Sc|Scandium|44.956|1879
Ti|Titanium|47.867|1791
V|Vanadium|50.942|1830
Cr|Chromium|51.996|1797
Mn|Manganese|54.938|1774
Fe|Iron|55.845|ancient
Co|Cobalt|58.933|1735
Ni|Nickel|58.693|1751
Cu|Copper|63.546|ancient
Zn|Zinc|65.38|ancient
Ga|Gallium|69.723|1875
Ge|Germanium|72.630|1886
As|Arsenic|74.922|ancient
Se|Selenium|78.971|1817
Br|Bromine|79.904|1826
Kr|Krypton|83.798|1898
Rb|Rubidium|85.468|1861
Sr|Strontium|87.62|1790
Y|Yttrium|88.906|1794
Zr|Zirconium|91.224|1789
Nb|Niobium|92.906|1801
Mo|Molybdenum|95.95|1778
Tc|Technetium|[98]|1937
Ru|Ruthenium|101.07|1844
Rh|Rhodium|102.91|1803
Pd|Palladium|106.42|1803
Ag|Silver|107.87|ancient
Cd|Cadmium|112.41|1817
In|Indium|114.82|1863
Sn|Tin|118.71|ancient
Sb|Antimony|121.76|ancient
Te|Tellurium|127.60|1782
I|Iodine|126.90|1811
Xe|Xenon|131.29|1898
Cs|Caesium|132.91|1860
Ba|Barium|137.33|1808
La|Lanthanum|138.91|1839
Ce|Cerium|140.12|1803
Pr|Praseodymium|140.91|1885
Nd|Neodymium|144.24|1885
Pm|Promethium|[145]|1945
Sm|Samarium|150.36|1879
Eu|Europium|151.96|1901
Gd|Gadolinium|157.25|1880
Tb|Terbium|158.93|1843
Dy|Dysprosium|162.50|1886
Ho|Holmium|164.93|1878
Er|Erbium|167.26|1843
Tm|Thulium|168.93|1879
Yb|Ytterbium|173.05|1878
Lu|Lutetium|174.97|1907
Hf|Hafnium|178.49|1923
Ta|Tantalum|180.95|1802
W|Tungsten|183.84|1783
Re|Rhenium|186.21|1925
Os|Osmium|190.23|1803
Ir|Iridium|192.22|1803
Pt|Platinum|195.08|ancient
Au|Gold|196.97|ancient
Hg|Mercury|200.59|ancient
Tl|Thallium|204.38|1861
Pb|Lead|207.2|ancient
Bi|Bismuth|208.98|ancient
Po|Polonium|[209]|1898
At|Astatine|[210]|1940
Rn|Radon|[222]|1900
Fr|Francium|[223]|1939
Ra|Radium|[226]|1898
Ac|Actinium|[227]|1899
Th|Thorium|232.04|1828
Pa|Protactinium|231.04|1913
U|Uranium|238.03|1789
Np|Neptunium|[237]|1940
Pu|Plutonium|[244]|1940
Am|Americium|[243]|1944
Cm|Curium|[247]|1944
Bk|Berkelium|[247]|1949
Cf|Californium|[251]|1950
Es|Einsteinium|[252]|1952
Fm|Fermium|[257]|1953
Md|Mendelevium|[258]|1955
No|Nobelium|[259]|1966
Lr|Lawrencium|[266]|1961
Rf|Rutherfordium|[267]|1964
Db|Dubnium|[268]|1967
Sg|Seaborgium|[269]|1974
Bh|Bohrium|[270]|1981
Hs|Hassium|[269]|1984
Mt|Meitnerium|[278]|1982
Ds|Darmstadtium|[281]|1994
Rg|Roentgenium|[282]|1994
Cn|Copernicium|[285]|1996
Nh|Nihonium|[286]|2004
Fl|Flerovium|[289]|1998
Mc|Moscovium|[290]|2003
Lv|Livermorium|[293]|2000
Ts|Tennessine|[294]|2010
Og|Oganesson|[294]|2002`.trim();

const base: BaseElement[] = baseRows.split("\n").map((row) => {
  const [symbol, name, mass, discovered] = row.split("|");
  return { symbol, name, mass, discovered };
});

// Tc-98 is the longest-lived technetium isotope, with a half-life of about 4.2 million years.
const GROUPS: (number | null)[] = [
  1,
  18,
  1,
  2,
  13,
  14,
  15,
  16,
  17,
  18,
  1,
  2,
  13,
  14,
  15,
  16,
  17,
  18,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  1,
  2,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  1,
  2,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
];

const periodOf = (z: number) =>
  z <= 2 ? 1 : z <= 10 ? 2 : z <= 18 ? 3 : z <= 36 ? 4 : z <= 54 ? 5 : z <= 86 ? 6 : 7;
const alkali = new Set([3, 11, 19, 37, 55, 87]);
const alkalineEarth = new Set([4, 12, 20, 38, 56, 88]);
const postTransition = new Set([13, 31, 49, 50, 81, 82, 83, 84]);
const metalloids = new Set([5, 14, 32, 33, 51, 52]);
const reactiveNonmetals = new Set([1, 6, 7, 8, 9, 15, 16, 17, 34, 35, 53, 85]);
const gases = new Set([1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86]);
const liquids = new Set([35, 80]);

const paulingValues: (number | null)[] = [
  2.2,
  null,
  0.98,
  1.57,
  2.04,
  2.55,
  3.04,
  3.44,
  3.98,
  null,
  0.93,
  1.31,
  1.61,
  1.9,
  2.19,
  2.58,
  3.16,
  null,
  0.82,
  1.0,
  1.36,
  1.54,
  1.63,
  1.66,
  1.55,
  1.83,
  1.88,
  1.91,
  1.9,
  1.65,
  1.81,
  2.01,
  2.18,
  2.55,
  2.96,
  3.0,
  0.82,
  0.95,
  1.22,
  1.33,
  1.6,
  2.16,
  1.9,
  2.2,
  2.28,
  2.2,
  1.93,
  1.69,
  1.78,
  1.96,
  2.05,
  2.1,
  2.66,
  2.6,
  0.79,
  0.89,
  1.1,
  1.12,
  1.13,
  1.14,
  1.13,
  1.17,
  1.2,
  1.2,
  1.22,
  1.23,
  1.24,
  1.25,
  1.1,
  1.3,
  1.5,
  2.36,
  1.9,
  2.2,
  2.2,
  2.28,
  2.54,
  2.0,
  1.62,
  2.33,
  2.02,
  2.0,
  2.2,
  2.2,
  0.7,
  0.9,
  1.1,
  1.3,
  1.5,
  1.38,
  1.36,
  1.28,
  1.3,
  1.3,
  1.3,
  1.3,
  1.3,
  1.3,
  1.3,
  1.3,
  1.3,
  1.3,
  1.3,
  1.3,
  1.3,
  1.3,
  1.3,
  1.3,
  1.3,
  1.3,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];

const orbitals = [
  ["1s", 2],
  ["2s", 2],
  ["2p", 6],
  ["3s", 2],
  ["3p", 6],
  ["4s", 2],
  ["3d", 10],
  ["4p", 6],
  ["5s", 2],
  ["4d", 10],
  ["5p", 6],
  ["6s", 2],
  ["4f", 14],
  ["5d", 10],
  ["6p", 6],
  ["7s", 2],
  ["5f", 14],
  ["6d", 10],
  ["7p", 6],
] as const;
const nobleCores = [
  { z: 86, text: "[Rn]" },
  { z: 54, text: "[Xe]" },
  { z: 36, text: "[Kr]" },
  { z: 18, text: "[Ar]" },
  { z: 10, text: "[Ne]" },
  { z: 2, text: "[He]" },
];

const exceptions: Record<number, string> = {
  24: "[Ar] 3d5 4s1",
  29: "[Ar] 3d10 4s1",
  41: "[Kr] 4d4 5s1",
  42: "[Kr] 4d5 5s1",
  44: "[Kr] 4d7 5s1",
  45: "[Kr] 4d8 5s1",
  46: "[Kr] 4d10",
  47: "[Kr] 4d10 5s1",
  57: "[Xe] 5d1 6s2",
  58: "[Xe] 4f1 5d1 6s2",
  64: "[Xe] 4f7 5d1 6s2",
  78: "[Xe] 4f14 5d9 6s1",
  79: "[Xe] 4f14 5d10 6s1",
  89: "[Rn] 6d1 7s2",
  90: "[Rn] 6d2 7s2",
  91: "[Rn] 5f2 6d1 7s2",
  92: "[Rn] 5f3 6d1 7s2",
  93: "[Rn] 5f4 6d1 7s2",
  96: "[Rn] 5f7 6d1 7s2",
  103: "[Rn] 5f14 7s2 7p1",
};

function fillAufbau(electronCount: number): Map<string, number> {
  let remaining = electronCount;
  const filled = new Map<string, number>();
  for (const [orbital, capacity] of orbitals) {
    if (remaining <= 0) break;
    const electrons = Math.min(remaining, capacity);
    filled.set(orbital, electrons);
    remaining -= electrons;
  }
  return filled;
}

function groundConfiguration(z: number): string {
  if (exceptions[z]) return exceptions[z];
  const core = nobleCores.find((candidate) => candidate.z < z);
  const occupiedByElement = fillAufbau(z);
  const occupiedByCore = fillAufbau(core?.z ?? 0);
  const occupied = [...occupiedByElement.entries()]
    .map(
      ([orbital, count]) =>
        [orbital, count - (occupiedByCore.get(orbital) ?? 0)] as const,
    )
    .filter(([, count]) => count > 0)
    .map(([orbital, count]) => `${orbital}${count}`);
  occupied.sort((a, b) => {
    const [, an, al] = a.match(/^(\d)([spdf])/)!;
    const [, bn, bl] = b.match(/^(\d)([spdf])/)!;
    return Number(an) - Number(bn) || "spdf".indexOf(al) - "spdf".indexOf(bl);
  });
  return [core?.text, ...occupied].filter(Boolean).join(" ");
}

export const elements: Element[] = base.map((item, index) => {
  const z = index + 1;
  const group = GROUPS[index];
  const period = periodOf(z);
  const block: Element["block"] =
    group === null ? "f" : z === 2 || group <= 2 ? "s" : group <= 12 ? "d" : "p";
  let category: Element["category"];
  if (z >= 109) category = "unknown";
  else if (alkali.has(z)) category = "alkali-metal";
  else if (alkalineEarth.has(z)) category = "alkaline-earth-metal";
  else if (z >= 57 && z <= 71) category = "lanthanide";
  else if (z >= 89 && z <= 103) category = "actinide";
  else if (group === 18) category = "noble-gas";
  else if (metalloids.has(z)) category = "metalloid";
  else if (postTransition.has(z)) category = "post-transition-metal";
  else if (reactiveNonmetals.has(z)) category = "reactive-nonmetal";
  else category = "transition-metal";
  const phase: Element["phase"] =
    z >= 100 ? "unknown" : gases.has(z) ? "gas" : liquids.has(z) ? "liquid" : "solid";
  return {
    ...item,
    z,
    group,
    period,
    block,
    category,
    phase,
    config: groundConfiguration(z),
    electronegativity: paulingValues[index] ?? null,
    fact: `${item.name} (${item.symbol}) has atomic number ${z}.`,
  };
});

export function electronsByShell(config: string): number[] {
  const counts: number[] = [];
  const coreByName: Record<string, number> = {
    He: 2,
    Ne: 10,
    Ar: 18,
    Kr: 36,
    Xe: 54,
    Rn: 86,
  };
  const coreMatch = config.match(/^\[(He|Ne|Ar|Kr|Xe|Rn)\]/);
  if (coreMatch) {
    let coreElectrons = coreByName[coreMatch[1]];
    for (const [orbital, capacity] of orbitals) {
      if (coreElectrons <= 0) break;
      const n = Number(orbital[0]);
      const electrons = Math.min(coreElectrons, capacity);
      counts[n - 1] = (counts[n - 1] ?? 0) + electrons;
      coreElectrons -= electrons;
    }
  }
  const terms = config.replace(/^\[[A-Za-z]+\]\s*/, "").match(/\d[spdf]\d+/g) ?? [];
  for (const term of terms) {
    const [, shell, electrons] = term.match(/^(\d)[spdf](\d+)$/)!;
    counts[Number(shell) - 1] = (counts[Number(shell) - 1] ?? 0) + Number(electrons);
  }
  return counts.filter((count) => count > 0);
}
