import React from 'react';

interface RemindersAlertProps {
  reminders: any[];
}

const RemindersAlert: React.FC<RemindersAlertProps> = ({ reminders }) => {
  if (!reminders.length) return null;

  // Export připomínek do CSV
  const exportToCSV = () => {
    const header = ['Model', 'Značka', 'Datum servisu', 'Popis'];
    const rows = reminders.map(r => [
      r.bikeModel || '',
      r.bikeBrand || '',
      new Date(r.date).toLocaleDateString(),
      r.description || ''
    ]);
    const csvContent = [header, ...rows].map(r => r.map(f => '"' + String(f).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pripominky-servisu-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: '#ffeeba', color: '#856404', padding: 12, borderRadius: 6, marginBottom: 16, border: '1px solid #ffeeba' }}>
      <b>Upozornění:</b> U těchto kol se blíží výročí servisu:
      <button onClick={exportToCSV} style={{ marginLeft: 12, background: '#2563eb', color: 'white', border: 0, borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>
        Exportovat do CSV
      </button>
      <ul style={{ margin: 0 }}>
        {reminders.map((r) => (
          <li key={r._id}>
            {r.bikeModel && <>{r.bikeModel} </>}{r.bikeBrand && <>{r.bikeBrand} </>}<b>{new Date(r.date).toLocaleDateString()}</b>: {r.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RemindersAlert;
