interface PdfViewerProps {
  src: string;
  title: string;
  modal?: boolean;
}

export default function PdfViewer({ src, title, modal = false }: PdfViewerProps) {
  return (
    <div
      className={
        modal
          ? 'flex h-[90dvh] w-[90vw] max-w-5xl flex-col bg-white'
          : 'flex h-[70dvh] min-h-96 w-full flex-col'
      }
    >
      <div className={`flex shrink-0 justify-end bg-white py-2 ${modal ? 'pr-14 sm:pr-0' : ''}`}>
        <a href={src} target="_blank" rel="noreferrer" className="link-text text-xs">
          別タブで開く
        </a>
      </div>
      <object
        data={src}
        type="application/pdf"
        aria-label={`${title}のPDF`}
        className="min-h-0 w-full flex-1 border border-black bg-white"
      >
        <p className="p-4">
          PDFを表示できませんでした。
          <a href={src} target="_blank" rel="noreferrer" className="link-text">
            PDFを開く
          </a>
        </p>
      </object>
    </div>
  );
}
