import React from 'react';
import type { Bike } from '../../../shared/types';

interface ServiceFormProps {
  serviceForm: any;
  servicePhotos: File[];
  uploading: boolean;
  bikes: Bike[];
  handleServiceChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleServiceSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handlePhotosChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleServiceSubmit: (e: React.FormEvent) => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  serviceForm,
  servicePhotos,
  uploading,
  bikes,
  handleServiceChange,
  handleServiceSelectChange,
  handlePhotosChange,
  handleServiceSubmit,
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
    <button type="submit">Přidat záznam</button>
  </form>
);

export default ServiceForm;
