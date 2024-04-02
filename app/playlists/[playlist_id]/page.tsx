import Link from 'next/link';

import checkPlaylistOwnership from '@/actions/checkPlaylistOwnership';
import getSongsFromPlaylistId from '@/actions/getSongsFromPlaylistId';
import Header from '@/components/Header';
import PlaylistPage from './PlaylistPage';

export default async function Page({ params }: { params: { playlist_id: string } }) {
  const { playlist_id } = params;
  const ownsPlaylist = await checkPlaylistOwnership(playlist_id);

  if (ownsPlaylist) {
    // if ownsPlaylist is not null, it means the user owns the playlist
    // additionally, ownsPlaylist contains the playlistInformation
    const songs = await getSongsFromPlaylistId(playlist_id);

    if (songs) {
      // if songs is not null, it means we successfully fetched the songs
      return (<PlaylistPage playlistInfo={ownsPlaylist} songs={songs}/>);
    } else {
      // if songs is null, it means there was an error fetching the songs
      return (
        <Header className="h-full text-center p-10">
          Error fetching songs from playlist.
        </Header>
      );
    }
  }

  // if ownsPlaylist is null, it means the user doesn't own the playlist
  return (
    <Header className="h-full text-center p-10">
      You do not own this playlist. Click <Link href="/" className='font-bold underline'>HERE</Link> to return to the homepage.
    </Header>
  );
}
