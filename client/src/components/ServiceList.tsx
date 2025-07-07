import React, { useState } from 'react';
import type { Bike } from '../../../shared/types';
import jsPDF from 'jspdf';

interface ServiceListProps {
  serviceRecords: any[];
  editingId: string | null;
  editForm: any;
  bikes: Bike[];
  startEdit: (rec: any) => void;
  handleEditSubmit: (e: React.FormEvent) => void;
  handleEditChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleEditSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  cancelEdit: () => void;
  handleEditPhotosChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editPhotos: File[];
  editUploading: boolean;
  handleServiceDelete: (id: string) => void;
  openDetail: (rec: any) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({
  serviceRecords,
  editingId,
  editForm,
  bikes,
  startEdit,
  handleEditSubmit,
  handleEditChange,
  handleEditSelectChange,
  cancelEdit,
  handleEditPhotosChange,
  editPhotos,
  editUploading,
  handleServiceDelete,
  openDetail,
}) => {
  // Export servisních záznamů do CSV
  const exportToCSV = () => {
    const header = ['Datum', 'Popis', 'Poznámky', 'Model', 'Značka', 'Upozornění', 'Cena', 'Typ úkonu', 'Fotky', 'Aktualizováno'];
    const rows = serviceRecords.map(rec => [
      new Date(rec.date).toLocaleDateString(),
      rec.description || '',
      rec.notes || '',
      rec.bikeModel || '',
      rec.bikeBrand || '',
      rec.reminder ? 'ano' : 'ne',
      rec.price || '',
      rec.serviceType || '',
      rec.photos && rec.photos.length > 0 ? rec.photos.join('; ') : '',
      rec.updatedAt ? new Date(rec.updatedAt).toLocaleString() : ''
    ]);
    const csvContent = [header, ...rows].map(r => r.map(f => '"' + String(f).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `servisni-zaznamy-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export servisních záznamů do PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Servisní kniha', 10, 12);
    let y = 22;
    serviceRecords.forEach((rec, idx) => {
      doc.setFontSize(11);
      doc.text(`${idx + 1}. Datum: ${new Date(rec.date).toLocaleDateString()} | Popis: ${rec.description || ''}`, 10, y);
      y += 6;
      if (rec.bikeModel || rec.bikeBrand) {
        doc.text(`Kolo: ${rec.bikeModel || ''} ${rec.bikeBrand || ''}`.trim(), 12, y); y += 6;
      }
      if (rec.recordType) { doc.text(`Typ: ${rec.recordType}`, 12, y); y += 6; }
      if (rec.status) { doc.text(`Stav: ${rec.status}`, 12, y); y += 6; }
      if (rec.notes) { doc.text(`Poznámky: ${rec.notes}`, 12, y); y += 6; }
      if (rec.price) { doc.text(`Cena: ${rec.price} Kč`, 12, y); y += 6; }
      if (rec.serviceType) { doc.text(`Typ úkonu: ${rec.serviceType}`, 12, y); y += 6; }
      if (rec.updatedAt) { doc.text(`Aktualizováno: ${new Date(rec.updatedAt).toLocaleString()}`, 12, y); y += 6; }
      y += 2;
      if (y > 270) { doc.addPage(); y = 12; }
    });
    doc.save(`servisni-kniha-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // Sdílení servisní knihy
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const handleShare = async () => {
    setShareLoading(true);
    setShareError(null);
    try {
      const res = await fetch('/api/share', { method: 'POST' });
      if (!res.ok) throw new Error('Chyba při generování odkazu');
      const data = await res.json();
      if (data && data.token) {
        setShareUrl(`${window.location.origin}/shared/${data.token}`);
      } else {
        setShareError('Odkaz se nepodařilo vygenerovat.');
      }
    } catch (e) {
      setShareError('Chyba při komunikaci se serverem.');
    } finally {
      setShareLoading(false);
    }
  };
  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <>
      <button onClick={exportToCSV} style={{ marginBottom: 12, background: '#2563eb', color: 'white', border: 0, borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}>
        Exportovat do CSV
      </button>
      <button onClick={exportToPDF} style={{ marginBottom: 12, background: '#059669', color: 'white', border: 0, borderRadius: 4, padding: '6px 16px', cursor: 'pointer', marginLeft: 8 }}>
        Exportovat do PDF
      </button>
      <button onClick={handleShare} style={{ marginBottom: 12, background: '#f59e42', color: 'white', border: 0, borderRadius: 4, padding: '6px 16px', cursor: 'pointer', marginLeft: 8 }} disabled={shareLoading}>
        {shareLoading ? 'Generuji odkaz...' : 'Sdílet servisní knihu'}
      </button>
      {shareUrl && (
        <div style={{ margin: '12px 0', background: '#f3f4f6', padding: 8, borderRadius: 4 }}>
          <span>Veřejný odkaz: <a href={shareUrl} target="_blank" rel="noopener noreferrer">{shareUrl}</a></span>
          <button onClick={handleCopy} style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 4, border: 0, background: '#2563eb', color: 'white', cursor: 'pointer' }}>Kopírovat</button>
        </div>
      )}
      {shareError && <div style={{ color: 'red', margin: '8px 0' }}>{shareError}</div>}
      <ul>
        {serviceRecords.map((rec) => (
          <li key={rec._id}>
            {editingId === rec._id ? (
              <form onSubmit={handleEditSubmit} style={{ marginBottom: 8, background: '#f5f5f5', padding: 8 }}>
                <input type="date" name="date" value={editForm.date} onChange={handleEditChange} required />
                <input type="text" name="description" placeholder="Popis servisu" value={editForm.description} onChange={handleEditChange} required />
                <textarea name="notes" placeholder="Poznámky" value={editForm.notes} onChange={handleEditChange} />
                <input type="text" name="bikeModel" placeholder="Model kola" value={editForm.bikeModel} onChange={handleEditChange} />
                <input type="text" name="bikeBrand" placeholder="Značka kola" value={editForm.bikeBrand} onChange={handleEditChange} />
                <label style={{ display: 'block', margin: '8px 0' }}>
                  <input type="checkbox" name="reminder" checked={editForm.reminder} onChange={handleEditChange} /> Upozornit na kontrolu (1x za rok)
                </label>
                <input type="number" name="price" placeholder="Cena (Kč)" value={editForm.price} onChange={handleEditChange} min="0" step="1" />
                <input type="text" name="serviceType" placeholder="Typ úkonu" value={editForm.serviceType} onChange={handleEditChange} />
                <input type="file" accept="image/*" multiple onChange={handleEditPhotosChange} />
                {editPhotos.length > 0 && <p>Nahrané nové fotky: {editPhotos.map(f => f.name).join(', ')}</p>}
                {editUploading && <p>Nahrávám fotky...</p>}
                {bikes.length > 0 && editForm && (
                  <select name="bikeId" value={editForm.bikeId || ''} onChange={handleEditSelectChange} style={{ marginBottom: 8 }}>
                    <option value="">Vyberte kolo</option>
                    {bikes.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} {b.model && `(${b.model})`} {b.brand && `- ${b.brand}`}</option>
                    ))}
                  </select>
                )}
                <select name="recordType" value={editForm.recordType || 'údržba'} onChange={handleEditSelectChange} style={{ marginBottom: 8 }}>
                  <option value="údržba">Údržba</option>
                  <option value="oprava">Oprava</option>
                  <option value="upgrade">Upgrade</option>
                  <option value="garanční servis">Garanční servis</option>
                  <option value="jiné">Jiné</option>
                </select>
                <select name="status" value={editForm.status || 'nový'} onChange={handleEditSelectChange} style={{ marginBottom: 8 }}>
                  <option value="nový">Nový</option>
                  <option value="čeká na díly">Čeká na díly</option>
                  <option value="probíhá">Probíhá</option>
                  <option value="hotovo">Hotovo</option>
                  <option value="předáno">Předáno</option>
                  <option value="reklamace">Reklamace</option>
                </select>
                <button type="submit">Uložit změny</button>
                <button type="button" onClick={cancelEdit} style={{ marginLeft: 8 }}>Zrušit</button>
              </form>
            ) : (
              <>
                <b>{new Date(rec.date).toLocaleDateString()}</b>: {rec.description}
                {rec.bikeModel && <> | Model: {rec.bikeModel}</>}
                {rec.bikeBrand && <> | Značka: {rec.bikeBrand}</>}
                {rec.notes && <> | Poznámky: {rec.notes}</>}
                {rec.reminder && <span style={{ color: 'orange' }}> | Upozornění na kontrolu</span>}
                {rec.photos && rec.photos.length > 0 && (
                  <div>
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
                <button onClick={() => startEdit(rec)} style={{ marginLeft: 8 }}>Upravit</button>
                <button onClick={() => handleServiceDelete(rec._id)} style={{ marginLeft: 8 }}>Smazat</button>
                <button onClick={() => openDetail(rec)} style={{ marginLeft: 8 }}>Detail</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};

export default ServiceList;
