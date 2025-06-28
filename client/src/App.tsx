import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [apiMessage, setApiMessage] = useState('');
  const [count, setCount] = useState(0);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/hello')
      .then((res) => res.json())
      .then((data) => setApiMessage(data.message))
      .catch(() => setApiMessage('Nepodařilo se načíst zprávu z API.'));
  }, []);

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
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (user) {
    return (
      <div className="App">
        <h1>Vítej, {user}!</h1>
        <p>{apiMessage}</p>
        <button onClick={() => setUser(null)}>Odhlásit se</button>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Cykloservis</h1>
      <p style={{ color: 'green' }}>Zpráva z backendu: {apiMessage}</p>
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
        Toto je úvodní obrazovka. Další funkce budou postupně přibývat.
      </p>
    </div>
  );
}

export default App;
