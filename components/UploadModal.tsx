"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import uniqid from "uniqid";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import Compressor from 'compressorjs';
import Anthropic from '@anthropic-ai/sdk';

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
    try {
      setIsLoading(true);
  
      const isPublic = (values.visibility === 'public');
      const imageFile = values.image?.[0];
  
      // Validate form inputs
      const validationMessages = [];
      if (values.title === '') validationMessages.push('- Please add a playlist title.');
      if (!imageFile) validationMessages.push('- Please upload an image file.');
      if (!user || validationMessages.length > 0) {
        toast.error('Missing fields.\n' + validationMessages.join('\n'));
        return;
      }
  
      // Create Spotify playlist
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
  
      if (!response.ok) {
        throw new Error('Failed to create playlist.');
      }
  
      const playlistData = await response.json();

      // reformat image inputs
      const formattedImageFile = await reformat(imageFile);

      // Add uploaded image as playlist cover
      addPlaylistImage(formattedImageFile, playlistData, providerKey);

      // Use Spotify API to get recommendations based on 5 seeds (3 artists, 2 genres)
      const recommendations = await fetchRecommendations(providerKey, formattedImageFile);

      const uniqueId = uniqid();
      const { data: imageData, error: imageError } = await supabaseClient.storage.from('images').upload(`images-${values.title}-${uniqueId}`, formattedImageFile, {
        cacheControl: '3600',
        upsert: false
      });
  
      // Add recommended songs to playlist
      await addRecommendedSongs(recommendations['tracks'], playlistData, providerKey);
  
      // Add playlist to Supabase
      const { data: supabasePlaylistData, error: supabasePlaylistError } = await supabaseClient.from('playlists').upsert({
        user_id: user.id,
        public: isPublic,
        title: values.title,
        description: values.description,
        image_path: imageData?.path,
        playlist_url: playlistData.external_urls["spotify"],
      }).select();
  
      if (supabasePlaylistError) {
        throw supabasePlaylistError;
      }
  
      // Add songs to Supabase and link them to the playlist
      const songInsertions = recommendations['tracks'].map(async (track: SpotifyTrack) => {
        await supabaseClient.from('songs').upsert({
          id: track.id,
          title: track.name,
          artist: track.artists[0].name,
          preview_url: track.preview_url,
          image_url: track.album.images[2].url
        }, { ignoreDuplicates: true });
  
        await supabaseClient.from('in_playlist').insert({
          song_id: track.id,
          playlist_id: supabasePlaylistData[0].id, // https://supabase.com/docs/reference/javascript/db-modifiers-select
        });
      });
  
      await Promise.all(songInsertions);
  
      // Handle errors
      if (supabasePlaylistError) {
        throw new Error('Failed to add playlist to database.');
      }

      router.refresh();
      toast.success('Playlist created!');
      reset();
      onClose();
    } catch (error : any) {
      toast.error(error.message || 'Something went wrong!');
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
          <Input id='image' type='file' disabled={isLoading} {...register('image')} accept="image/heic, image/heif, image/jpeg, image/jpg, image/png" className="hover:cursor-pointer"/>
        </div>
        <Button type='submit'>
          Generate Photofy Playlist
        </Button>
      </form>
    </Modal>
  )
}

