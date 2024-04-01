"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Image from "next/image";

import { useUser } from '@/hooks/useUser';
import Box from '@/components/Box';

function Page() {
  const pathname = usePathname();
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();
  const [songs, setSongs] = useState<any[]>([]);
  const [playlistData, setPlaylistData] = useState<any[]>([]);
  const playlistId = pathname.split('/').pop();

  useEffect(() => {
    async function fetchPlaylistSongs() {
      try {
        if (!user) {
          return;
        }

        // check if current user owns playlist
        const { data: hasPlaylistData, error } = await supabaseClient
          .from('playlists')
          .select()
          .eq('user_id', user.id)
          .eq('id', playlistId)
          .single();

        if (error) {
          console.error('Error fetching playlist ownership:', error.message);
          return;
        }

        // ensure user owns this playlist
        if (!hasPlaylistData) {
          console.log('User does not own this playlist');
          return;
        }

        // get playlist information to display
        const { data: playlistData, error: playlistError } = await supabaseClient
          .from('playlists')
          .select('*')
          .eq('id', playlistId);

        if (playlistError) {
          console.error('Error fetching playlist songs:', playlistError.message);
          return;
        }

        setPlaylistData(playlistData);

        // get all song_ids associated with the playlist from the 'in_playlist' table
        const { data: playlistSongsData, error: songsError } = await supabaseClient
          .from('in_playlist')
          .select('song_id')
          .eq('playlist_id', playlistId);

        if (songsError) {
          console.error('Error fetching playlist songs:', songsError.message);
          return;
        }

        // Fetch song details from the 'songs' table using the song_ids
        const songIds = playlistSongsData?.map(({ song_id }) => song_id);
        const { data: songsData, error: songsFetchError } = await supabaseClient
          .from('songs')
          .select('*')
          .in('id', songIds);

        if (songsFetchError) {
          console.error('Error fetching songs:', songsFetchError.message);
          return;
        }

        setSongs(songsData);
      } catch (error: any) {
        console.error('Error:', error.message);
      }
    }

    fetchPlaylistSongs();
  }, [supabaseClient, user, playlistId]);

  return (
    <div>
      <Box>
        <div>

        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-y-2 w-full p-6">
          {songs.map((song: any) => (
            <div key={song.id} className="flex items-center gap-x-3 cursor-pointer hover:bg-neutral-800/50 w-full p-2 rounded-md">
              <div className="relative rounded-md min-h-[48px] min-w-[48px] overflow-hidden">
                <Image fill src={song.image_url || "/images/liked.png"} alt="SongCover" className="object-cover" sizes="(max-width: 600px) 100vw, 800px"/>
              </div>
              <div className="flex flex-col gap-y-1 overflow-hidden">
                <p className="text-white truncate">
                  {song.title}
                </p>
                <p className="text-neutral-400 text-sm truncate">
                  {song.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Box>
    </div>
  );
}

export default Page;