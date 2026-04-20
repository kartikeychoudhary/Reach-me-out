const BG_CLASSES = ['bg-mesh', 'bg-gradient', 'bg-solid', 'bg-noise'];
const MODE_CLASSES = ['light', 'dark'];

export function applyThemeToDocument({ mode, background, primary, accent, radius, blur }) {
  const root = document.documentElement;
  if (primary) root.style.setProperty('--primary', primary);
  if (accent) root.style.setProperty('--accent', accent);
  if (radius) root.style.setProperty('--radius-btn', `${radius}px`);
  if (blur === false) root.style.setProperty('--blur', 'none');

  const body = document.body;
  MODE_CLASSES.forEach((c) => body.classList.remove(c));
  BG_CLASSES.forEach((c) => body.classList.remove(c));
  body.classList.add(mode === 'light' ? 'light' : 'dark');
  body.classList.add(`bg-${background || 'mesh'}`);

  // keep avatar ring gap in sync with base bg
  document.querySelectorAll('.avatar-ring-gap').forEach((el) => {
    el.style.background = mode === 'light' ? '#f2f2f7' : '#000';
  });
}

export function setMode(mode) {
  const body = document.body;
  MODE_CLASSES.forEach((c) => body.classList.remove(c));
  body.classList.add(mode);
  document.querySelectorAll('.avatar-ring-gap').forEach((el) => {
    el.style.background = mode === 'light' ? '#f2f2f7' : '#000';
  });
}
