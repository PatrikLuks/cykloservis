import React, { useEffect, useState } from 'react';
import type { User } from '../../../shared/types';

interface Slot {
  _id: string;
  start: string;
  end: string;
}
interface Reservation {
  _id: string;
  start: string;
  end: string;
  status: string;
  customer: any;
  serviceman: any;
  note?: string;
}

interface CalendarProps {
  user: User;
  servicemanId: string;
  token: string;
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

const Calendar: React.FC<CalendarProps> = ({ user, servicemanId, token, showToast }) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slotLoading, setSlotLoading] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);

  // Načíst dostupnost a rezervace
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res1 = await fetch(`/api/availability/${servicemanId}`, { headers: { Authorization: `Bearer ${token}` } });
        const slots = await res1.json();
        const res2 = await fetch(`/api/reservation/user/${servicemanId}`, { headers: { Authorization: `Bearer ${token}` } });
        const reservations = await res2.json();
        setSlots(slots);
        setReservations(reservations);
      } catch (e: any) {
        setError(e.message || 'Chyba při načítání dat');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [servicemanId, token]);

  // Přidání slotu (dostupnosti) – pouze pro servisáka
  const [newSlot, setNewSlot] = useState({ start: '', end: '' });
  const handleAddSlot = async () => {
    if (!newSlot.start || !newSlot.end) return;
    setSlotLoading(true);
    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ start: newSlot.start, end: newSlot.end })
      });
      if (!res.ok) throw new Error('Chyba při přidávání slotu');
      setNewSlot({ start: '', end: '' });
      // Obnovit data
      const res1 = await fetch(`/api/availability/${servicemanId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSlots(await res1.json());
      showToast && showToast('Slot byl přidán.', 'success');
    } catch (e: any) { showToast && showToast(e.message || 'Chyba při přidávání slotu', 'error'); }
    finally { setSlotLoading(false); }
  };
  // Mazání slotu (dostupnosti) – pouze pro servisáka
  const handleDeleteSlot = async (id: string) => {
    if (!window.confirm('Opravdu smazat tento slot?')) return;
    setSlotLoading(true);
    try {
      const res = await fetch(`/api/availability/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Chyba při mazání slotu');
      setSlots(slots.filter(s => s._id !== id));
      showToast && showToast('Slot byl smazán.', 'success');
    } catch (e: any) { showToast && showToast(e.message || 'Chyba při mazání slotu', 'error'); }
    finally { setSlotLoading(false); }
  };
  // Vytvoření rezervace – pouze pro zákazníka
  const [newRes, setNewRes] = useState({ start: '', end: '', note: '' });
  const handleAddReservation = async () => {
    if (!newRes.start || !newRes.end) return;
    setReservationLoading(true);
    try {
      const res = await fetch('/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ serviceman: servicemanId, service: '', start: newRes.start, end: newRes.end, note: newRes.note })
      });
      if (!res.ok) throw new Error('Chyba při rezervaci');
      setNewRes({ start: '', end: '', note: '' });
      // Obnovit data
      const res2 = await fetch(`/api/reservation/user/${servicemanId}`, { headers: { Authorization: `Bearer ${token}` } });
      setReservations(await res2.json());
      showToast && showToast('Rezervace byla vytvořena.', 'success');
    } catch (e: any) { showToast && showToast(e.message || 'Chyba při rezervaci', 'error'); }
    finally { setReservationLoading(false); }
  };

  return (
    <div style={{ maxWidth: 700, margin: '32px auto', background: '#f3f4f6', borderRadius: 8, padding: 24 }}>
      <h2 style={{ fontSize: 24, marginBottom: 16 }}>Kalendář dostupnosti a rezervací</h2>
      {loading && <div>Načítám…</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <h3>Dostupnost servisáka</h3>
      {user.role === 'serviceman' && (
        <div style={{ marginBottom: 12 }}>
          <input type="datetime-local" value={newSlot.start} onChange={e => setNewSlot({ ...newSlot, start: e.target.value })} disabled={slotLoading} />
          <input type="datetime-local" value={newSlot.end} onChange={e => setNewSlot({ ...newSlot, end: e.target.value })} disabled={slotLoading} />
          <button onClick={handleAddSlot} style={{ marginLeft: 8 }} disabled={slotLoading}>{slotLoading ? 'Přidávám…' : 'Přidat slot'}</button>
        </div>
      )}
      <ul>
        {slots.map((slot) => (
          <li key={slot._id} style={{ color: '#059669' }}>
            {new Date(slot.start).toLocaleString()} – {new Date(slot.end).toLocaleString()}
            {user.role === 'serviceman' && (
              <button onClick={() => handleDeleteSlot(slot._id)} style={{ marginLeft: 8, color: 'red' }} disabled={slotLoading}>{slotLoading ? 'Mažu…' : 'Smazat'}</button>
            )}
          </li>
        ))}
        {slots.length === 0 && <li>Žádné dostupné sloty.</li>}
      </ul>
      <h3>Rezervace</h3>
      {user.role === 'customer' && (
        <div style={{ marginBottom: 12 }}>
          <input type="datetime-local" value={newRes.start} onChange={e => setNewRes({ ...newRes, start: e.target.value })} disabled={reservationLoading} />
          <input type="datetime-local" value={newRes.end} onChange={e => setNewRes({ ...newRes, end: e.target.value })} disabled={reservationLoading} />
          <input type="text" placeholder="Poznámka" value={newRes.note} onChange={e => setNewRes({ ...newRes, note: e.target.value })} disabled={reservationLoading} />
          <button onClick={handleAddReservation} style={{ marginLeft: 8 }} disabled={reservationLoading}>{reservationLoading ? 'Rezervuji…' : 'Rezervovat'}</button>
        </div>
      )}
      <ul>
        {reservations.map((r) => (
          <li key={r._id} style={{ color: r.status === 'confirmed' ? '#2563eb' : '#f59e42' }}>
            {new Date(r.start).toLocaleString()} – {new Date(r.end).toLocaleString()} | {r.status} | Zákazník: {r.customer?.name || r.customer?.email}
            {r.note && <> | Poznámka: {r.note}</>}
          </li>
        ))}
        {reservations.length === 0 && <li>Žádné rezervace.</li>}
      </ul>
    </div>
  );
};

export default Calendar;
