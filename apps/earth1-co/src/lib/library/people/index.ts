import type { Person, SectionSlug } from "../types";
import { qcPeople } from "./qc";
import { qmPeople } from "./qm";

export const people: Person[] = [...qmPeople, ...qcPeople];
export const personBySlug = new Map(people.map((p) => [p.slug, p]));

export function peopleIn(section: SectionSlug): Person[] {
  return people.filter((p) => p.sections.includes(section));
}
