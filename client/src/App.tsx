import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import ServiceList from './components/ServiceList';
import ServiceDetailModal from './components/ServiceDetailModal';
import ServiceForm from './components/ServiceForm';
import ServiceFilterForm from './components/ServiceFilterForm';
import RemindersAlert from './components/RemindersAlert';
import BikeManager from './components/BikeManager';
import Dashboard from './components/Dashboard';
import Loader from './components/Loader';
import AIChat from './components/AIChat';
import AuditLogViewer from './components/AuditLogViewer';
import SharedServiceBook from './components/SharedServiceBook';
import Calendar from './components/Calendar';
import TeamManager from './components/TeamManager';
import Notifications from './components/Notifications';
import { MechanicProvider } from './context/MechanicContext';
import MechanicSelector from './components/MechanicSelector';
import AddBikeForm from './components/AddBikeForm';
import type { Bike, ServiceRecord, ShareToken, User } from '../../shared/types';

interface Toast {
  id: number;
  msg: string;
  type: 'success' | 'error';
}

function App() {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [protectedMsg, setProtectedMsg] = useState('');
  const [section, setSection] = useState<'dashboard' | 'service' | 'advice' | 'intake' | 'rewards' | 'ai' | 'bikes' | 'profile' | 'calendar' | 'team' | 'notifications'>('dashboard');
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [serviceForm, setServiceForm] = useState({ date: '', description: '', notes: '', bikeModel: '', bikeBrand: '', reminder: false, bikeId: '', price: '', serviceType: '', quickFix: false, durationMinutes: 0 });
  const [serviceError, setServiceError] = useState('');
  const [servicePhotos, setServicePhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editPhotos, setEditPhotos] = useState<File[]>([]);
  const [editUploading, setEditUploading] = useState(false);
  const [serviceFilters, setServiceFilters] = useState({ date: '', bikeModel: '', bikeBrand: '', q: '', recordType: '', status: '' });
  const [reminders, setReminders] = useState<ServiceRecord[]>([]);
  const [detailRecord, setDetailRecord] = useState<ServiceRecord | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [shareTokens, setShareTokens] = useState<ShareToken[]>([]);
  const [shareTokensLoading, setShareTokensLoading] = useState(false);
  const [shareTokensError, setShareTokensError] = useState<string | null>(null);
  const [servicemen, setServicemen] = useState<User[]>([]); // pro výběr servisáka
  const [services, setServices] = useState<any[]>([]); // seznam servisů pro ownera
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedMechanic, setSelectedMechanic] = useState<import('./types/bikeTypes').Mechanic | null>(null);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  // Loading stav pro přihlášení
  const [loading, setLoading] = useState(false);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [bikesLoading, setBikesLoading] = useState(false);
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [isAdmin, setIsAdmin] = useState(false); // pro demo, v produkci podle role uživatele
  const [calendarServicemanId, setCalendarServicemanId] = useState<string | null>(null);
  const [stravaActivities, setStravaActivities] = useState<any[]>([]);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [setPwEmail, setSetPwEmail] = useState('');
  const [setPwValue, setSetPwValue] = useState('');
  const [setPwMsg, setSetPwMsg] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const toastId = React.useRef(0);
  // Feature flag pro lite verzi
  const [liteMode, setLiteMode] = useState(false);

  useEffect(() => {
    // Při načtení zkus načíst token z localStorage
    const t = localStorage.getItem('jwt');
    const u = localStorage.getItem('user');
    if (t && u) {
      setToken(t);
      setUser(u);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

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

  // Načíst aktivity ze Stravy při přechodu do sekce 'service'
  useEffect(() => {
    const fetchStrava = async () => {
      if (token && section === 'service') {
        try {
          const res = await fetch('http://localhost:3001/api/strava/activities', { headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          if (Array.isArray(data)) setStravaActivities(data);
          else setStravaActivities([]);
        } catch { setStravaActivities([]); }
      }
    };
    fetchStrava();
  }, [token, section]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    const id = toastId.current++;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  function closeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShowSetPassword(false);
    const url = isLogin ? '/api/login' : '/api/register';
    const body = isLogin ? { email: form.email, password: form.password } : form;
    try {
      const res = await fetch(`http://localhost:3001${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error && data.error.toLowerCase().includes('heslo nenastaveno')) {
          setShowSetPassword(true);
          setSetPwEmail(form.email);
          setSetPwMsg('Zadejte nové heslo pro aktivaci účtu.');
          return;
        }
        throw new Error(data.error || 'Chyba');
      }
      setUser(data.name || form.name);
      setToken(data.token);
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('user', data.name || form.name);
      showToast(isLogin ? 'Přihlášení úspěšné.' : 'Registrace úspěšná.', 'success');
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetPwMsg('');
    try {
      const res = await fetch('http://localhost:3001/api/user/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: setPwEmail, password: setPwValue })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba při nastavování hesla');
      setShowSetPassword(false);
      setSetPwValue('');
      setSetPwMsg('Heslo nastaveno, nyní se můžete přihlásit.');
      showToast('Heslo nastaveno, nyní se můžete přihlásit.', 'success');
    } catch (err: any) {
      setSetPwMsg(err.message);
      showToast(err.message, 'error');
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
    setServiceLoading(true);
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
    } finally {
      setServiceLoading(false);
    }
  };

  const fetchReminders = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3001/api/reminders/upcoming', {
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
    setBikesLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/bikes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setBikes(data);
      else setBikes([]);
    } catch {
      setBikes([]);
    } finally {
      setBikesLoading(false);
    }
  };

  // Načíst seznam servisáků pro kalendář
  useEffect(() => {
    if (token && section === 'calendar') {
      fetch('http://localhost:3001/api/users?role=serviceman', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setServicemen(data); });
    }
  }, [token, section]);

  // Načíst servisy pro ownera
  useEffect(() => {
    if (token && user && section === 'team') {
      fetch('http://localhost:3001/api/services', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setServices(data); });
    }
  }, [token, user, section]);

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setServiceForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
        body: JSON.stringify({
          ...serviceForm,
          bikeId: selectedBike?.id,
          photos: photoUrls,
          quickFix: serviceForm.quickFix || false,
          durationMinutes: durationMinutes || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba');
      setServiceRecords((prev) => [data, ...prev]);
      setServiceForm({ date: '', description: '', notes: '', bikeModel: '', bikeBrand: '', reminder: false, bikeId: '', price: '', serviceType: '', quickFix: false, durationMinutes: 0 });
      setServicePhotos([]);
      setDurationMinutes(0);
      showToast('Servisní záznam byl úspěšně přidán.', 'success');
    } catch (err: any) {
      setServiceError(err.message);
      showToast(err.message, 'error');
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
      showToast('Záznam byl smazán.', 'success');
    } catch (err: any) {
      setServiceError(err.message);
      showToast(err.message, 'error');
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
      showToast('Záznam byl upraven.', 'success');
    } catch (err: any) {
      setServiceError(err.message);
      showToast(err.message, 'error');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setEditPhotos([]);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setServiceFilters({ ...serviceFilters, [e.target.name]: e.target.value });
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

  // Akce pro dashboard
  const goToAddBikeSection = () => setSection('bikes');
  const handleAddService = () => setSection('service');

  // Detekce veřejného sdíleného pohledu podle URL
  const sharedMatch = window.location.pathname.match(/^\/shared\/(\w+)/);
  if (sharedMatch) {
    const token = sharedMatch[1];
    return <SharedServiceBook token={token} />;
  }

  useEffect(() => {
    if (token) fetchShareTokens();
  }, [token]);

  // Handlery pro sdílené odkazy
  const fetchShareTokens = async () => {
    setShareTokensLoading(true);
    setShareTokensError(null);
    try {
      const res = await fetch('http://localhost:3001/api/share-tokens', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba');
      setShareTokens(data);
    } catch (err: any) {
      setShareTokensError(err.message);
    } finally {
      setShareTokensLoading(false);
    }
  };
  const handleRevokeShareToken = async (tokenId: string) => {
    if (!window.confirm('Opravdu zneplatnit tento odkaz?')) return;
    setShareTokensLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/share-tokens/${tokenId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Chyba při rušení odkazu');
      setShareTokens((prev) => prev.filter((t) => t.token !== tokenId));
    } catch (err: any) {
      setShareTokensError(err.message);
    } finally {
      setShareTokensLoading(false);
    }
  };

  // Helper pro získání role uživatele (string nebo objekt)
  function getUserRole(user: string | null | { role?: string }): string | undefined {
    if (!user) return undefined;
    if (typeof user === 'string') return undefined;
    return user.role;
  }

  // Pokud není vybrán mechanik, zobrazit výběr
  if (!selectedMechanic) {
    return (
      <MechanicProvider>
        <MechanicSelector onSelect={setSelectedMechanic} />
      </MechanicProvider>
    );
  }

  // Handler pro přidání kola (napojený na backend)
  const handleAddBike = async (bike: any) => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3001/api/bikes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: bike.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba při přidávání kola');
      setBikes(prev => [data, ...prev]);
      showToast('Kolo bylo přidáno.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Pokud je vybrán mechanik, ale není vybráno kolo, zobrazit BikeManager a výběr kola
  if (selectedMechanic && !selectedBike) {
    return (
      <MechanicProvider>
        <main>
          <AddBikeForm mechanic={selectedMechanic} onAdd={handleAddBike} />
          <BikeManager
            bikes={bikes}
            setBikes={setBikes}
            token={token}
            showToast={showToast}
          />
          <div className="mt-4">
            <h3 className="font-bold mb-2">Vyberte kolo pro servis</h3>
            <ul>
              {bikes.map(bike => (
                <li key={bike.id}>
                  <button className="underline text-blue-600" onClick={() => setSelectedBike(bike)}>
                    {bike.name} {bike.model && `(${bike.model})`} {bike.brand && `- ${bike.brand}`}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </MechanicProvider>
    );
  }

  // Pokud je vybrán mechanik i kolo, zobrazit servisní knihu pro toto kolo
  if (selectedMechanic && selectedBike) {
    return (
      <MechanicProvider>
        <main>
          <h2 className="text-xl font-bold mb-4">Servisní kniha pro kolo: {selectedBike.name}</h2>
          <ServiceForm
            serviceForm={{ ...serviceForm, bikeId: selectedBike.id, durationMinutes }}
            servicePhotos={servicePhotos}
            uploading={uploading}
            bikes={[selectedBike]}
            handleServiceChange={handleServiceChange}
            handleServiceSelectChange={handleServiceSelectChange}
            handlePhotosChange={handlePhotosChange}
            handleServiceSubmit={handleServiceSubmit}
            stravaActivities={stravaActivities}
            onStartTimer={() => {
              setTimerRunning(true);
              setTimerStart(Date.now());
              timerRef.current = setInterval(() => {
                setDurationMinutes(Math.floor((Date.now() - (timerStart || Date.now())) / 60000));
              }, 1000);
            }}
            onStopTimer={() => {
              setTimerRunning(false);
              if (timerRef.current) clearInterval(timerRef.current);
              if (timerStart) {
                setDurationMinutes(Math.floor((Date.now() - timerStart) / 60000));
              }
              setTimerStart(null);
            }}
            timerRunning={timerRunning}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
          />
          <ServiceList
            serviceRecords={serviceRecords.filter(r => r.bikeId === selectedBike.id)}
            editingId={editingId}
            editForm={editForm}
            bikes={[selectedBike]}
            startEdit={startEdit}
            handleEditSubmit={handleEditSubmit}
            handleEditChange={handleEditChange}
            handleEditSelectChange={handleEditSelectChange}
            cancelEdit={cancelEdit}
            handleEditPhotosChange={handleEditPhotosChange}
            editPhotos={editPhotos}
            editUploading={editUploading}
            handleServiceDelete={handleServiceDelete}
            openDetail={openDetail}
          />
          <button className="mt-4 text-sm text-blue-600 underline" onClick={() => setSelectedBike(null)}>
            Zpět na výběr kola
          </button>
        </main>
      </MechanicProvider>
    );
  }

  return (
    <MechanicProvider>
      <main>
        <AddBikeForm mechanic={selectedMechanic} onAdd={handleAddBike} />
        <BikeManager bikes={bikes} setBikes={setBikes} token={token} showToast={showToast} />
        {/* ...další obsah aplikace... */}
      </main>
    </MechanicProvider>
  );

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <header className="bg-white dark:bg-gray-900 shadow flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="font-bold text-xl text-green-700 dark:text-green-400">Cykloservis</div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-gray-700 dark:text-gray-200">{user}</span>
              <button onClick={handleLogout} className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">Odhlásit se</button>
              <button
                onClick={() => setDark((v) => !v)}
                className="ml-2 text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                aria-label="Přepnout světlý/tmavý režim"
              >
                {dark ? '🌙' : '☀️'}
              </button>
              <button
                onClick={() => setIsAdmin((v) => !v)}
                className="ml-2 text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                aria-label="Zobrazit audit log"
              >
                Audit log
              </button>
            </div>
          )}
        </header>
        <main className="max-w-4xl mx-auto p-2 sm:p-4">
          {isAdmin && <AuditLogViewer />}
          {user ? (
            <>
              <nav className="flex flex-wrap gap-2 mb-6">
                <button onClick={() => setSection('dashboard')} className={`px-3 py-1 rounded ${section==='dashboard' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Dashboard</button>
                <button onClick={() => setSection('service')} className={`px-3 py-1 rounded ${section==='service' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Servisní kniha</button>
                <button onClick={() => setSection('bikes')} className={`px-3 py-1 rounded ${section==='bikes' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Moje kola</button>
                <button onClick={() => setSection('profile')} className={`px-3 py-1 rounded ${section==='profile' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Profil</button>
                <button onClick={() => setSection('advice')} className={`px-3 py-1 rounded ${section==='advice' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Poradenství</button>
                <button onClick={() => setSection('intake')} className={`px-3 py-1 rounded ${section==='intake' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Příjmový formulář</button>
                <button onClick={() => setSection('rewards')} className={`px-3 py-1 rounded ${section==='rewards' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Odměny</button>
                <button onClick={() => setSection('ai')} className={`px-3 py-1 rounded ${section==='ai' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>AI chat</button>
                <button onClick={() => setSection('calendar')} className={`px-3 py-1 rounded ${section==='calendar' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Kalendář</button>
                <button onClick={() => setSection('notifications')} className={`px-3 py-1 rounded ${section==='notifications' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Notifikace</button>
                {getUserRole(user) === 'owner' && (
                  <button onClick={() => setSection('team')} className={`px-3 py-1 rounded ${section==='team' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Správa týmu</button>
                )}
              </nav>
              <section>
                {section === 'dashboard' && (
                  <Dashboard
                    bikes={bikes}
                    serviceRecords={serviceRecords}
                    reminders={reminders}
                    onAddBike={goToAddBikeSection}
                    onAddService={handleAddService}
                  />
                )}
              </section>
              {section === 'service' && (
                serviceLoading ? <Loader /> : (
                  <>
                    <h2>Servisní kniha</h2>
                    <RemindersAlert reminders={reminders} />
                    <ServiceDetailModal
                      detailRecord={detailRecord}
                      closeDetail={closeDetail}
                      handleDeletePhoto={handleDeletePhoto}
                      handleUndoChange={handleUndoChange}
                    />
                    <ServiceFilterForm
                      serviceFilters={serviceFilters}
                      handleFilterChange={handleFilterChange}
                      fetchServiceRecords={() => fetchServiceRecords()}
                      setServiceFilters={setServiceFilters}
                    />
                    <ServiceForm
                      serviceForm={serviceForm}
                      servicePhotos={servicePhotos}
                      uploading={uploading}
                      bikes={bikes}
                      handleServiceChange={handleServiceChange}
                      handleServiceSelectChange={handleServiceSelectChange}
                      handlePhotosChange={handlePhotosChange}
                      handleServiceSubmit={handleServiceSubmit}
                      stravaActivities={stravaActivities}
                    />
                    {serviceError && <p style={{ color: 'red' }}>{serviceError}</p>}
                    <ServiceList
                      serviceRecords={serviceRecords}
                      editingId={editingId}
                      editForm={editForm}
                      bikes={bikes}
                      startEdit={startEdit}
                      handleEditSubmit={handleEditSubmit}
                      handleEditChange={handleEditChange}
                      handleEditSelectChange={handleEditSelectChange}
                      cancelEdit={cancelEdit}
                      handleEditPhotosChange={handleEditPhotosChange}
                      editPhotos={editPhotos}
                      editUploading={editUploading}
                      handleServiceDelete={handleServiceDelete}
                      openDetail={openDetail}
                    />
                  </>
                )
              )}
              {section === 'bikes' && (
                bikesLoading ? <Loader /> : <BikeManager bikes={bikes} setBikes={setBikes} token={token} showToast={showToast} />
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
                <AIChat userId={user} />
              )}
              {section === 'profile' && (
                <div className="max-w-2xl mx-auto p-4">
                  <h2 className="text-xl font-bold mb-4">Správa sdílených odkazů</h2>
                  {shareTokensLoading && <div>Načítám…</div>}
                  {shareTokensError && <div style={{ color: 'red' }}>{shareTokensError}</div>}
                  <button onClick={fetchShareTokens} style={{ marginBottom: 12, background: '#2563eb', color: 'white', border: 0, borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}>Obnovit seznam</button>
                  <ul>
                    {shareTokens.map((t) => (
                      <li key={t._id} style={{ marginBottom: 12, background: '#f3f4f6', borderRadius: 4, padding: 8 }}>
                        <div>Odkaz: <a href={`${window.location.origin}/shared/${t.token}`} target="_blank" rel="noopener noreferrer">{window.location.origin}/shared/{t.token}</a></div>
                        <div>Platnost do: {new Date(t.expiresAt).toLocaleString()}</div>
                        <button onClick={() => handleRevokeShareToken(t.token)} style={{ marginTop: 4, background: '#ef4444', color: 'white', border: 0, borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Zneplatnit</button>
                      </li>
                    ))}
                  </ul>
                  {shareTokens.length === 0 && !shareTokensLoading && <div>Žádné aktivní sdílené odkazy.</div>}
                </div>
              )}
              {section === 'calendar' && user && token && (
                <div>
                  <button onClick={() => setSection('dashboard')} style={{ margin: 12 }}>Zpět na dashboard</button>
                  <div style={{ marginBottom: 12 }}>
                    <label>Vyberte servisáka: </label>
                    <select value={calendarServicemanId || ''} onChange={e => setCalendarServicemanId(e.target.value)}>
                      <option value="">-- vyberte --</option>
                      {servicemen.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                      ))}
                    </select>
                  </div>
                  {calendarServicemanId && (
                    <Calendar
                      user={servicemen.find(s => s.id === calendarServicemanId)!}
                      servicemanId={calendarServicemanId as string}
                      token={token as string}
                      showToast={showToast}
                    />
                  )}
                </div>
              )}
              {section === 'team' && getUserRole(user) === 'owner' && token && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Správa týmu</h2>
                  <div style={{ marginBottom: 16 }}>
                    <label>Vyberte servis: </label>
                    <select value={selectedServiceId || ''} onChange={e => setSelectedServiceId(e.target.value)}>
                      <option value="">-- vyberte --</option>
                      {services.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  {selectedServiceId && (
                    <TeamManager serviceId={selectedServiceId as string} token={token as string} />
                  )}
                </div>
              )}
              {section === 'notifications' && (
                <Notifications token={token} />
              )}
              <hr />
              <button onClick={fetchProtected}>Načíst chráněný obsah</button>
              {protectedMsg && <p style={{ color: 'blue' }}>{protectedMsg}</p>}
            </>
          ) : (
            <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded shadow">
              <h1 className="text-2xl font-bold mb-4 text-green-700">Cykloservis</h1>
              {loading ? <Loader /> : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {!isLogin && (
                    <input type="text" name="name" placeholder="Jméno" value={form.name} onChange={handleChange} required className="border rounded px-3 py-2" />
                  )}
                  <input type="email" name="email" placeholder="E-mail" value={form.email} onChange={handleChange} required className="border rounded px-3 py-2" />
                  <input type="password" name="password" placeholder="Heslo" value={form.password} onChange={handleChange} required className="border rounded px-3 py-2" />
                  <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">{isLogin ? 'Přihlásit se' : 'Registrovat se'}</button>
                </form>
              )}
              <button onClick={() => setIsLogin((v) => !v)} className="mt-4 text-sm text-blue-600 hover:underline">
                {isLogin ? 'Nemáte účet? Registrace' : 'Máte účet? Přihlášení'}
              </button>
              {error && <p className="text-red-600 mt-2">{error}</p>}
              <p className="text-gray-500 mt-4 text-sm">Po přihlášení lze volat chráněné API.</p>
            </div>
          )}
        </main>
        {toasts.length > 0 && (
          <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 items-end">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`px-4 py-2 rounded shadow-lg text-white flex items-center gap-2 animate-fade-in-out bg-${toast.type === 'success' ? 'green' : 'red'}-600 dark:bg-${toast.type === 'success' ? 'green' : 'red'}-800`}
                style={{ minWidth: 220 }}
              >
                <span>{toast.msg}</span>
                <button
                  onClick={() => closeToast(toast.id)}
                  className="ml-2 text-white/70 hover:text-white text-lg font-bold px-1"
                  aria-label="Zavřít notifikaci"
                >×</button>
              </div>
            ))}
          </div>
        )}
        {/* Přepínač režimu v UI */}
        <div className="fixed top-2 right-2 z-50">
          <button
            className={`px-3 py-1 rounded ${liteMode ? 'bg-yellow-400 text-black' : 'bg-gray-200'}`}
            onClick={() => setLiteMode((v) => !v)}
            title="Přepnout Lite verzi"
          >
            {liteMode ? 'Lite verze: ON' : 'Lite verze: OFF'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {showSetPassword ? (
        <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded shadow">
          <h2 className="text-xl font-bold mb-4">Nastavení hesla</h2>
          <form onSubmit={handleSetPassword} className="flex flex-col gap-4">
            <input type="email" value={setPwEmail} disabled className="border rounded px-3 py-2 bg-gray-100" />
            <input type="password" placeholder="Nové heslo" value={setPwValue} onChange={e => setSetPwValue(e.target.value)} required className="border rounded px-3 py-2" />
            <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">Nastavit heslo</button>
          </form>
          {setPwMsg && <p className="mt-2 text-blue-700">{setPwMsg}</p>}
        </div>
      ) : (
        <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded shadow">
          <h1 className="text-2xl font-bold mb-4 text-green-700">Cykloservis</h1>
          {loading ? <Loader /> : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {!isLogin && (
                <input type="text" name="name" placeholder="Jméno" value={form.name} onChange={handleChange} required className="border rounded px-3 py-2" />
              )}
              <input type="email" name="email" placeholder="E-mail" value={form.email} onChange={handleChange} required className="border rounded px-3 py-2" />
              <input type="password" name="password" placeholder="Heslo" value={form.password} onChange={handleChange} required className="border rounded px-3 py-2" />
              <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">{isLogin ? 'Přihlásit se' : 'Registrovat se'}</button>
            </form>
          )}
          <button onClick={() => setIsLogin((v) => !v)} className="mt-4 text-sm text-blue-600 hover:underline">
            {isLogin ? 'Nemáte účet? Registrace' : 'Máte účet? Přihlášení'}
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
          <p className="text-gray-500 mt-4 text-sm">Po přihlášení lze volat chráněné API.</p>
        </div>
      )}
    </div>
  );
}

export default App;
