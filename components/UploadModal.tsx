"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import uniqid from "uniqid";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

import Modal from "./Modal"
import useUploadModal from "@/hooks/useUploadModal";
import Input from "./Input";
import Button from "./Button";
import { useUser } from "@/hooks/useUser";
import { SpotifyPlaylist, SpotifyTrack } from "@/types";

const UploadModal = () => {
  const { onClose, isOpen } = useUploadModal();
  const [isLoading, setIsLoading] = useState(false);
  const { user, spotifyData, providerKey } = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      title: '',
      description: '',
      visibility: 'public',
      image: null,
    }
  }
  );

  const onChange = (open: boolean) => {
    if (!open) {
      // reset the form
      reset();
      // close the modal
      onClose();
    }
  }

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    // upload to supabase
    try {
      setIsLoading(true);

      const isPublic = (values.visibility === 'public');
      const imageFile = values.image?.[0];
      
      // validate form inputs + toast error if needed
      const validationMessages = [];
      if (values.title === '') validationMessages.push('- Please add a playlist title.');
      if (!imageFile) validationMessages.push('- Please upload an image file.');
      if (!user || validationMessages.length > 0) {
        toast.error('Missing fields.\n' + validationMessages.join('\n'));
        return;
      }

      const uniqueId = uniqid();

      // Upload Image
      const {
        data: imageData,
        error: imageError,
      } = await supabaseClient.storage.from('images').upload(`images-${values.title}-${uniqueId}`, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

      if (imageError) {
        setIsLoading(false);
        return toast.error('Failed image upload.')
      }

      // TODO - get two genres based on image

      // Use Spotify API to get recommendations based on 5 seeds (3 artists, 2 genres)
      const recommendations = await fetchRecommendations(providerKey);

      // Create Spotify playlist containing songs
      const response = await fetch(`https://api.spotify.com/v1/users/${spotifyData?.id}/playlists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${providerKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: values.title,
          description: values.description,
          public: isPublic,
        })
      });

      // Upon successful playlist creation, add playlist image + songs
      let playlistData: SpotifyPlaylist | null = null;
      if (response.ok) {
        playlistData = await response.json();

        // add uploaded image as playlist cover
        addPlaylistImage(imageFile, imageFile.size, playlistData, providerKey);

        // add recommended songs
        addRecommendedSongs(recommendations['tracks'], playlistData, providerKey);

      } else {
        toast.error('Failed to create playlist.');
      }

      // successful --> let's actually add the songs + playlist to our databse
      const {
        error: supabaseError
      } = await supabaseClient.from('playlists').insert({
        user_id: user.id,
        public: isPublic,
        title: values.title,
        description: values.description,
        image_path: imageData.path,
        playlist_url: playlistData ? playlistData.external_urls["spotify"] : null,
      })

      if (supabaseError) {
        setIsLoading(false);
        return toast.error(supabaseError.message);
      }

      router.refresh();
      setIsLoading(false);
      toast.success("Playlist created!")
      reset();
      onClose();
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal title="Generate a new playlist!" description="🎵 Upload a photo and turn memories into music 🎵" isOpen={isOpen} onChange={onChange}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <div className="pb-1 flex gap-2">
          Playlist Visibility:
          <select id='visibility' {...register('visibility', { required: true })}>
            <option value='public'>Public</option>
            <option value='private'>Private</option>
          </select>
        </div>
        <Input id='title' disabled={isLoading} {...register('title')} placeholder="Playlist Title"/>
        <Input id='description' disabled={isLoading} {...register('description')} placeholder="Description (Optional)"/>
        <div>
          <div className="pb-1">
            Upload an image!
          </div>
          <Input id='image' type='file' disabled={isLoading} {...register('image')} accept="image/*" className="hover:cursor-pointer"/>
        </div>
        <Button type='submit'>
          Generate Photofy Playlist
        </Button>
      </form>
    </Modal>
  )
}

const fetchRecommendations = async (providerKey: string) => {
  try {
    // Fetch top artists
    const response = await fetch('https://api.spotify.com/v1/me/top/artists', {
      headers: {
        'Authorization': `Bearer ${providerKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch top artists');
    }

    const data = await response.json();
    const topArtists = data.items.map((artist: {id : string}) => artist.id);

    // Fetch recommendations after fetching top artists
    const selectedArtists = topArtists
      .map((value: string) => ({ value, sort: Math.random() }))
      .sort((a: { sort: number }, b: { sort: number }) => a.sort - b.sort)
      .map(({ value }: { value: any }) => value)
      .slice(0, 3);

    const genres = ['pop', 'r-n-b'];

    const recommendationsResponse = await fetch(`https://api.spotify.com/v1/recommendations?seed_artists=${selectedArtists.join(',')}&seed_genres=${genres.join(',')}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${providerKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!recommendationsResponse.ok) {
      throw new Error('Failed to fetch recommendations');
    }

    const recommendationsData = await recommendationsResponse.json();
    return recommendationsData;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    // Handle error
    toast.error('Failed to fetch recommendations.');
    return [];
  }
};

const addPlaylistImage = async (imageFile: Blob, size : number, playlistData: SpotifyPlaylist | null, providerKey: string) => {
  // Check if the file size exceeds the maximum allowed size (256 KB)
  const MAX_FILE_SIZE = 256 * 1024; // 256 KB in bytes
  if (size <= MAX_FILE_SIZE) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(imageFile);
      fileReader.onload = async () => {
        const result = fileReader.result;
        if (typeof result === 'string') {
          const base64Data = result.split(',')[1];
          const imageResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistData?.id}/images`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${providerKey}`,
              'Content-Type': 'image/jpeg'
            },
            body: base64Data
          });

          if (imageResponse.ok) {
            toast.success('Playlist image updated successfully.');
          } else {
            toast.error('Failed to update playlist image.');
          }
        }
    };
  } else {
    toast.error('Image file size exceeds the maximum allowed size. Please add the playlist image manually.');
  }
}

const addRecommendedSongs = async (tracks: [SpotifyTrack], playlistData: SpotifyPlaylist | null, providerKey: string) => {
  const trackUris = tracks.map((track: {uri: string}) => track.uri);
  const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistData?.id}/tracks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${providerKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      uris: trackUris
    })
  });
  if (addTracksResponse.ok) {
    toast.success('Songs added to the playlist.');
  } else {
    toast.error('Failed to add songs to the playlist.');
  }
}

export default UploadModal;
