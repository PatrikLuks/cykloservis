import { useState } from 'react';
import type { Bike, Mechanic } from '../types/bikeTypes';

interface AddBikeFormProps {
  mechanic: Mechanic;
  onAdd: (bike: Omit<Bike, 'id' | 'createdAt'>) => void;
}

const AddBikeForm = ({ mechanic, onAdd }: AddBikeFormProps) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'OK' | 'NOT_OK'>('OK');
  const [parts, setParts] = useState('');
  const [kilometers, setKilometers] = useState(0);
  const [serviceType, setServiceType] = useState<'UVODNI' | 'KOMPLEXNI'>('UVODNI');
  const [quickFix, setQuickFix] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      // userId bude doplněno na backendu
      mechanicId: mechanic.id,
      name,
      status,
      parts,
      kilometers,
      serviceType: quickFix ? 'QUICK_FIX' : serviceType,
      quickFix,
    } as any);
    setName('');
    setStatus('OK');
    setParts('');
    setKilometers(0);
    setServiceType('UVODNI');
    setQuickFix(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow flex flex-col gap-4 mt-8">
      <h2 className="text-lg font-bold mb-2">Přidat nové kolo</h2>
      <input
        type="text"
        placeholder="Název kola / zákazníka"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        className="border rounded px-3 py-2"
      />
      <textarea
        placeholder="Použité součástky, poznámky"
        value={parts}
        onChange={e => setParts(e.target.value)}
        className="border rounded px-3 py-2"
      />
      <div>
        <label className="mr-2">Stav kola:</label>
        <select value={status} onChange={e => setStatus(e.target.value as 'OK' | 'NOT_OK')} className="border rounded px-2 py-1">
          <option value="OK">Je v pořádku</option>
          <option value="NOT_OK">Není v pořádku</option>
        </select>
      </div>
      <input
        type="number"
        placeholder="Najeté kilometry"
        value={kilometers}
        onChange={e => setKilometers(Number(e.target.value))}
        min={0}
        className="border rounded px-3 py-2"
      />
      <div>
        <label className="mr-2">Typ servisu:</label>
        <select value={serviceType} onChange={e => setServiceType(e.target.value as any)} className="border rounded px-2 py-1">
          <option value="UVODNI">Úvodní servis</option>
          <option value="KOMPLEXNI">Komplexní servis</option>
        </select>
      </div>
      <div>
        <label className="mr-2">
          <input type="checkbox" checked={quickFix} onChange={e => setQuickFix(e.target.checked)} /> Rychlo fix
        </label>
      </div>
      <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Přidat kolo</button>
    </form>
  );
};

export default AddBikeForm;
