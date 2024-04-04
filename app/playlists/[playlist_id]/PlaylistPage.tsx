"use client";

import Image from 'next/image';

import Header from "@/components/Header";
import { Playlist, SpotifyTrack } from '@/types';
import useLoadImage from "@/hooks/useLoadImage";
import PlaylistSong from './components/PlaylistSong';
import Button from '@/components/Button';
import Link from 'next/link';

interface PlaylistPageProps {
  playlistInfo: Playlist;
  songs: SpotifyTrack[];
}

const PlaylistPage: React.FC<PlaylistPageProps> = ({playlistInfo, songs}) => {
  const imageUrl = useLoadImage(playlistInfo);
  return (
    <Header className="rounded-lg bg-gradient-to-b from-emerald-800 to-black h-full">
      {/** Playlist Details */}
      <div className="mt-20 flex lg:flex-row justify-center lg:justify-between mx-10">
        <div className="flex flex-col md:flex-row items-center gap-x-5">
          <div className="relative h-32 w-32 lg:h-44 lg:w-44 rounded overflow-hidden min-w-32 lg:min-w-44">
            <Image className="object-cover shadow-xl bg-white" fill src={imageUrl || "/images/liked.png"} alt="Playlist Image" sizes="(max-width: 600px) 100vw, 800px"/>
          </div>
          <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
            <p className="hidden md:block font-semibold text-sm">Playlist</p>
            <h1 className="text-white text-4xl sm:text-5xl lg:text-4xl xl:text-7xl font-bold">{playlistInfo.title}</h1>
            <p className="hidden lg:block text-sm break-words w-[25vw]">{playlistInfo.description}</p>
          </div>
        </div>
        <Link href={playlistInfo.playlist_url} target='_blank' rel='noopener noreferrer'>
          <Button className="hidden lg:block w-40 h-20">
            View on Spotify
          </Button>
        </Link>
      </div>
      {/** Songs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-y-2 w-full p-6">
        {songs.map((song: any) => (
          <PlaylistSong key={song.id} data={song} onClick={() => {}}/>
        ))}
      </div>
    </Header>
  )
}

export default PlaylistPage;
