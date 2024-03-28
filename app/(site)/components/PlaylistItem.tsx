"use client";
import Image from "next/image";

import useLoadImage from "@/hooks/useLoadImage";
import { Playlist } from "@/types";

interface PlaylistItemProps {
  data: Playlist;
  onClick: (id: string) => void;
};

const PlaylistItem: React.FC<PlaylistItemProps> = ({data, onClick}) => {
  const imagePath = useLoadImage(data);

  return (
    <div onClick={() => onClick(data.id)} className="relative group flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-400/5 cursor-pointer hover:bg-neutral-400/10 transition p-3"> 
      <div className="relative aspect-square w-full h-full rounded-md overflow-hidden">
        <Image className="object-cover" src={imagePath || '/images/liked.png'} fill alt="image"/>
      </div>
      <div className="flex flex-col items-start w-full p-5 pb-3 gap-y-1">
        <p className="font-semibold truncate w-full">
          {data.title}
        </p>
        <p className="text-neutral-400 text-sm w-full">
          Created {new Date(data.created_at).toLocaleString([], { month: 'numeric', day: 'numeric' })} at {new Date(data.created_at).toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' })}
        </p>
      </div>
    </div>
  );
}

export default PlaylistItem;
