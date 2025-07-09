import React, { useEffect, useState } from 'react';
import type { ServiceRecord } from '../../../shared/types';

interface SharedServiceBookProps {
  token: string;
}

const SharedServiceBook: React.FC<SharedServiceBookProps> = ({ token }) => {
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShared = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/share/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Chyba při načítání dat');
        setRecords(data.records || []);
      } catch (e: any) {
        setError(e.message || 'Chyba při načítání dat');
      } finally {
        setLoading(false);
      }
    };
    fetchShared();
  }, [token]);

  if (loading) return <div>Načítám servisní knihu…</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!records.length) return <div>Žádné servisní záznamy k dispozici.</div>;

  return (
    <div style={{ maxWidth: 700, margin: '32px auto', background: '#f3f4f6', borderRadius: 8, padding: 24 }}>
      <h2 style={{ fontSize: 24, marginBottom: 16 }}>Veřejná servisní kniha</h2>
      <ul>
        {records.map((rec) => (
          <li key={rec._id} style={{ marginBottom: 16, background: '#fff', borderRadius: 6, padding: 12, boxShadow: '0 1px 4px #0001' }}>
            <b>{new Date(rec.date).toLocaleDateString()}</b>: {rec.description}
            {rec.bikeModel && <> | Model: {rec.bikeModel}</>}
            {rec.bikeBrand && <> | Značka: {rec.bikeBrand}</>}
            {rec.notes && <> | Poznámky: {rec.notes}</>}
            {rec.reminder && <span style={{ color: 'orange' }}> | Upozornění na kontrolu</span>}
            {rec.photos && rec.photos.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {rec.photos.map((url: string, i: number) => (
                  <img key={i} src={`http://localhost:3001${url}`} alt="servisní foto" style={{ maxWidth: 120, margin: 4 }} />
                ))}
              </div>
            )}
            {rec.price && <span> | Cena: {rec.price} Kč</span>}
            {rec.serviceType && <span> | Typ úkonu: {rec.serviceType}</span>}
            {rec.recordType && <span> | Typ: {rec.recordType}</span>}
            {rec.status && <span> | Stav: {rec.status}</span>}
            {rec.updatedAt && <span> | Aktualizováno: {new Date(rec.updatedAt).toLocaleString()}</span>}
          </li>
        ))}
      </ul>
      <div style={{ color: '#888', fontSize: 13, marginTop: 16 }}>Tento pohled je pouze pro čtení. Pro úpravy kontaktujte majitele knihy.</div>
    </div>
  );
};

export default SharedServiceBook;
