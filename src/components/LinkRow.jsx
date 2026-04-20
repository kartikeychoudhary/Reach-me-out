export default function LinkRow({ link, index }) {
  const url = link.url || '#';
  const isExternal = !/^(tel:|mailto:)/.test(url);
  const style = {
    '--btn-color': link.color || 'var(--primary)',
    animationDelay: `${160 + index * 55}ms`,
  };

  return (
    <a
      className="link-btn"
      href={url}
      style={style}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className="link-icon-wrap">
        <i className={link.icon || 'fa-solid fa-link'} />
      </span>
      <span className="link-label">{link.label}</span>
      {link.badge && <span className="link-badge">{link.badge}</span>}
      <i className="fa-solid fa-chevron-right link-chevron" />
    </a>
  );
}
