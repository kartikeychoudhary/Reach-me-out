import ParticleCanvas from './ParticleCanvas.jsx';

export default function Background() {
  return (
    <div className="bg">
      <ParticleCanvas />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="bg-noise-layer" />
    </div>
  );
}
