export const voiceDestinations = {
  home: "/",
  login: "/login",
  profile: "/profile",
  stream: "/stream",
  chalkboard: "/chalkboard",
  davinci: "/davinci",
  gravity: "/gravity",
} as const;

export type VoiceCommand = keyof typeof voiceDestinations;

const phrases: Record<VoiceCommand, RegExp> = {
  home: /^(?:go )?home$/,
  login: /^(?:log in|login|sign in|open login)$/,
  profile: /^(?:(?:open )?(?:my )?profile)$/,
  stream: /^(?:share|share with friends|(?:open )?(?:voice )?stream)$/,
  chalkboard: /^(?:open )?(?:infinity )?chalkboard$/,
  davinci: /^(?:open )?da ?vinci$/,
  gravity: /^(?:open )?gravity(?: board)?$/,
};

export function parseVoiceCommand(phrase: string): VoiceCommand | null {
  const words = phrase
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
  for (const [command, pattern] of Object.entries(phrases) as [VoiceCommand, RegExp][]) {
    if (pattern.test(words)) return command;
  }
  return null;
}
