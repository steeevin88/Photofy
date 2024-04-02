"use client";

import { Playlist } from "@/types";
import PlaylistItem from "./PlaylistItem";

interface PageContentProps {
  playlists: Playlist[];
}

const PageContent: React.FC<PageContentProps> = ({playlists}) => {
  if (playlists.length === 0) {
    return (
      <div className="mt-4 text-netural-400">
        No playlists available.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-8 gap-4 mt-4">
      {playlists.map((item) => (
        <PlaylistItem key={item.id} data={item}/>
      ))}
    </div>
  );
}

export default PageContent;
