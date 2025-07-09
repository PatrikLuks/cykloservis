import { useState } from 'react';

export function TwoFactorSection({ token }: { token: string }) {
  const [enabled, setEnabled] = useState<boolean|null>(null);
  const [qr, setQr] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const fetchStatus = async () => {
    const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setEnabled(data.twoFactorEnabled);
  };

  const startSetup = async () => {
    setMsg(''); setErr('');
    const res = await fetch('/api/twofactor/setup', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) { setQr(data.qr); setSecret(data.secret); }
    else setErr(data.error || 'Chyba');
  };

  const verify = async (e: any) => {
    e.preventDefault();
    setMsg(''); setErr('');
    const res = await fetch('/api/twofactor/verify', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ token: code }) });
    const data = await res.json();
    if (res.ok) { setMsg('2FA aktivováno!'); setEnabled(true); setQr(''); setSecret(''); setCode(''); }
    else setErr(data.error || 'Chyba');
  };

  const disable = async () => {
    setMsg(''); setErr('');
    const res = await fetch('/api/twofactor/disable', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) { setMsg('2FA deaktivováno.'); setEnabled(false); }
    else setErr(data.error || 'Chyba');
  };

  return (
    <div style={{marginTop:16}}>
      <h3>Dvoufaktorová autentizace (2FA)</h3>
      <button onClick={fetchStatus}>Zkontrolovat stav</button>
      {enabled === true && <><div style={{color:'green'}}>2FA je aktivní.</div><button onClick={disable}>Deaktivovat 2FA</button></>}
      {enabled === false && <button onClick={startSetup}>Aktivovat 2FA</button>}
      {qr && <>
        <div><img src={qr} alt="QR kód pro 2FA" style={{width:200}} /></div>
        <div>Klíč: <code>{secret}</code></div>
        <form onSubmit={verify}>
          <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Zadejte kód z aplikace" required />
          <button type="submit">Ověřit a aktivovat</button>
        </form>
      </>}
      {msg && <div style={{color:'green'}}>{msg}</div>}
      {err && <div style={{color:'red'}}>{err}</div>}
    </div>
  );
}
