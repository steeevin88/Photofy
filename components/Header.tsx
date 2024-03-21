"use client";

import { useRouter } from "next/navigation";
import { BiSupport } from "react-icons/bi";
import { HiHome } from "react-icons/hi";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { twMerge } from "tailwind-merge";
import Button from "./Button";

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({children, className}) => {
  const router = useRouter();
  const handleLogout = () => {
    // handle logout
  }

  return (
    <div className={twMerge(`h-fit bg-gradient-to-b from-emerald-800 p-6`, className)}>
      <div className="w-full mb-4 flex items-center justify-between">
        {/* Desktop View */}
        <div className="hidden md:flex gap-x-2 items-center">
          <button className="rounded-full bg-black flex items-center justify-center hover:opacity-75" onClick={() => router.back()}>
            <RxCaretLeft size={35}/>
          </button>
          <button className="rounded-full bg-black flex items-center justify-center hover:opacity-75" onClick={() => router.forward()}>
            <RxCaretRight size={35}/>
          </button>
        </div>
        
        {/* Mobile View */}
        <div className="flex md:hidden gap-x-2 items-center">
          <button className="rounded-full bg-white p-2 flex items-center justify-center hover:opacity-75">
            <HiHome className="text-black" size={20}/>
          </button>
          <button className="rounded-full bg-white p-2 flex items-center justify-center hover:opacity-75">
            <BiSupport className="text-black" size={20}/>
          </button>
        </div>
        <div className="flex justify-between items-center gap-x-4">
          <>
            <div>
              <Button className="bg-transparent text-neutral-300 font-medium" onClick={() => {}}>
                Sign Up
              </Button>
            </div>
            <div>
              <Button className="bg-white px-6 py-2" onClick={() => {}}>
                Log In
              </Button>
            </div>
          </>
        </div>
      </div>
      {children}
    </div>
  )
}

export default Header;
