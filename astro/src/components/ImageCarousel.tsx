import { useEffect, useMemo, useRef, useState } from 'react';

export interface ImageCarouselImage {
  src: string;
  alt: string;
}

interface ImageCarouselProps {
  images: ImageCarouselImage[];
  ariaLabel: string;
  autoplay?: boolean;
  showBullets?: boolean;
  loop?: boolean;
  className?: string;
}

const AUTOPLAY_INTERVAL_MS = 5000;
const SWIPE_THRESHOLD_PX = 30;

export default function ImageCarousel({
  images,
  ariaLabel,
  autoplay = false,
  showBullets = true,
  loop = true,
  className = '',
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const boundedImages = useMemo(() => images.filter((image) => image.src), [images]);
  const canNavigate = boundedImages.length > 1;
  const lastIndex = boundedImages.length - 1;

  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  const goTo = (nextIndex: number) => {
    if (boundedImages.length === 0) return;

    if (loop) {
      setCurrentIndex(
        ((nextIndex % boundedImages.length) + boundedImages.length) % boundedImages.length,
      );
      return;
    }

    setCurrentIndex(Math.min(Math.max(nextIndex, 0), lastIndex));
  };

  useEffect(() => {
    if (!autoplay || !canNavigate) return;

    const id = window.setInterval(() => {
      goTo(currentIndex + 1);
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      window.clearInterval(id);
    };
  }, [autoplay, canNavigate, currentIndex, loop, lastIndex, boundedImages.length]);

  if (boundedImages.length === 0) {
    return null;
  }

  return (
    <section className={className} aria-label={ariaLabel}>
      <div
        className="relative border border-black"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].pageX;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;

          const endX = event.changedTouches[0].pageX;

          const distance = endX - touchStartX.current;
          touchStartX.current = null;

          if (Math.abs(distance) > SWIPE_THRESHOLD_PX) {
            goTo(distance > 0 ? currentIndex - 1 : currentIndex + 1);
          }
        }}
      >
        {boundedImages.map((image, index) => (
          <div
            key={`${image.src}-${String(index)}`}
            data-carousel-item
            data-active={index === currentIndex ? 'true' : 'false'}
            className={[
              index === currentIndex
                ? 'relative opacity-100'
                : 'pointer-events-none absolute inset-0 opacity-0',
              'transition-opacity duration-300',
            ].join(' ')}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}

        {canNavigate && (
          <>
            <button
              type="button"
              aria-label="前の画像"
              className="absolute top-0 left-0 h-full w-1/4 bg-gradient-to-r sm:hover:from-purple-100/25"
              onClick={() => {
                goTo(currentIndex - 1);
              }}
            >
              <span className="mr-auto flex size-8 items-center justify-center bg-black/25 text-white">
                ←
              </span>
            </button>
            <button
              type="button"
              aria-label="次の画像"
              className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l sm:hover:from-purple-100/25"
              onClick={() => {
                goTo(currentIndex + 1);
              }}
            >
              <span className="ml-auto flex size-8 items-center justify-center bg-black/25 text-white">
                →
              </span>
            </button>
          </>
        )}
      </div>

      {canNavigate && showBullets && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {boundedImages.map((image, index) => (
            <button
              key={`${image.src}-bullet-${String(index)}`}
              type="button"
              aria-label={`画像${String(index + 1)}`}
              aria-current={index === currentIndex ? 'true' : undefined}
              className={[index === currentIndex ? 'bg-black' : 'bg-gray-100', 'h-2 w-2'].join(' ')}
              onClick={() => {
                goTo(index);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
