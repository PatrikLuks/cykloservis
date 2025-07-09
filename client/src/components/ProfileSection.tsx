import React, { useState, useEffect } from 'react';

interface ProfileSectionProps {
  token: string | null;
  user: string | null;
  setUser: (u: string) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ token, user, setUser }) => {
  const [profile, setProfile] = useState<{ name: string; email: string }>({ name: '', email: '' });
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:3001/api/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.name) setProfile(data); });
  }, [token]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  };
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setMsg('');
    try {
      const res = await fetch('http://localhost:3001/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba');
      setProfile(data);
      setEdit(false);
      setUser(data.name);
      setMsg('Profil uložen.');
    } catch (e: any) {
      setErr(e.message);
    }
  };
  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setMsg('');
    try {
      const res = await fetch('http://localhost:3001/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba');
      setMsg('Heslo změněno.');
      setPwForm({ oldPassword: '', newPassword: '' });
    } catch (e: any) {
      setErr(e.message);
    }
  };
  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>Profil</h2>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {!edit ? (
        <>
          <p><b>Jméno:</b> {profile.name}</p>
          <p><b>E-mail:</b> {profile.email}</p>
          <button onClick={() => { setEdit(true); setForm(profile); }}>Upravit profil</button>
        </>
      ) : (
        <form onSubmit={saveProfile}>
          <input type="text" name="name" value={form.name} onChange={handleProfileChange} required />
          <input type="email" name="email" value={form.email} onChange={handleProfileChange} required />
          <button type="submit">Uložit</button>
          <button type="button" onClick={() => setEdit(false)}>Zrušit</button>
        </form>
      )}
      <hr />
      <h3>Změna hesla</h3>
      <form onSubmit={savePassword}>
        <input type="password" name="oldPassword" value={pwForm.oldPassword} onChange={handlePwChange} placeholder="Staré heslo" required />
        <input type="password" name="newPassword" value={pwForm.newPassword} onChange={handlePwChange} placeholder="Nové heslo" required />
        <button type="submit">Změnit heslo</button>
      </form>
    </div>
  );
};

export default ProfileSection;
