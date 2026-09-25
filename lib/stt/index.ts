import { env } from '@/lib/env';

import { DeepgramTranscriber, grantDeepgramToken } from './deepgram';
import type { LiveTranscriptionConfig, Transcriber } from './types';
import { WhisperTranscriber } from './whisper';

export type { LiveTranscriptionConfig, Transcriber } from './types';

/**
 * Picks the batch transcriber. `STT_PROVIDER` forces a choice; otherwise the first provider with
 * a key wins (Deepgram, then Whisper). Returns `null` when nothing is configured.
 */
export function getTranscriber(): Transcriber | null {
  const { provider, deepgramKey, deepgramModel, openaiKey, whisperModel } = env.stt;
  if (provider === 'none') return null;
  if ((provider === 'deepgram' || !provider) && deepgramKey) {
    return new DeepgramTranscriber(deepgramKey, deepgramModel);
  }
  if ((provider === 'whisper' || !provider) && openaiKey) {
    return new WhisperTranscriber(openaiKey, whisperModel);
  }
  return null;
}

/** Live transcription: Deepgram streaming when keyed, otherwise the browser's Web Speech API. */
export async function getLiveTranscriptionConfig(): Promise<LiveTranscriptionConfig> {
  const { provider, deepgramKey, deepgramModel } = env.stt;
  if (deepgramKey && provider !== 'none' && provider !== 'whisper') {
    try {
      return {
        provider: 'deepgram',
        token: await grantDeepgramToken(deepgramKey),
        model: deepgramModel,
      };
    } catch (error) {
      console.error('[stt] Deepgram token grant failed; falling back to browser STT', error);
    }
  }
  return { provider: 'browser' };
}
