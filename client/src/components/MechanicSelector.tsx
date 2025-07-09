import React, { useState } from 'react';
import type { Mechanic } from '../types/bikeTypes';

// Ukázková data mechaniků (v budoucnu nahradit API)
const mechanics: Mechanic[] = [
  { id: '1', name: 'Petr Novák' },
  { id: '2', name: 'Jana Svobodová' },
  { id: '3', name: 'Karel Dvořák' },
];

interface MechanicSelectorProps {
  onSelect: (mechanic: Mechanic) => void;
}

const MechanicSelector: React.FC<MechanicSelectorProps> = ({ onSelect }) => {
  const [selectedId, setSelectedId] = useState<string>('');

  const handleSelect = () => {
    const mechanic = mechanics.find(m => m.id === selectedId);
    if (mechanic) {
      onSelect(mechanic);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-bold mb-4">Vyberte mechanika</h2>
      <select
        className="border rounded px-4 py-2 mb-4"
        value={selectedId}
        onChange={e => setSelectedId(e.target.value)}
      >
        <option value="">-- Vyberte --</option>
        {mechanics.map(m => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        disabled={!selectedId}
        onClick={handleSelect}
      >
        Pokračovat
      </button>
    </div>
  );
};

export default MechanicSelector;
