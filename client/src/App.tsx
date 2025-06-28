import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [protectedMsg, setProtectedMsg] = useState('');
  const [section, setSection] = useState<'service' | 'advice' | 'intake' | 'rewards' | 'ai' | 'bikes' | 'profile'>('service');
  const [serviceRecords, setServiceRecords] = useState<any[]>([]);
  const [serviceForm, setServiceForm] = useState({ date: '', description: '', notes: '', bikeModel: '', bikeBrand: '', reminder: false, bikeId: '', price: '', serviceType: '' });
  const [serviceError, setServiceError] = useState('');
  const [servicePhotos, setServicePhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editPhotos, setEditPhotos] = useState<File[]>([]);
  const [editUploading, setEditUploading] = useState(false);
  const [serviceFilters, setServiceFilters] = useState({ date: '', bikeModel: '', bikeBrand: '', q: '' });
  const [reminders, setReminders] = useState<any[]>([]);
  const [detailRecord, setDetailRecord] = useState<any | null>(null);
  const [bikes, setBikes] = useState<any[]>([]);

  useEffect(() => {
    // Při načtení zkus načíst token z localStorage
    const t = localStorage.getItem('jwt');
    const u = localStorage.getItem('user');
    if (t && u) {
      setToken(t);
      setUser(u);
    }
  }, []);

  // Načíst servisní záznamy po přihlášení nebo přepnutí sekce
  useEffect(() => {
    if (user && token && section === 'service') fetchServiceRecords();
    // eslint-disable-next-line
  }, [user, token, section]);

  useEffect(() => {
    if (user && token) fetchReminders();
    // eslint-disable-next-line
  }, [user, token]);

  useEffect(() => {
    if (user && token) fetchBikes();
    // eslint-disable-next-line
  }, [user, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const url = isLogin ? '/api/login' : '/api/register';
    const body = isLogin ? { email: form.email, password: form.password } : form;
    try {
      const res = await fetch(`http://localhost:3001${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba');
      setUser(data.name || form.name);
      setToken(data.token);
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('user', data.name || form.name);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setProtectedMsg('');
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  };

  const fetchProtected = async () => {
    setProtectedMsg('');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3001/api/protected', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba');
      setProtectedMsg(data.message);
    } catch (err: any) {
      setProtectedMsg(err.message);
    }
  };

  const fetchServiceRecords = async (filters = serviceFilters) => {
    setServiceError('');
    if (!token) return;
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.bikeModel) params.append('bikeModel', filters.bikeModel);
      if (filters.bikeBrand) params.append('bikeBrand', filters.bikeBrand);
      if (filters.q) params.append('q', filters.q);
      const res = await fetch(`http://localhost:3001/api/service-records?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba');
      setServiceRecords(data);
    } catch (err: any) {
      setServiceError(err.message);
    }
  };

  const fetchReminders = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3001/api/service-reminders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setReminders(data);
      else setReminders([]);
    } catch {
      setReminders([]);
    }
  };

  const fetchBikes = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3001/api/bikes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setBikes(data);
      else setBikes([]);
    } catch {
      setBikes([]);
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setServiceForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value,
    }));
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setServicePhotos(Array.from(e.target.files));
    }
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (!servicePhotos.length || !token) return [];
    setUploading(true);
    const formData = new FormData();
    servicePhotos.forEach((file) => formData.append('photos', file));
    try {
      const res = await fetch('http://localhost:3001/api/upload-multiple', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setUploading(false);
      if (!res.ok) throw new Error(data.error || 'Chyba při uploadu');
      return data.urls;
    } catch (err: any) {
      setServiceError(err.message);
      setUploading(false);
      return [];
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceError('');
    if (!token) return;
    let photoUrls: string[] = [];
    if (servicePhotos.length) {
      photoUrls = await uploadPhotos();
      if (!photoUrls.length) return;
    }
    try {
      const res = await fetch('http://localhost:3001/api/service-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...serviceForm, photos: photoUrls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba');
      setServiceRecords((prev) => [data, ...prev]);
      setServiceForm({ date: '', description: '', notes: '', bikeModel: '', bikeBrand: '', reminder: false, bikeId: '', price: '', serviceType: '' });
      setServicePhotos([]);
    } catch (err: any) {
      setServiceError(err.message);
    }
  };

  const handleServiceDelete = async (id: string) => {
    setServiceError('');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3001/api/service-records/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba');
      setServiceRecords((prev) => prev.filter((r) => r._id !== id));
    } catch (err: any) {
      setServiceError(err.message);
    }
  };

  const startEdit = (rec: any) => {
    setEditingId(rec._id);
    setEditForm({ ...rec, date: rec.date ? rec.date.slice(0, 10) : '', bikeId: rec.bikeId || '', price: rec.price || '', serviceType: rec.serviceType || '' });
    setEditPhotos([]);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setEditForm((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value,
    }));
  };

  const handleEditPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEditPhotos(Array.from(e.target.files));
    }
  };

  const uploadEditPhotos = async (): Promise<string[]> => {
    if (!editPhotos.length || !token) return [];
    setEditUploading(true);
    const formData = new FormData();
    editPhotos.forEach((file) => formData.append('photos', file));
    try {
      const res = await fetch('http://localhost:3001/api/upload-multiple', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setEditUploading(false);
      if (!res.ok) throw new Error(data.error || 'Chyba při uploadu');
      return data.urls;
    } catch (err: any) {
      setServiceError(err.message);
      setEditUploading(false);
      return [];
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceError('');
    if (!token || !editingId) return;
    let photoUrls: string[] = [];
    if (editPhotos.length) {
      photoUrls = await uploadEditPhotos();
    }
    try {
      const res = await fetch(`http://localhost:3001/api/service-records/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...editForm, photos: [...(editForm.photos || []), ...photoUrls] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba');
      setServiceRecords((prev) => prev.map((r) => (r._id === editingId ? data : r)));
      setEditingId(null);
      setEditForm(null);
      setEditPhotos([]);
    } catch (err: any) {
      setServiceError(err.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setEditPhotos([]);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setServiceFilters((prev) => ({ ...prev, [name]: value }));
  };

  const openDetail = async (rec: any) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3001/api/service-records/${rec._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setDetailRecord(data);
      else setDetailRecord(rec);
    } catch {
      setDetailRecord(rec);
    }
  };
  const closeDetail = () => setDetailRecord(null);

  // Mazání fotky ze záznamu
  const handleDeletePhoto = async (recordId: string, url: string) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3001/api/service-records/${recordId}/photo`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba');
      // Aktualizace detailu i seznamu záznamů
      setDetailRecord(data);
      setServiceRecords((prev) => prev.map((r) => (r._id === recordId ? data : r)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Přidat handler handleServiceSelectChange pokud chybí
  const handleServiceSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setServiceForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Přidat chybějící handler handleEditSelectChange
  const handleEditSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Funkce pro vrácení změny zpět (undo)
  const handleUndoChange = async (recordId: string, historyIndex: number) => {
    if (!token) return;
    if (!window.confirm('Opravdu chcete vrátit tuto změnu zpět?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/service-records/${recordId}/undo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ historyIndex }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba');
      setDetailRecord(data);
      setServiceRecords((prev) => prev.map((r) => (r._id === recordId ? data : r)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (user) {
    return (
      <div className="App">
        <h1>Vítej, {user}!</h1>
        <button onClick={handleLogout}>Odhlásit se</button>
        <section>
          <nav style={{ margin: '16px 0' }}>
            <button onClick={() => setSection('service')}>Servisní kniha</button>
            <button onClick={() => setSection('advice')}>Poradenství</button>
            <button onClick={() => setSection('intake')}>Příjmový formulář</button>
            <button onClick={() => setSection('rewards')}>Odměnový systém</button>
            <button onClick={() => setSection('ai')}>AI chat</button>
            <button onClick={() => setSection('bikes')}>Moje kola</button>
            <button onClick={() => setSection('profile')}>Profil</button>
          </nav>
          {section === 'profile' && (
            <ProfileSection token={token} user={user} setUser={setUser} />
          )}
        </section>
        {section === 'service' && (
          <>
            <h2>Servisní kniha</h2>
            {/* Upozornění na blížící se kontrolu */}
            {reminders.length > 0 && (
              <div style={{ background: '#ffeeba', color: '#856404', padding: 12, borderRadius: 6, marginBottom: 16, border: '1px solid #ffeeba' }}>
                <b>Upozornění:</b> U těchto kol se blíží výročí servisu:
                <ul style={{ margin: 0 }}>
                  {reminders.map((r) => (
                    <li key={r._id}>
                      {r.bikeModel && <>{r.bikeModel} </>}{r.bikeBrand && <>{r.bikeBrand} </>}<b>{new Date(r.date).toLocaleDateString()}</b>: {r.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Modal pro detail záznamu */}
            {detailRecord && (
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
                  {detailRecord.updatedAt && <p><b>Aktualizováno:</b> {new Date(detailRecord.updatedAt).toLocaleString()}</p>}
                  {/* V detailu záznamu (modal) zobrazit historii změn */}
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
            )}
            {/* ...zbytek UI... */}
            {/* Filtrační formulář */}
            <form onSubmit={e => { e.preventDefault(); fetchServiceRecords(); }} style={{ marginBottom: 16, background: '#eef', padding: 8, borderRadius: 4 }}>
              <input type="date" name="date" value={serviceFilters.date} onChange={handleFilterChange} placeholder="Datum" />
              <input type="text" name="bikeModel" value={serviceFilters.bikeModel} onChange={handleFilterChange} placeholder="Model kola" />
              <input type="text" name="bikeBrand" value={serviceFilters.bikeBrand} onChange={handleFilterChange} placeholder="Značka kola" />
              <input type="text" name="q" value={serviceFilters.q} onChange={handleFilterChange} placeholder="Fulltext (popis, poznámky)" />
              <button type="submit">Filtrovat</button>
              <button type="button" onClick={() => { setServiceFilters({ date: '', bikeModel: '', bikeBrand: '', q: '' }); fetchServiceRecords({ date: '', bikeModel: '', bikeBrand: '', q: '' }); }} style={{ marginLeft: 8 }}>Zrušit filtr</button>
            </form>
            <form onSubmit={handleServiceSubmit} style={{ marginBottom: 16 }}>
              <input type="date" name="date" value={serviceForm.date} onChange={handleServiceChange} required />
              <input type="text" name="description" placeholder="Popis servisu" value={serviceForm.description} onChange={handleServiceChange} required />
              <textarea name="notes" placeholder="Poznámky" value={serviceForm.notes} onChange={handleServiceChange} />
              <input type="text" name="bikeModel" placeholder="Model kola" value={serviceForm.bikeModel} onChange={handleServiceChange} />
              <input type="text" name="bikeBrand" placeholder="Značka kola" value={serviceForm.bikeBrand} onChange={handleServiceChange} />
              <label style={{ display: 'block', margin: '8px 0' }}>
                <input type="checkbox" name="reminder" checked={serviceForm.reminder} onChange={handleServiceChange} /> Upozornit na kontrolu (1x za rok)
              </label>
              <input type="number" name="price" placeholder="Cena (Kč)" value={serviceForm.price} onChange={handleServiceChange} min="0" step="1" />
              <input type="text" name="serviceType" placeholder="Typ úkonu" value={serviceForm.serviceType} onChange={handleServiceChange} />
              <input type="file" accept="image/*" multiple onChange={handlePhotosChange} />
              {servicePhotos.length > 0 && <p>Nahrané fotky: {servicePhotos.map(f => f.name).join(', ')}</p>}
              {uploading && <p>Nahrávám fotky...</p>}
              {bikes.length > 0 && (
                <select name="bikeId" value={serviceForm.bikeId || ''} onChange={handleServiceSelectChange} style={{ marginBottom: 8 }}>
                  <option value="">Vyberte kolo</option>
                  {bikes.map((b) => (
                    <option key={b._id} value={b._id}>{b.name} {b.model && `(${b.model})`} {b.brand && `- ${b.brand}`}</option>
                  ))}
                </select>
              )}
              <button type="submit">Přidat záznam</button>
            </form>
            {serviceError && <p style={{ color: 'red' }}>{serviceError}</p>}
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
                            <option key={b._id} value={b._id}>{b.name} {b.model && `(${b.model})`} {b.brand && `- ${b.brand}`}</option>
                          ))}
                        </select>
                      )}
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
        )}
        {section === 'advice' && (
          <>
            <h2>Poradenství</h2>
            <p>Chat s opraváři jízdních kol a AI chat – připravujeme.</p>
          </>
        )}
        {section === 'intake' && (
          <>
            <h2>Příjmový formulář</h2>
            <p>Jméno klienta, informace o kole, poznámky k servisu, model a značka kola – připravujeme.</p>
          </>
        )}
        {section === 'rewards' && (
          <>
            <h2>Odměnový systém</h2>
            <p>Systém slev – narozeniny, pravidelný servis – připravujeme.</p>
          </>
        )}
        {section === 'ai' && (
          <>
            <h2>AI chat</h2>
            <p>AI chat pro dotazy a asistenci – připravujeme.</p>
          </>
        )}
        <hr />
        <button onClick={fetchProtected}>Načíst chráněný obsah</button>
        {protectedMsg && <p style={{ color: 'blue' }}>{protectedMsg}</p>}
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Cykloservis</h1>
      <form onSubmit={handleSubmit} className="card">
        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Jméno"
            value={form.name}
            onChange={handleChange}
            required
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Heslo"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">{isLogin ? 'Přihlásit se' : 'Registrovat se'}</button>
      </form>
      <button onClick={() => setIsLogin((v) => !v)} style={{ marginTop: 8 }}>
        {isLogin ? 'Nemáte účet? Registrace' : 'Máte účet? Přihlášení'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p className="read-the-docs">
        Po přihlášení lze volat chráněné API.
      </p>
    </div>
  );
}

function BikeManager({ bikes, setBikes, token }: { bikes: any[], setBikes: (b: any[]) => void, token: string | null }) {
  const [form, setForm] = useState({ name: '', brand: '', model: '', year: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba');
      setBikes([data, ...bikes]);
      setForm({ name: '', brand: '', model: '', year: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };
  const startEdit = (bike: any) => {
    setEditingId(bike._id);
    setEditForm({ ...bike });
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token || !editingId) return;
    try {
      const res = await fetch(`http://localhost:3001/api/bikes/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba');
      setBikes(bikes.map((b) => (b._id === editingId ? data : b)));
      setEditingId(null);
      setEditForm(null);
    } catch (err: any) {
      setError(err.message);
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
      setBikes(bikes.filter((b) => b._id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
        <input type="text" name="name" placeholder="Název kola" value={form.name} onChange={handleChange} required />
        <input type="text" name="brand" placeholder="Značka" value={form.brand} onChange={handleChange} />
        <input type="text" name="model" placeholder="Model" value={form.model} onChange={handleChange} />
        <input type="number" name="year" placeholder="Rok" value={form.year} onChange={handleChange} />
        <button type="submit">Přidat kolo</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {bikes.map((bike) => (
          <li key={bike._id}>
            {editingId === bike._id ? (
              <form onSubmit={handleEditSubmit} style={{ display: 'inline' }}>
                <input type="text" name="name" value={editForm.name} onChange={handleEditChange} required />
                <input type="text" name="brand" value={editForm.brand} onChange={handleEditChange} />
                <input type="text" name="model" value={editForm.model} onChange={handleEditChange} />
                <input type="number" name="year" value={editForm.year} onChange={handleEditChange} />
                <button type="submit">Uložit</button>
                <button type="button" onClick={() => { setEditingId(null); setEditForm(null); }}>Zrušit</button>
              </form>
            ) : (
              <>
                <b>{bike.name}</b> {bike.model && `(${bike.model})`} {bike.brand && `- ${bike.brand}`} {bike.year && `, ${bike.year}`}
                <button onClick={() => startEdit(bike)} style={{ marginLeft: 8 }}>Upravit</button>
                <button onClick={() => handleDelete(bike._id)} style={{ marginLeft: 8 }}>Smazat</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProfileSection({ token, user, setUser }: { token: string | null, user: string | null, setUser: (u: string) => void }) {
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
}

export default App;
