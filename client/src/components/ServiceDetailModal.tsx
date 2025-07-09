import React from 'react';

interface ServiceDetailModalProps {
  detailRecord: any;
  closeDetail: () => void;
  handleDeletePhoto: (recordId: string, url: string) => void;
  handleUndoChange: (recordId: string, historyIndex: number) => void;
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  detailRecord,
  closeDetail,
  handleDeletePhoto,
  handleUndoChange,
}) => {
  if (!detailRecord) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={closeDetail}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, maxWidth: 500, position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={closeDetail} style={{ position: 'absolute', top: 8, right: 8 }}>Zavřít</button>
        <h3>Detail záznamu</h3>
        <p><b>Datum:</b> {new Date(detailRecord.date).toLocaleDateString()}</p>
        <p><b>Popis:</b> {detailRecord.description}</p>
        {detailRecord.bikeModel && <p><b>Model:</b> {detailRecord.bikeModel}</p>}
        {detailRecord.bikeBrand && <p><b>Značka:</b> {detailRecord.bikeBrand}</p>}
        {detailRecord.notes && <p><b>Poznámky:</b> {detailRecord.notes}</p>}
        {detailRecord.reminder && <p style={{ color: 'orange' }}><b>Upozornění na kontrolu</b></p>}
        {detailRecord.photos && detailRecord.photos.length > 0 && (
          <div style={{ margin: '12px 0' }}>
            <b>Fotky:</b>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {detailRecord.photos.map((url: string, i: number) => (
                <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={`http://localhost:3001${url}`} alt="servisní foto" style={{ maxWidth: 120, borderRadius: 4 }} />
                  <button onClick={() => handleDeletePhoto(detailRecord._id, url)} style={{ position: 'absolute', top: 2, right: 2, background: '#fff', border: '1px solid #ccc', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer' }}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {detailRecord.price && <p><b>Cena:</b> {detailRecord.price} Kč</p>}
        {detailRecord.serviceType && <p><b>Typ úkonu:</b> {detailRecord.serviceType}</p>}
        {detailRecord.recordType && <p><b>Typ záznamu:</b> {detailRecord.recordType}</p>}
        {detailRecord.status && <p><b>Stav zakázky:</b> {detailRecord.status}</p>}
        {detailRecord.updatedAt && <p><b>Aktualizováno:</b> {new Date(detailRecord.updatedAt).toLocaleString()}</p>}
        {detailRecord.history && detailRecord.history.length > 0 && (
          <div style={{ margin: '16px 0', background: '#f8f9fa', padding: 8, borderRadius: 6 }}>
            <b>Historie změn:</b>
            <ul style={{ fontSize: '0.95em', margin: 0 }}>
              {detailRecord.history.map((h: any, i: number) => (
                <li key={i} style={{ marginBottom: 4 }}>
                  <span>{new Date(h.date).toLocaleString()}:</span>
                  {h.author && <span style={{ marginLeft: 8, color: '#888' }}>autor: {h.author.name || h.author.email || h.author}</span>}
                  <ul style={{ margin: 0 }}>
                    {Object.entries(h.changes).map(([field, val]: any) => (
                      <li key={field}>
                        <b>{field}:</b> {String(val.from)} → {String(val.to)}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleUndoChange(detailRecord._id, i)} style={{ fontSize: '0.9em', marginTop: 4 }}>Vrátit tuto změnu</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetailModal;
