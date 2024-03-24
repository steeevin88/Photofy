"use client";

import Modal from "./Modal"
import useUploadModal from "@/hooks/useUploadModal";

const UploadModal = () => {
  const { onClose, isOpen } = useUploadModal();

  const onChange = (open: boolean) => {
    if (!open) {
      // reset the form

      // close the modal
      onClose();
    }
  }

  return (
    <Modal title="Generate a new playlist!" description="🎵 Upload a photo and turn memories into music 🎵" isOpen={isOpen} onChange={onChange}>
      Upload Content
    </Modal>
  )
}

export default UploadModal;
