"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { HiHome } from "react-icons/hi";
import { BiSupport } from "react-icons/bi";

import Box from "./Box";
import SidebarItem from "./SidebarItem";
import Library from "./Library";
import { Playlist } from "@/types";

interface SidebarProps {
  children: React.ReactNode;
  playlists: Playlist[];
}

const Sidebar: React.FC<SidebarProps> = ({children, playlists}) => {
  const pathname = usePathname();

  const routes = useMemo(() => [
    {
      icon: HiHome,
      label: 'Home',
      active: pathname !== '/guide',
      href: '/',
    },
    {
      icon: BiSupport,
      label: 'Guide',
      active: pathname === '/guide',
      href: '/guide'
    }
  ],[pathname]);

  return (
    <div className="flex h-full">
      <div className="hidden md:flex flex-col gap-y-2 bg-black h-full w-[300px] p-2">
        <Box>
          <div className="flex flex-col gap-y-4 px-5 py-4">
            {routes.map((item) => (
              <SidebarItem key={item.label} {...item}/>
            ))}
          </div>
        </Box>
        <Box className="overflow-y-auto h-full">
          <Library playlists={playlists}/>
        </Box>
      </div>
      <main className="h-full flex-1 overflow-y-auto py-2">
        {children}
      </main>
    </div>
  )
}

export default Sidebar;
