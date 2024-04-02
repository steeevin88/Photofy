"use client";

import Image from 'next/image';

import Header from "@/components/Header";
import { Playlist, SpotifyTrack } from '@/types';
import useLoadImage from "@/hooks/useLoadImage";

interface PlaylistPageProps {
  playlistInfo: Playlist;
  songs: SpotifyTrack[];
}

const PlaylistPage: React.FC<PlaylistPageProps> = ({playlistInfo, songs}) => {
  const imageUrl = useLoadImage(playlistInfo);
  return (
    <Header className="rounded-lg  bg-gradient-to-b from-emerald-800 to-black h-full">
      {/** Playlist Details */}
      <div className="mt-20">
        <div className="flex flex-col md:flex-row items-center gap-x-5">
          <div className="relative h-32 w-32 lg:h-44 lg:w-44 rounded  overflow-hidden">
            <Image className="object-cover shadow-xl bg-white" fill src={imageUrl || "/images/liked.png"} alt="Playlist Image" />
          </div>
          <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
            <p className="hidden md:block font-semibold text-sm">Playlist</p>
            <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold">{playlistInfo.title}</h1>
            <p className="hidden md:block text-sm">{playlistInfo.description}</p>
          </div>
        </div>
      </div>
      {/** Songs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-y-2 w-full p-6">
        {songs.map((song: any) => (
          <div key={song.id} className="flex items-center gap-x-3 cursor-pointer bg-neutral-800/50 hover:bg-neutral-800/100 w-[99%] p-2 rounded-md">
            <div className="relative rounded min-h-[48px] min-w-[48px] overflow-hidden">
              <Image fill src={song.image_url || "/images/liked.png"} alt="SongCover" className="object-cover" sizes="(max-width: 600px) 100vw, 800px"/>
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
