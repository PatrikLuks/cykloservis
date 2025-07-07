import React from 'react';

interface ServiceFilterFormProps {
  serviceFilters: any;
  handleFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fetchServiceRecords: () => void;
  setServiceFilters: (filters: any) => void;
}

const ServiceFilterForm: React.FC<ServiceFilterFormProps> = ({
  serviceFilters,
  handleFilterChange,
  fetchServiceRecords,
  setServiceFilters,
}) => (
  <form onSubmit={e => { e.preventDefault(); fetchServiceRecords(); }} style={{ marginBottom: 16, background: '#eef', padding: 8, borderRadius: 4 }}>
    <input type="date" name="date" value={serviceFilters.date} onChange={handleFilterChange} placeholder="Datum" />
    <input type="text" name="bikeModel" value={serviceFilters.bikeModel} onChange={handleFilterChange} placeholder="Model kola" />
    <input type="text" name="bikeBrand" value={serviceFilters.bikeBrand} onChange={handleFilterChange} placeholder="Značka kola" />
    <input type="text" name="q" value={serviceFilters.q} onChange={handleFilterChange} placeholder="Fulltext (popis, poznámky)" />
    <select name="recordType" value={serviceFilters.recordType || ''} onChange={handleFilterChange} style={{ marginLeft: 8 }}>
      <option value="">Všechny typy</option>
      <option value="údržba">Údržba</option>
      <option value="oprava">Oprava</option>
      <option value="upgrade">Upgrade</option>
      <option value="garanční servis">Garanční servis</option>
      <option value="jiné">Jiné</option>
    </select>
    <select name="status" value={serviceFilters.status || ''} onChange={handleFilterChange} style={{ marginLeft: 8 }}>
      <option value="">Všechny stavy</option>
      <option value="nový">Nový</option>
      <option value="čeká na díly">Čeká na díly</option>
      <option value="probíhá">Probíhá</option>
      <option value="hotovo">Hotovo</option>
      <option value="předáno">Předáno</option>
      <option value="reklamace">Reklamace</option>
    </select>
    <button type="submit">Filtrovat</button>
    <button type="button" onClick={() => { setServiceFilters({ date: '', bikeModel: '', bikeBrand: '', q: '' }); fetchServiceRecords(); }} style={{ marginLeft: 8 }}>Zrušit filtr</button>
  </form>
);

export default ServiceFilterForm;
