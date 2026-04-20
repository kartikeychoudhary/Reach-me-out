import Avatar from './Avatar.jsx';
import ActionButtons from './ActionButtons.jsx';

export default function ProfileCard({ profile, onShareQr, onToast }) {
  return (
    <div className="profile-card glass">
      <Avatar name={profile.name} src={profile.avatar} />
      <h1 className="profile-name">{profile.name || 'Your Name'}</h1>
      {profile.title && <div className="profile-title">{profile.title}</div>}
      {profile.bio && <p className="profile-bio">{profile.bio}</p>}
      <div className="profile-divider" />
      <ActionButtons profile={profile} onShareQr={onShareQr} onToast={onToast} />
    </div>
  );
}
