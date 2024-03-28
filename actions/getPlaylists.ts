import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers"

import { Playlist } from "@/types";

const getPlaylists = async (): Promise<Playlist[]> => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .order('created_at', { ascending: false });

    if (error) console.log(error);

    return (data as any) || [];
}

export default getPlaylists;
