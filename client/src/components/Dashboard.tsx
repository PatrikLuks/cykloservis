import React from 'react';
import type { Bike, ServiceRecord } from '../../../shared/types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  bikes: Bike[];
  serviceRecords: ServiceRecord[];
  reminders: ServiceRecord[];
  onAddBike: () => void;
  onAddService: () => void;
}

// Modernizace dashboardu pomocí Tailwind CSS a přidání nápovědy
const Dashboard: React.FC<DashboardProps> = ({ bikes, serviceRecords, reminders, onAddBike, onAddService }) => {
  // Výpočet statistik
  const statsByType: Record<string, number> = {};
  const statsByStatus: Record<string, number> = {};
  let totalPrice = 0;
  let countWithPrice = 0;
  serviceRecords.forEach(r => {
    if (r.recordType) statsByType[r.recordType] = (statsByType[r.recordType] || 0) + 1;
    if (r.status) statsByStatus[r.status] = (statsByStatus[r.status] || 0) + 1;
    if (typeof r.price === 'number') { totalPrice += r.price; countWithPrice++; }
  });

  // Data pro grafy
  const pieDataType = Object.entries(statsByType).map(([type, count]) => ({ name: type, value: count }));
  const pieDataStatus = Object.entries(statsByStatus).map(([status, count]) => ({ name: status, value: count }));
  const COLORS = ['#2563eb', '#059669', '#f59e42', '#e11d48', '#6366f1', '#fbbf24', '#10b981'];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4 text-green-700">Domovská stránka</h2>
      <div className="flex gap-8 mb-6">
        <div className="flex-1 text-center">
          <div className="text-4xl font-bold text-blue-600">{bikes.length}</div>
          <div className="text-gray-600">Kola</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-4xl font-bold text-green-600">{serviceRecords.length}</div>
          <div className="text-gray-600">Servisní záznamy</div>
        </div>
      </div>
      {reminders.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 rounded">
          <b>Připomínky servisu:</b>
          <ul className="list-disc ml-6">
            {reminders.map((r) => (
              <li key={r._id}>
                {r.bikeModel || r.bikeBrand || 'Kolo'} – {new Date(r.date).toLocaleDateString()}<br />
                <span className="text-sm text-gray-700">{r.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex gap-4 mb-6">
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={onAddBike}>
          Přidat kolo
        </button>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition" onClick={onAddService}>
          Nový servisní záznam
        </button>
      </div>
      <div className="text-gray-500 text-sm mb-6">
        <b>Tip:</b> Přidejte si svá kola a evidujte si servisní historii. V sekci „Servisní kniha“ najdete detailní přehled všech úkonů, fotodokumentaci i připomínky.
      </div>
      <div className="mb-6">
        <h3 className="font-bold mb-2 text-lg text-gray-700">Statistiky servisu</h3>
        <div className="flex flex-wrap gap-6">
          <div>
            <b>Podle typu:</b>
            <ul className="ml-4">
              {Object.entries(statsByType).map(([type, count]) => (
                <li key={type}>{type}: <b>{count}</b></li>
              ))}
              {Object.keys(statsByType).length === 0 && <li>–</li>}
            </ul>
          </div>
          <div>
            <b>Podle stavu:</b>
            <ul className="ml-4">
              {Object.entries(statsByStatus).map(([status, count]) => (
                <li key={status}>{status}: <b>{count}</b></li>
              ))}
              {Object.keys(statsByStatus).length === 0 && <li>–</li>}
            </ul>
          </div>
          <div>
            <b>Celkové náklady:</b> <span className="font-bold">{totalPrice} Kč</span><br />
            <b>Průměrná cena servisu:</b> <span className="font-bold">{countWithPrice ? Math.round(totalPrice/countWithPrice) : 0} Kč</span>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <h3 className="font-bold mb-2 text-lg text-gray-700">Grafy servisu</h3>
        <div className="flex flex-wrap gap-8">
          <div style={{ width: 220, height: 220 }}>
            <b>Podle typu</b>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieDataType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {pieDataType.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ width: 220, height: 220 }}>
            <b>Podle stavu</b>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieDataStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {pieDataStatus.map((entry, idx) => <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
