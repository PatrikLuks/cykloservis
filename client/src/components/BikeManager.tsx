import React, { useState } from 'react';
import type { Bike } from '../../../shared/types';

interface BikeManagerProps {
  bikes: Bike[];
  setBikes: (b: Bike[]) => void;
  token: string | null;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const BikeManager: React.FC<BikeManagerProps> = ({ bikes, setBikes, token, showToast }) => {
  const [form, setForm] = useState<Partial<Bike>>({ name: '', brand: '', model: '', year: undefined });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Bike> | null>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3001/api/bikes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data: Bike = await res.json();
      if (!res.ok) throw new Error((data as any).error || 'Chyba');
      setBikes([data, ...bikes]);
      setForm({ name: '', brand: '', model: '', year: undefined });
      showToast('Kolo bylo přidáno.', 'success');
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    }
  };
  const startEdit = (bike: Bike) => {
    setEditingId(bike.id);
    setEditForm({ ...bike });
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token || !editingId || !editForm) return;
    try {
      const res = await fetch(`http://localhost:3001/api/bikes/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      const data: Bike = await res.json();
      if (!res.ok) throw new Error((data as any).error || 'Chyba');
      setBikes(bikes.map((b) => (b.id === editingId ? data : b)));
      setEditingId(null);
      setEditForm(null);
      showToast('Kolo bylo upraveno.', 'success');
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    }
  };
  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Opravdu smazat toto kolo?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/bikes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba');
      setBikes(bikes.filter((b) => b.id !== id));
      showToast('Kolo bylo smazáno.', 'success');
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
        <input type="text" name="name" placeholder="Název kola" value={form.name || ''} onChange={handleChange} required />
        <input type="text" name="brand" placeholder="Značka" value={form.brand || ''} onChange={handleChange} />
        <input type="text" name="model" placeholder="Model" value={form.model || ''} onChange={handleChange} />
        <input type="number" name="year" placeholder="Rok" value={form.year || ''} onChange={handleChange} />
        <button type="submit">Přidat kolo</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {bikes.map((bike) => (
          <li key={bike.id}>
            <div>
              <b>{bike.name}</b> {bike.model && `(${bike.model})`} {bike.brand && `- ${bike.brand}`} {bike.year && `, ${bike.year}`}
              {bike.createdAt && <span className="ml-2">Přidáno: {new Date(bike.createdAt).toLocaleDateString()}</span>}
              <span className="ml-2">Stav: <b>{bike.status === 'OK' ? 'ANO' : 'NE'}</b></span>
              {bike.kilometers !== undefined && <span className="ml-2">Km: {bike.kilometers}</span>}
              {bike.parts && <span className="ml-2">Součástky: {bike.parts}</span>}
              {bike.serviceType && <span className="ml-2">Typ servisu: {bike.serviceType}</span>}
              {bike.quickFix && <span className="ml-2 text-orange-600 font-bold">Rychlo fix</span>}
            </div>
            {editingId === bike.id ? (
              <form onSubmit={handleEditSubmit} style={{ display: 'inline' }}>
                <input type="text" name="name" value={editForm?.name || ''} onChange={handleEditChange} required />
                <input type="text" name="brand" value={editForm?.brand || ''} onChange={handleEditChange} />
                <input type="text" name="model" value={editForm?.model || ''} onChange={handleEditChange} />
                <input type="number" name="year" value={editForm?.year || ''} onChange={handleEditChange} />
                <button type="submit">Uložit</button>
                <button type="button" onClick={() => { setEditingId(null); setEditForm(null); }}>Zrušit</button>
              </form>
            ) : (
              <>
                <button onClick={() => startEdit(bike)} style={{ marginLeft: 8 }}>Upravit</button>
                <button onClick={() => handleDelete(bike.id)} style={{ marginLeft: 8 }}>Smazat</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BikeManager;
