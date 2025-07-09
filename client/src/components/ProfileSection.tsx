import React, { useState, useEffect } from 'react';
import { TwoFactorSection } from './TwoFactorSection';

declare global {
  interface Window {
    liteMode?: boolean;
  }
}

interface ProfileSectionProps {
  token: string | null;
  setUser: (u: string) => void;
}

const ProfileSection: React.FC<Omit<ProfileSectionProps, 'user'>> = ({ token, setUser }) => {
  const [profile, setProfile] = useState<{ name: string; email: string }>({ name: '', email: '' });
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [stravaMsg, setStravaMsg] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [pushStatus, setPushStatus] = useState<'idle'|'enabled'|'denied'|'unsupported'>('idle');
  const [notificationPrefs, setNotificationPrefs] = useState({ email: true, push: true, types: ['reservation', 'team', 'system'] });
  const [prefsMsg, setPrefsMsg] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:3001/api/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.name) setProfile(data); });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    import('../utils/notificationPreferences').then(({ getNotificationPreferences }) => {
      getNotificationPreferences(token).then(prefs => {
        if (prefs) setNotificationPrefs(prefs);
      });
    });
  }, [token]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  };
  const handlePrefsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationPrefs(p => ({ ...p, [name]: checked }));
  };
  const handleTypeChange = (type: string) => {
    setNotificationPrefs(p => ({ ...p, types: p.types.includes(type) ? p.types.filter(t => t !== type) : [...p.types, type] }));
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
  // Načtení aktivit ze Stravy
  const fetchStravaActivities = async () => {
    setStravaMsg('');
    try {
      const res = await fetch('http://localhost:3001/api/strava/activities', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba při načítání aktivit');
      setActivities(data);
    } catch (e: any) {
      setStravaMsg(e.message);
    }
  };
  // Propojení se Stravou
  const handleStravaConnect = () => {
    window.location.href = 'http://localhost:3001/api/strava/connect';
  };
  const handleEnablePush = async () => {
    setPushStatus('idle');
    try {
      const { supported, granted } = await import('../registerPush').then(m => m.registerPushNotifications());
      if (!supported) setPushStatus('unsupported');
      else if (granted) setPushStatus('enabled');
      else setPushStatus('denied');
    } catch {
      setPushStatus('denied');
    }
  };
  const savePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefsMsg('');
    const { saveNotificationPreferences } = await import('../utils/notificationPreferences');
    const ok = await saveNotificationPreferences(token!, notificationPrefs);
    setPrefsMsg(ok ? 'Uloženo.' : 'Chyba při ukládání.');
  };
  // Lite režim – skryj Strava, notifikace, 2FA, pokročilé preference
  if (window.liteMode) {
    return (
      <div>
        <h2>Profil</h2>
        <p>Jméno: {profile.name}</p>
        <p>E-mail: {profile.email}</p>
        <p>Lite verze – pokročilé funkce nejsou dostupné.</p>
      </div>
    );
  }
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
      <hr />
      <h3>Strava</h3>
      <button onClick={handleStravaConnect}>Propojit se Strava účtem</button>
      <button onClick={fetchStravaActivities} style={{ marginLeft: 8 }}>Načíst aktivity</button>
      {stravaMsg && <div style={{ color: 'red' }}>{stravaMsg}</div>}
      <ul>
        {activities.map((a) => (
          <li key={a.id}>{a.name} | {a.distance / 1000} km | {new Date(a.start_date).toLocaleString()}</li>
        ))}
        {activities.length === 0 && <li>Žádné aktivity.</li>}
      </ul>
      <hr />
      <h3>Push notifikace</h3>
      {pushStatus === 'enabled' && <span style={{color:'green'}}>Push notifikace jsou aktivní.</span>}
      {pushStatus === 'denied' && <span style={{color:'red'}}>Push notifikace byly zamítnuty nebo selhaly.</span>}
      {pushStatus === 'unsupported' && <span style={{color:'gray'}}>Push notifikace nejsou podporovány.</span>}
      {pushStatus === 'idle' && <button onClick={handleEnablePush}>Povolit push notifikace</button>}
      <hr />
      <h3>Notifikační preference</h3>
      <form onSubmit={savePrefs}>
        <label><input type="checkbox" name="email" checked={notificationPrefs.email} onChange={handlePrefsChange} /> E-mail</label>
        <label style={{marginLeft:8}}><input type="checkbox" name="push" checked={notificationPrefs.push} onChange={handlePrefsChange} /> Push</label>
        <div style={{marginTop:8}}>
          <b>Typy notifikací:</b>
          {['reservation','team','system'].map(type => (
            <label key={type} style={{marginLeft:8}}>
              <input type="checkbox" checked={notificationPrefs.types.includes(type)} onChange={() => handleTypeChange(type)} /> {type}
            </label>
          ))}
        </div>
        <button type="submit" style={{marginTop:8}}>Uložit preference</button>
        {prefsMsg && <span style={{marginLeft:8}}>{prefsMsg}</span>}
      </form>
      <hr />
      <h3>Dvoufaktorová autentizace</h3>
      <TwoFactorSection token={token!} />
    </div>
  );
};

export default ProfileSection;
