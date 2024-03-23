"use client";

import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect } from "react";

import Modal from "./Modal";
import useAuthModal from "@/hooks/useAuthModal";

const AuthModal = () => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const { session } = useSessionContext();
  const { onClose, isOpen } = useAuthModal();

  useEffect(() => {
    if (session) {
      router.refresh();
      onClose();
    }
  }, [session, router, onClose]);

  useEffect(() => {
    if (session) fetchSpotifyUserProfile(session.provider_token);
  }, [session])

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  }

  const fetchSpotifyUserProfile = async (accessToken: any) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      if (response.ok) {
        const userProfile = await response.json();
        console.log("Spotify User Profile:", userProfile);
      } else {
        console.error("Failed to fetch Spotify user profile:", response.statusText);
      }
    } catch (error: any) {
      console.error("Error fetching Spotify user profile:", error.message);
    }
  };  

  return (
    <Modal title="Welcome back!" description="Log into your account" isOpen={isOpen} onChange={onChange}>
      <Auth theme='dark' providers={["spotify"]} magicLink supabaseClient={supabaseClient} appearance={{
        theme:ThemeSupa, 
        variables: {
          default: {
            colors: {
              brand: '#404040',
              brandAccent: '#22c55e'
            }
          }
        }
      }}/>
    </Modal>
  )
}

export default AuthModal;
