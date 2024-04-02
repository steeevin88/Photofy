import Image from 'next/image';
import { FaPlay } from "react-icons/fa";

interface PlaylistSongProps {
  data: any;
  onClick: (id: string) => void;
};

const PlaylistSong: React.FC<PlaylistSongProps> = ({data, onClick}) => {
  return (
    <div onClick={() => onClick(data.id)} className="group flex justify-between gap-x-4 cursor-pointer bg-neutral-800/50 hover:bg-neutral-800/100 w-[99%] p-2 rounded-md">
      <div className="flex gap-x-3 truncate">
        <div className="relative rounded min-h-[48px] min-w-[48px] overflow-hidden">
          <Image fill src={data.image_url || "/images/liked.png"} alt="Song Cover" className="object-cover" sizes="(max-width: 600px) 100vw, 800px"/>
        </div>
        <div className="flex flex-col gap-y-1 overflow-hidden">
          <p className="text-white truncate">{data.title}</p>
          <p className="text-neutral-400 text-sm truncate">{data.artist}</p>
        </div>
      </div>
      <button className="right-0 opacity-0 transition rounded-full flex items-center bg-green-500 p-4 drop-shadow-md translate group-hover:opacity-100 hover:scale-110">
        <FaPlay className="text-black"/>
      </button>
    </div>
  );
}

export default PlaylistSong;
