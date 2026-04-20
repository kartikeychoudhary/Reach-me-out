import LinkRow from './LinkRow.jsx';

export default function LinkList({ links, label = 'Connect with me' }) {
  const visible = links.filter((l) => l.enabled !== false);
  if (!visible.length) return null;

  return (
    <>
      <div className="section-label" style={{ animationDelay: '60ms' }}>
        {label}
      </div>
      <div className="links-list">
        {visible.map((link, i) => (
          <LinkRow key={`${link.label}-${i}`} link={link} index={i} />
        ))}
      </div>
    </>
  );
}
