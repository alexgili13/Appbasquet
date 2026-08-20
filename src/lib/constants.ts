export const AGE_STAGES = [
  "escola", "premini", "mini", "infantil", "cadet", "juvenil", "sub23", "senior",
] as const;

export const LEVELS = ["iniciacio", "intermig", "avancat"] as const;

export const INTENSITIES = ["baixa", "mitjana", "alta"] as const;

export const AGE_STAGE_LABELS: Record<(typeof AGE_STAGES)[number], string> = {
  escola: "Escola",
  premini: "Premini",
  mini: "Mini",
  infantil: "Infantil",
  cadet: "Cadet",
  juvenil: "Juvenil",
  sub23: "Sub-23",
  senior: "Sènior",
};

export const LEVEL_LABELS: Record<(typeof LEVELS)[number], string> = {
  iniciacio: "Iniciació",
  intermig: "Intermig",
  avancat: "Avançat",
};

export const INTENSITY_LABELS: Record<(typeof INTENSITIES)[number], string> = {
  baixa: "Baixa",
  mitjana: "Mitjana",
  alta: "Alta",
};

export const AGE_STAGE_OPTIONS = AGE_STAGES.map((v) => [v, AGE_STAGE_LABELS[v]] as const);
export const LEVEL_OPTIONS = LEVELS.map((v) => [v, LEVEL_LABELS[v]] as const);
export const INTENSITY_OPTIONS = INTENSITIES.map((v) => [v, INTENSITY_LABELS[v]] as const);

export const SORT_OPTIONS = [
  ["recent", "Més recents"],
  ["oldest", "Més antics"],
  ["name_asc", "Nom A-Z"],
  ["name_desc", "Nom Z-A"],
] as const;
