"use client";

import Image from "next/image";

import useLoadImage from "@/hooks/useLoadImage";
import { Playlist } from "@/types";

interface MediaItemProps {
  data: Playlist;
  onClick?: (id: string) => void;
}

const MediaItem: React.FC<MediaItemProps> = ({ data, onClick }) => {
  const imageUrl = useLoadImage(data);

  return ( 
    <div className="flex items-center gap-x-3 cursor-pointer hover:bg-neutral-800/50 w-full p-2 rounded-md">
      <div className="relative rounded-md min-h-[48px] min-w-[48px] overflow-hidden">
        <Image fill src={imageUrl || "/images/liked.png"} alt="MediaItem" className="object-cover"/>
      </div>
      <div className="flex flex-col gap-y-1 overflow-hidden">
        <p className="text-white truncate">
          {data.title}
        </p>
        <p className="text-neutral-400 text-sm truncate">
          Created {new Date(data.created_at).toLocaleString([], { month: 'numeric', day: 'numeric' })}, {new Date(data.created_at).toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
 
export default MediaItem;