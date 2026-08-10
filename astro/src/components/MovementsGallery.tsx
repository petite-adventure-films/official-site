import { useState } from 'react';

import Modal from './Modal';
import ModalOpenIcon from './ModalOpenIcon';

export interface MovementGalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface MovementGalleryEntry {
  year: number;
  month: number;
  images: MovementGalleryImage[];
}

interface MovementsGalleryProps {
  entries: MovementGalleryEntry[];
}

export default function MovementsGallery({ entries }: MovementsGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<MovementGalleryImage | null>(null);

  return (
    <>
      <div className="mt-4 flex flex-col gap-4">
        {entries.map((entry) => (
          <section key={`${String(entry.year)}-${String(entry.month)}`}>
            <h3>
              {entry.year}年{entry.month}月
            </h3>
            <div className="mt-2 flex flex-wrap items-start gap-2">
              {entry.images.map((image) => (
                <button
                  key={image.src}
                  type="button"
                  aria-label={`${image.alt}を拡大表示`}
                  className="group relative block h-auto w-32 sm:w-40"
                  onClick={() => {
                    setSelectedImage(image);
                  }}
                >
                  <img
                    src={image.src}
                    alt=""
                    width={image.width}
                    height={image.height}
                    className="block border border-white"
                    loading="lazy"
                  />
                  <ModalOpenIcon className="absolute right-1 bottom-1" />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Modal
        open={selectedImage !== null}
        onClose={() => {
          setSelectedImage(null);
        }}
        ariaLabel="高幡台団地の今の資料画像"
      >
        {selectedImage && (
          <img
            src={selectedImage.src}
            alt={selectedImage.alt}
            width={selectedImage.width}
            height={selectedImage.height}
            className="block size-auto max-w-full"
          />
        )}
      </Modal>
    </>
  );
}
