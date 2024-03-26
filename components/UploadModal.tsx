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
import { SpotifyPlaylist } from "@/types";

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

      const isPublic = values.visibility === 'public';
      const imageFile = values.image?.[0];
      
      if (!imageFile || !user) {
        toast.error("Missing fields.");
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

      // TODO - get users' recent top 10 artists --> grab 3
      try {
        const topArtists = await fetchTopArtists(providerKey);

        // shuffle topArtists to grab 3 at random
        const selectedArtists = topArtists.map((value: string) => ({ value, sort: Math.random() }))
          .sort((a: { sort: number; }, b: { sort: number; }) => a.sort - b.sort)
          .map(({ value } : { value: any}) => value)
          .slice(0, 3);
      } catch (error) {
        console.error('Error getting top artists.');
      }

      // TODO - use Spotify API to get recommendations based on 5 seeds

      // TODO - add songs to database

      // TODO - create Spotify playlist containing songs
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

      let playlistData: SpotifyPlaylist | null = null;
      if (response.ok) {
        // add uploaded image as playlist cover
        playlistData = await response.json();

        // Check if the file size exceeds the maximum allowed size (256 KB)
        const MAX_FILE_SIZE = 256 * 1024; // 256 KB in bytes
        if (imageFile.size <= MAX_FILE_SIZE) {
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

        // TODO - add recommended songs
      } else {
        toast.error('Failed to create playlist.');
      }

      // successful --> let's actually add the playlist to our databse
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
        <Input id='title' disabled={isLoading} {...register('title', { required: true })} placeholder="Playlist Title"/>
        <Input id='description' disabled={isLoading} {...register('description', { required: false })} placeholder="Description (Optional)"/>
        <div>
          <div className="pb-1">
            Upload an image!
          </div>
          <Input id='image' type='file' disabled={isLoading} {...register('image', { required: true })} accept="image/*" className="hover:cursor-pointer"/>
        </div>
        <Button disabled={isLoading} type='submit'>
          Generate
        </Button>
      </form>
    </Modal>
  )
}

const fetchTopArtists = async (accessToken: string) => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/top/artists', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch top artists');
    }

    const data = await response.json();
    return data.items.map((artist: any) => artist.id);
  } catch (error) {
    toast.error('Error fetching top artists.');
    return [];
  }
};

export default UploadModal;
