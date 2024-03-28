import Stripe from "stripe";

export interface Playlist {
  id: string;
  created_at: string;
  title: string;
  playlist_url: string;
  image_path: string;
  user_id: string;
  description: string;
  public: string;
}

export interface UserDetails {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  avatar_url?: string;
  billing_address?: Stripe.Address;
  payment_method?: Stripe.PaymentMethod[Stripe.PaymentMethod.Type];
}

export interface Product {
  id: string;
  active?: boolean;
  name?: string;
  description?: string;
  image?: string;
  metadata?: Stripe.Metadata;
}

export interface Price {
  id: string;
  product_id?: string;
  active?: boolean;
  description?: string;
  unit_amount?: number;
  currency?: string;
  type?: Stripe.Price.Type;
  interval?: Stripe.Price.Recurring.Interval
  interval_count?: number;
  trial_period_days?: number | null;
  metadata?: Stripe.Metadata;
  products?: Product;
}

export interface Subscription {
  id: string;
  user_id: string;
  status?: Stripe.Subscription.Status;
  metadata?: Stripe.Metadata;
  price_id?: string;
  quantity?: number;
  cancel_at_period_end?: boolean;
  created: string;
  current_period_start: string;
  current_period_end: string;
  ended_at?: string;
  cancel_at?: string;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
  prices?: Price;
}

export interface SpotifyPlaylist {
  collaborative: boolean;
  description: string;
  external_urls: {
      spotify: string;
  };
  followers: {
      href: string | null;
      total: number;
  };
  href: string;
  id: string;
  images: {
      height: number | null;
      url: string;
      width: number | null;
  }[];
  name: string;
  owner: {
      href: string;
      id: string;
      type: string;
      uri: string;
      display_name: string | null;
  };
  primary_color: string | null;
  public: boolean;
  snapshot_id: string;
  tracks: {
      limit: number;
      next: string | null;
      offset: number;
      previous: string | null;
      href: string;
  };
  type: string;
  uri: string;
};

export interface SpotifyTrack {
  album_type: string;
  album: {
    images:{
      url: string;
    }[]
  }
  artists: {
    name: string;
  }[];
  available_markets: string[];
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  type: string;
  uri: string;
}

