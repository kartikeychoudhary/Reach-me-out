export function buildVCard(p) {
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${p.name || ''}`,
    p.title ? `TITLE:${p.title}` : '',
    p.phone ? `TEL;TYPE=CELL:${p.phone}` : '',
    p.email ? `EMAIL:${p.email}` : '',
    p.website ? `URL:${p.website}` : '',
    p.location ? `ADR;TYPE=HOME:;;${p.location};;;;` : '',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\r\n');
}

export function downloadVCard(p) {
  const blob = new Blob([buildVCard(p)], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: `${(p.name || 'contact').replace(/\s+/g, '-').toLowerCase()}.vcf`,
  });
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1000);
}
