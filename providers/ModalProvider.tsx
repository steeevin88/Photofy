"use client";

import { useEffect, useState } from "react";

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
      Modals
    </>
  )
}

export default ModalProvider;