const fetchRecommendations = async (providerKey: string, imageFile: Blob) => {
  try {
    // Fetch top artists --> we'll grab 20 for now
    const response = await fetch('https://api.spotify.com/v1/me/top/artists?limit=15', {
      headers: {
        'Authorization': `Bearer ${providerKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch top artists');
    }

    const data = await response.json();

    const base64Data = await convertBase64(imageFile);

    const topArtists = data.items.map((artist: {id: string, name: string}) => {
      return {
        name: artist.name,
        id: artist.id
      };
    });

    const artistNames: string = topArtists.map((artist: {id: string, name: string}) => artist.name).join(', ');

    const domain = window?.location?.origin || '';
    const anthropic = new Anthropic({
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      baseURL: domain + '/anthropic/',
    });

    const seeds = await anthropic.messages.create({
      max_tokens: 1024,
      system: "Spotify only has the following genres: acoustic, afrobeat, alt-rock, alternative, ambient, anime, black-metal, bluegrass, blues, bossanova, brazil, breakbeat, british, cantopop, chicago-house, children, chill, classical, club, comedy, country, dance, dancehall, death-metal, deep-house, detroit-techno, disco, disney, drum-and-bass, dub, dubstep, edm, electro, electronic, emo, folk, forro, french, funk, garage, german, gospel, goth, grindcore, groove, grunge, guitar, happy, hard-rock, hardcore, hardstyle, heavy-metal, hip-hop, holidays, honky-tonk, house, idm, indian, indie, indie-pop, industrial, iranian, j-dance, j-idol, j-pop, j-rock, jazz, k-pop, kids, latin, latino, malay, mandopop, metal, metal-misc, metalcore, minimal-techno, movies, mpb, new-age, new-release, opera, pagode, party, philippines-opm, piano, pop, pop-film, post-dubstep, power-pop, progressive-house, psych-rock, punk, punk-rock, r-n-b, rainy-day, reggae, reggaeton, road-trip, rock, rock-n-roll, rockabilly, romance, sad, salsa, samba, sertanejo, show-tunes, singer-songwriter, ska, sleep, songwriter, soul, soundtracks, spanish, study, summer, swedish, synth-pop, tango, techno, trance, trip-hop, turkish, work-out, world-music. Your response will be a comma-separated list containing 3 artist names and 2 of the aforementioned genres.",
      messages: [{ role: 'user', content: [
        {
          "type": "image",
          "source": {
              "type": "base64",
              "media_type": "image/jpeg",
              "data": `${base64Data}`,
          },
        },
        {
            "type": "text",
            "text": `A Spotify user loves the following artists: ${artistNames}. Using the provided image, pick 3 artists that make songs that match the vibe of the image. Then, pick 2 genres based on the image and the artists. DO NOT add additonal words. Your response should be like this: artist_name, artist_name, artist_name, genre, genre`
        }
      ]}],
      model: 'claude-3-sonnet-20240229',
    });

    const seededArtistsIds = seeds.content[0].text.split(',').map(element => element.trim()).map((name: string) => {
      const matchingArtist = topArtists.find((artist: {id: string, name: string}) => artist.name === name);
      return matchingArtist ? matchingArtist.id : null;
    }).filter((id: string) => id !== null);
    const seededGenres = seeds.content[0].text.split(',').slice(-2).map(genre => genre.trim()).join(',');

    console.log(seeds.content[0].text.split(','))

    // generate recommendations based on artists + genres retrieved from Claude
    const recommendationsResponse = await fetch(`https://api.spotify.com/v1/recommendations?seed_artists=${seededArtistsIds.join(',')}&seed_genres=${seededGenres}&limit=24`, {
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

const addPlaylistImage = async (imageFile: Blob, playlistData: SpotifyPlaylist | null, providerKey: string) => {
  // if here, image will be of valid size
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
}

const reformat = async (imageFile: any): Promise<Blob> => {
  try {
    let newImg = imageFile
    const fileName = imageFile.name.toLowerCase();
    
    // Check if file is heic/heif
    if ((fileName.endsWith(".heic") || fileName.endsWith(".heif")) && typeof window !== 'undefined') {
      const heic2any = require('heic2any'); // https://stackoverflow.com/questions/74842883/how-to-use-heic2any-in-next-js-client-side
      newImg = await heic2any({ blob: imageFile });
    }

    // Check if the file size exceeds the maximum allowed size (256 KB)
    const MAX_FILE_SIZE = 256 * 1024; // 256 KB in bytes
    if (newImg.size > MAX_FILE_SIZE && newImg instanceof Blob) {
      const compressedBlob = await new Promise<Blob>((resolve, reject) => {
        new Compressor(newImg, {
          quality: 0.8, 
          maxWidth: 500, 
          maxHeight: 500,
          mimeType: "image/jpeg", // Specify the output image format
          success (compressedResult: any) { resolve(compressedResult) },
          error(err: any) { reject(err) },
        });
      });
      newImg = compressedBlob;
    }
    return newImg;
  } catch (error) {
    console.error('Error reformatting image', error);
    throw error;
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

const convertBase64 = (imageFile: any) => {
  return new Promise((resolve) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(imageFile);
    fileReader.onload = () => {
      const result = fileReader.result;
      if (typeof result === 'string') {
        resolve(result.split(',')[1]);
      }
    };
  });
};


export default UploadModal;
