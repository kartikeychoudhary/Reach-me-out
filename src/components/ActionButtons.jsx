import { useState } from 'react';
import { downloadVCard } from '../utils/vcard.js';

function ripple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const rip = document.createElement('span');
  rip.className = 'ripple';
  Object.assign(rip.style, {
    width: `${size}px`,
    height: `${size}px`,
    left: `${e.clientX - rect.left - size / 2}px`,
    top: `${e.clientY - rect.top - size / 2}px`,
  });
  btn.appendChild(rip);
  setTimeout(() => rip.remove(), 600);
}

export default function ActionButtons({ profile, onShareQr, onToast }) {
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    ripple(e);
    downloadVCard(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  }

  async function handleShare() {
    const url = profile.website || window.location.href;
    const title = profile.name || 'my page';
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled — fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      onToast?.('fa-check', 'Link copied to clipboard');
    } catch {
      onToast?.('fa-triangle-exclamation', 'Could not copy link');
    }
  }

  return (
    <div className="profile-actions">
      <button
        type="button"
        className={`action-btn action-btn--primary${saved ? ' saved' : ''}`}
        onClick={handleSave}
      >
        {saved ? (
          <>
            <i className="fa-solid fa-check" /> Saved to Contacts
          </>
        ) : (
          <>
            <i className="fa-solid fa-address-card" /> Save Contact
          </>
        )}
      </button>
      <button type="button" className="action-btn action-btn--accent" onClick={onShareQr}>
        <i className="fa-solid fa-qrcode" /> Share QR
      </button>
      <button type="button" className="action-btn action-btn--blend" onClick={handleShare}>
        <i className="fa-solid fa-arrow-up-from-bracket" /> Share
      </button>
    </div>
  );
}
