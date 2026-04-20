import { useEffect, useMemo, useRef } from 'react';
import qrcode from 'qrcode-generator';

export default function QrSheet({ url, open, onClose }) {
  const frameRef = useRef(null);

  const svgMarkup = useMemo(() => {
    if (!url) return '';
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    return qr.createSvgTag({ scalable: true, margin: 0 });
  }, [url]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose?.();
  }

  return (
    <div
      className={`qr-backdrop${open ? ' open' : ''}`}
      onClick={handleBackdropClick}
      aria-hidden={!open}
    >
      <div className="qr-sheet" role="dialog" aria-modal="true" aria-label="Share QR code">
        <div className="qr-pill" />
        <div className="qr-title">Scan to share</div>
        <div
          className="qr-frame"
          ref={frameRef}
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
        <div className="qr-subtitle">{url}</div>
        <button type="button" className="qr-close" onClick={onClose} aria-label="Close">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
    </div>
  );
}
