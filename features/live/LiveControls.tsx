'use client';

import { useState } from 'react';

import type { LiveTranscription } from './useLiveTranscription';

/** Mic toggle + "type instead" input. Shared by the live-transcription surfaces. */
export function LiveControls({
  live,
  placeholder = 'Or type what you would say…',
  className = '',
}: {
  live: LiveTranscription;
  placeholder?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState('');

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => (live.listening ? live.stop() : void live.start())}
          aria-pressed={live.listening}
          className={`flex h-11 shrink-0 items-center gap-2 rounded-full px-5 font-sans text-sm transition-colors ${
            live.listening
              ? 'bg-ochre text-blackboard'
              : 'border border-chalk/25 text-chalk hover:border-ochre hover:text-ochre'
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${live.listening ? 'animate-pulse bg-blackboard' : 'bg-ochre'}`}
          />
          {live.listening ? 'Listening' : 'Speak'}
        </button>
        <form
          className="flex min-w-0 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            live.pushText(draft);
            setDraft('');
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            aria-label="Type instead of speaking"
            className="h-11 w-full min-w-0 rounded-full border border-chalk/15 bg-transparent px-4 font-sans text-sm text-chalk placeholder:text-dust/60 focus:border-ochre focus:outline-none"
          />
        </form>
      </div>
      <p className="label min-h-[1rem]">
        {live.error
          ? live.error
          : live.listening
            ? live.provider === 'deepgram'
              ? 'Deepgram live'
              : 'Browser speech recognition'
            : !live.supported
              ? 'No speech recognition in this browser — type instead'
              : ''}
      </p>
    </div>
  );
}
