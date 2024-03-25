import { User } from "@supabase/auth-helpers-nextjs";
import { useSessionContext, useUser as useSupaUser } from "@supabase/auth-helpers-react";
import { createContext, useContext, useEffect, useState } from "react";

import { Subscription, UserDetails } from "@/types";

type SpotifyUser = {
  display_name: string;
  email: string;
  external_urls: {
      spotify: string;
  };
  followers: {
      href: string | null;
      total: number;
  };
  href: string;
  id: string;
  images: string[];
  type: "user";
  uri: string;
}

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
  spotifyData: SpotifyUser | null;
  providerKey: any;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  [propName: string]: any;
};

export const MyUserContextProvider = (props: Props) => {
  const {session, isLoading: isLoadingUser, supabaseClient: supabase} = useSessionContext();

  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [spotifyData, setSpotifyData] = useState<SpotifyUser | null>(null); // Initialize spotifyData state

  const getUserDetails = () => supabase.from('users').select('*').single();
  const getSubscription = () => supabase.from('subscriptions').select('*, prices(*, products(*))').in('status', ['trialing', 'active']).single()

  useEffect(() => {
    if (user && !isLoadingData && !userDetails && !subscription) {
      setIsLoadingData(true);

      Promise.allSettled([getUserDetails(), getSubscription()]).then(
        (results) => {
          const userDetailsPromise = results[0];
          const subscriptionPromise = results[1];

          if (userDetailsPromise.status === 'fulfilled') setUserDetails(userDetailsPromise.value.data as UserDetails);
          if (subscriptionPromise.status === 'fulfilled') setSubscription(subscriptionPromise.value.data as Subscription);

          setIsLoadingData(false);
        }
      );
    } else if (!user && !isLoadingUser && !isLoadingData) {
      setUserDetails(null);
      setSubscription(null);
    }
  }, [user, isLoadingUser]);

  useEffect(() => {
    if (session?.provider_token) {
      fetchSpotifyUserProfile(session.provider_token)
        .then((data: SpotifyUser) => {
          setSpotifyData(data);
        })
        .catch((error: any) => {
          console.error("Error fetching Spotify user profile:", error);
        });
    }
  }, [session?.provider_token]);

  const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    subscription,
    spotifyData,
    providerKey: session?.provider_token,
  };

  return <UserContext.Provider value={value} {...props}/>
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error('useUser must be used within a MyUserContextProvider');
  return context;
}

const fetchSpotifyUserProfile = async (accessToken: any) => {
  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to fetch Spotify user profile:", response.statusText);
      return;
    }
  } catch (error: any) {
    console.error("Error fetching Spotify user profile:", error.message);
    return;
  }
};  
