"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

import { Database } from "@/types_db"

interface SuperbaseProviderProps {
  children: React.ReactNode;
}

const SupabaseProvider: React.FC<SuperbaseProviderProps> = ({children}) => {
  const [supabaseClient] = useState(() => {
    return createClientComponentClient<Database>()
  });

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  )
}

export default SupabaseProvider;
