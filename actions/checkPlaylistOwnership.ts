import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers"

import { Playlist } from "@/types";

const checkPlaylistOwnership = async (playlistId: string): Promise<Playlist | null> => {
  const supabase = createServerComponentClient({ cookies });
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  // if failed session OR user isn't logged in, we shouldn't return playlist information
  if (sessionError || !sessionData.session?.user.id) {
    return null;
  };

  try {
    // Check if the current user owns the playlist
    const { data: ownsPlaylist, error } = await supabase
      .from("playlists")
      .select()
      .eq("user_id", sessionData.session?.user.id)
      .eq("id", playlistId)
      .single();

    if (error) {
      console.error("Error fetching playlist ownership:", error.message);
      return null;
    }

    // If the user doesn't own the playlist, return null
    if (!ownsPlaylist) {
      console.log("User does not own this playlist");
      return null;
    }

    // If the user owns the playlist, return the playlist data
    return ownsPlaylist;
  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
};

export default checkPlaylistOwnership;
