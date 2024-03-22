"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/Modal";

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
      <Modal title="Test Modal" description="Test Description" isOpen onChange={() => {}}>
        children!
      </Modal>
    </>
  )
}

export default ModalProvider;