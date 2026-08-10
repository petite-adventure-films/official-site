import { useEffect, useState } from 'react';

import Modal from './Modal';
import PdfViewer from './PdfViewer';

interface SelectedPdf {
  src: string;
  title: string;
}

export default function PdfModalController() {
  const [selectedPdf, setSelectedPdf] = useState<SelectedPdf | null>(null);

  useEffect(() => {
    const openPdf = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>('a[data-pdf-viewer]');
      if (!link) return;

      event.preventDefault();
      setSelectedPdf({
        src: link.href,
        title: link.dataset.pdfViewerTitle || link.innerText.trim() || 'PDF',
      });
    };

    document.addEventListener('click', openPdf);
    return () => {
      document.removeEventListener('click', openPdf);
    };
  }, []);

  return (
    <Modal
      open={selectedPdf !== null}
      onClose={() => {
        setSelectedPdf(null);
      }}
      ariaLabel={selectedPdf ? `${selectedPdf.title}のPDF` : 'PDFビューア'}
    >
      {selectedPdf && <PdfViewer src={selectedPdf.src} title={selectedPdf.title} modal />}
    </Modal>
  );
}
