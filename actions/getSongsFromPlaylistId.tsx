import { SpotifyTrack } from "@/types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const getSongsFromPlaylistId = async (playlistId: string): Promise<SpotifyTrack[] | null> => {
  const supabase = createServerComponentClient({ cookies });

  try {
    // Get all song_ids associated with the playlist from the 'in_playlist' table
    const { data: playlistSongsData, error: playlistSongsError } = await supabase
      .from("in_playlist")
      .select("song_id")
      .eq("playlist_id", playlistId);

    if (playlistSongsError) {
      console.error("Error fetching playlist songs:", playlistSongsError.message);
      return null;
    }

    // Extract the song_ids from the 'in_playlist' table data
    const songIds = playlistSongsData?.map(({ song_id }) => song_id);

    // Fetch song details from the 'songs' table using the song_ids
    const { data: songsData, error: songsFetchError } = await supabase
      .from("songs")
      .select("*")
      .in("id", songIds);

    if (songsFetchError) {
      console.error("Error fetching songs:", songsFetchError.message);
      return null;
    }

    // Return the fetched songs
    return songsData;
  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
};

export default getSongsFromPlaylistId;
