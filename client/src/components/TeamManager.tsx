import React, { useEffect, useState } from 'react';
import type { User } from '../../../shared/types';
import { RoleEditor } from './RoleEditor';

interface TeamManagerProps {
  serviceId: string;
  token: string;
}

const TeamManager: React.FC<TeamManagerProps> = ({ serviceId, token }) => {
  const [servicemen, setServicemen] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchTeam = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/services/${serviceId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba načítání týmu');
      setServicemen(data.servicemen || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeam(); }, [serviceId]);

  const handleRemove = async (userId: string) => {
    if (!window.confirm('Opravdu odebrat servisáka z týmu?')) return;
    setLoading(true);
    setMsg(''); setError('');
    try {
      const res = await fetch(`/api/services/${serviceId}/remove-serviceman`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) throw new Error('Chyba při odebírání');
      setMsg('Servisák odebrán.');
      fetchTeam();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(''); setError('');
    try {
      const res = await fetch(`/api/services/${serviceId}/invite-serviceman`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail, name: inviteName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba při pozvání');
      setMsg(data.info || 'Pozvánka odeslána.');
      setInviteEmail(''); setInviteName('');
      fetchTeam();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">Správa týmu servisu</h2>
      {loading && <div>Načítám…</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {msg && <div style={{ color: 'green' }}>{msg}</div>}
      <h3 className="font-bold mb-2">Seznam servisáků</h3>
      <ul className="mb-4">
        {servicemen.map(s => (
          <li key={s.id} className="flex flex-col gap-1 mb-2 p-2 border rounded">
            <div className="flex items-center gap-2">
              <span>{s.name} ({s.email})</span>
              <button onClick={() => handleRemove(s.id)} className="text-red-600 text-xs">Odebrat</button>
            </div>
            <RoleEditor user={s} token={token} onSave={fetchTeam} />
          </li>
        ))}
        {servicemen.length === 0 && <li>Žádní servisáci.</li>}
      </ul>
      <h3 className="font-bold mb-2">Pozvat nového servisáka</h3>
      <form onSubmit={handleInvite} className="flex gap-2 flex-wrap mb-2">
        <input type="text" placeholder="Jméno" value={inviteName} onChange={e => setInviteName(e.target.value)} required className="border rounded px-2 py-1" />
        <input type="email" placeholder="E-mail" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required className="border rounded px-2 py-1" />
        <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded">Pozvat</button>
      </form>
    </div>
  );
};

export default TeamManager;
