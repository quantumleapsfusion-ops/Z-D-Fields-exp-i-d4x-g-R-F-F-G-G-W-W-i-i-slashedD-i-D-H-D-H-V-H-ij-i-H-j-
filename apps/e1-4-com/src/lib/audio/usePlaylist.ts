"use client";

import { useEffect } from "react";

import { selectActiveSegmentId, usePlayback, type Playlist } from "./store";

/**
 * Hands a playlist to the global AudioDock for as long as the calling surface is mounted and
 * returns the controls it needs. The dock keeps playing after navigation; the playlist is only
 * cleared when a different surface registers its own.
 */
export function usePlaylist(playlist: Playlist | null) {
  const setPlaylist = usePlayback((s) => s.setPlaylist);
  const playFrom = usePlayback((s) => s.playFrom);
  const activeId = usePlayback(selectActiveSegmentId);

  useEffect(() => {
    if (playlist) setPlaylist(playlist);
  }, [playlist, setPlaylist]);

  return { activeId, playFrom };
}
