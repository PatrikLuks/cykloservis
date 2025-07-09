import React, { useState, useRef } from 'react';
import type { Bike } from '../../../shared/types';

interface ServiceFormProps {
  serviceForm: any;
  servicePhotos: File[];
  uploading: boolean;
  bikes: Bike[];
  stravaActivities?: { id: string; name: string; distance: number; start_date: string }[];
  handleServiceChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleServiceSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handlePhotosChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleServiceSubmit: (e: React.FormEvent) => void;
  onStartTimer?: () => void;
  onStopTimer?: () => void;
  timerRunning?: boolean;
  durationMinutes?: number;
  setDurationMinutes?: (min: number) => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  serviceForm,
  servicePhotos,
  uploading,
  bikes,
  stravaActivities = [],
  handleServiceChange,
  handleServiceSelectChange,
  handlePhotosChange,
  handleServiceSubmit,
  onStartTimer,
  onStopTimer,
  timerRunning,
  durationMinutes,
  setDurationMinutes,
}) => (
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
          <option key={b.id} value={b.id}>{b.name} {b.model && `(${b.model})`} {b.brand && `- ${b.brand}`}</option>
        ))}
      </select>
    )}
    <select name="recordType" value={serviceForm.recordType || 'údržba'} onChange={handleServiceSelectChange} style={{ marginBottom: 8 }}>
      <option value="údržba">Údržba</option>
      <option value="oprava">Oprava</option>
      <option value="upgrade">Upgrade</option>
      <option value="garanční servis">Garanční servis</option>
      <option value="jiné">Jiné</option>
    </select>
    <select name="status" value={serviceForm.status || 'nový'} onChange={handleServiceSelectChange} style={{ marginBottom: 8 }}>
      <option value="nový">Nový</option>
      <option value="čeká na díly">Čeká na díly</option>
      <option value="probíhá">Probíhá</option>
      <option value="hotovo">Hotovo</option>
      <option value="předáno">Předáno</option>
      <option value="reklamace">Reklamace</option>
    </select>
    {stravaActivities.length > 0 && (
      (() => {
        const selectedActivity = stravaActivities.find(a => a.id === serviceForm.stravaActivityId);
        return (
          <>
            <select name="stravaActivityId" value={serviceForm.stravaActivityId || ''} onChange={handleServiceSelectChange} style={{ marginBottom: 8 }}>
              <option value="">Přiřadit aktivitu ze Stravy (volitelné)</option>
              {stravaActivities.map((a) => (
                <option key={a.id} value={a.id}>{a.name} | {(a.distance/1000).toFixed(1)} km | {new Date(a.start_date).toLocaleDateString()}</option>
              ))}
            </select>
            {serviceForm.stravaActivityId && selectedActivity ? (
              <div style={{ fontSize: 13, color: '#2563eb', marginBottom: 8 }}>
                <b>Vybraná aktivita:</b> {selectedActivity.name} | {(selectedActivity.distance/1000).toFixed(1)} km | {new Date(selectedActivity.start_date).toLocaleString()}
              </div>
            ) : serviceForm.stravaActivityId ? (
              <div style={{ color: 'red', fontSize: 13, marginBottom: 8 }}>Vybraná aktivita nebyla nalezena. Zkontrolujte výběr.</div>
            ) : null}
          </>
        );
      })()
    )}
    {stravaActivities.length === 0 && (
      <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>Nemáte žádné aktivity ze Stravy. Propojte účet ve svém profilu.</div>
    )}
    <div style={{ margin: '8px 0' }}>
      <label className="mr-2">Čas věnovaný opravě (min):</label>
      <input
        type="number"
        min={0}
        value={durationMinutes || ''}
        onChange={e => setDurationMinutes && setDurationMinutes(Number(e.target.value))}
        className="border rounded px-2 py-1"
      />
      <button type="button" onClick={timerRunning ? onStopTimer : onStartTimer} className="ml-2 bg-gray-200 px-2 py-1 rounded">
        {timerRunning ? 'Zastavit časovač' : 'Spustit časovač'}
      </button>
    </div>
    <div style={{ margin: '8px 0' }}>
      <label className="mr-2">Začátek opravy:</label>
      <input
        type="datetime-local"
        name="repairStart"
        value={serviceForm.repairStart ? serviceForm.repairStart.slice(0,16) : ''}
        onChange={handleServiceChange}
        className="border rounded px-2 py-1"
      />
    </div>
    <div style={{ margin: '8px 0' }}>
      <label className="mr-2">Typ měření času:</label>
      <select
        name="timingType"
        value={serviceForm.timingType || 'manual'}
        onChange={handleServiceSelectChange}
        className="border rounded px-2 py-1"
      >
        <option value="manual">Ruční</option>
        <option value="auto">Automatické (časovač)</option>
      </select>
    </div>
    <div>
      <label className="mr-2">
        <input type="checkbox" name="quickFix" checked={serviceForm.quickFix || false} onChange={handleServiceChange} /> Rychlo fix
      </label>
    </div>
    <button type="submit">Přidat záznam</button>
  </form>
);

export default ServiceForm;
