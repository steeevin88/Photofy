"use client";

import { useEffect, useState } from "react";

import AuthModal from "@/components/AuthModal";

const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  {/* don't render modals in server side --> render after mount */}
  useEffect(() => { 
    setIsMounted(true);
  }, [])

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <AuthModal/>
    </>
  )
}

export default ModalProvider;