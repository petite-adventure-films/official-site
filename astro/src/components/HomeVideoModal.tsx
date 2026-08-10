import { useState } from 'react';

import Modal from './Modal';

export default function HomeVideoModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="link-text mx-auto mt-8 block text-xs"
        onClick={() => {
          setOpen(true);
        }}
      >
        オープニング映像の全編を見る（1:15）▶️
      </button>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        ariaLabel="オープニング映像"
      >
        <div className="relative bg-black">
          <img src="/assets/images/op.png" alt="" className="block max-h-[90dvh] w-full" />
          <video muted controls className="absolute inset-0 size-full object-contain">
            <source src="/assets/video/home.mp4" type="video/mp4" />
          </video>
        </div>
      </Modal>
    </>
  );
}
