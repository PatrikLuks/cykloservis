import React, { useState } from 'react';
import type { User, Permission } from '../../../shared/types';

const ALL_PERMISSIONS: { key: Permission; label: string }[] = [
  { key: 'manage_team', label: 'Správa týmu' },
  { key: 'manage_services', label: 'Správa služeb' },
  { key: 'view_stats', label: 'Statistiky' },
  { key: 'manage_settings', label: 'Nastavení servisu' },
  { key: 'create_reservation', label: 'Vytváření rezervací' },
];

export function RoleEditor({ user, token, onSave }: { user: User; token: string; onSave: (u: User) => void }) {
  const [role, setRole] = useState(user.role);
  const [permissions, setPermissions] = useState<Permission[]>(user.permissions || []);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handlePermChange = (perm: Permission) => {
    setPermissions(p => p.includes(perm) ? p.filter(x => x !== perm) : [...p, perm]);
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr('');
    const res = await fetch(`/api/roles/user/${user.id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role, permissions })
    });
    const data = await res.json();
    if (res.ok) { setMsg('Uloženo.'); onSave(data.user); }
    else setErr(data.error || 'Chyba');
  };
  return (
    <form onSubmit={handleSave} style={{marginTop:8,marginBottom:8}}>
      <label>Role:
        <select value={role} onChange={e=>setRole(e.target.value as any)}>
          <option value="owner">Majitel</option>
          <option value="serviceman">Servisák</option>
          <option value="customer">Zákazník</option>
        </select>
      </label>
      <div style={{marginTop:8}}>
        <b>Práva:</b>
        {ALL_PERMISSIONS.map(p => (
          <label key={p.key} style={{marginLeft:8}}>
            <input type="checkbox" checked={permissions.includes(p.key)} onChange={()=>handlePermChange(p.key)} /> {p.label}
          </label>
        ))}
      </div>
      <button type="submit" style={{marginTop:8}}>Uložit</button>
      {msg && <span style={{color:'green',marginLeft:8}}>{msg}</span>}
      {err && <span style={{color:'red',marginLeft:8}}>{err}</span>}
    </form>
  );
}
