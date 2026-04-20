export default function ThemeToggle({ mode, onToggle }) {
  const isDark = mode === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <i className={isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'} />
    </button>
  );
}
