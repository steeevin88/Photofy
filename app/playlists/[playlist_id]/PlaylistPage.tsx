import Image from 'next/image';

import Header from "@/components/Header";
import { SpotifyTrack } from '@/types';

interface PlaylistPageProps {
  songs: SpotifyTrack[];
}

const PlaylistPage: React.FC<PlaylistPageProps> = ({songs}) => {
  return (
    <Header className="bg-gradient-to-b from-gray-400 to-gray-800 h-full">
      <div>
        {/* TODO: Display playlist information --> ownsPlaylist */}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-y-2 w-full p-6">
        {songs.map((song: any) => (
          <div key={song.id} className="flex items-center gap-x-3 cursor-pointer bg-neutral-800/50 hover:bg-neutral-800/100 w-[99%] p-2 rounded-md">
            <div className="relative rounded-md min-h-[48px] min-w-[48px] overflow-hidden">
              <Image fill src={song.image_url || "/images/liked.png"} alt="SongCover" className="object-cover" sizes="(max-width: 600px) 100vw, 800px" />
            </div>
            <div className="flex flex-col gap-y-1 overflow-hidden">
              <p className="text-white truncate">{song.title}</p>
              <p className="text-neutral-400 text-sm truncate">{song.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </Header>
  )
}

export default PlaylistPage;
