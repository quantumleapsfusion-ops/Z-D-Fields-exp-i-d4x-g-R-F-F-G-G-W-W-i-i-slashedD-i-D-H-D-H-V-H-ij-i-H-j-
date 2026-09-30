export function isVoiceIdRateLimited(
  attemptsLastMinute: number,
  failuresLast15Minutes: number,
): boolean {
  return attemptsLastMinute > 10 || failuresLast15Minutes >= 3;
}
