import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers"

import { Playlist } from "@/types";

const getPlaylistsByUserId = async (): Promise<Playlist[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  // if failed session OR user isn't logged in --> no libraries to display...
  if (sessionError || !sessionData.session?.user.id) {
    return [];
  };

  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', sessionData.session?.user.id)
    .order('created_at', { ascending: false })

  if (error) console.log(error.message); // supabase error

  return (data as any) || [];
}

export default getPlaylistsByUserId;
