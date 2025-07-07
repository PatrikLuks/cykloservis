import React, { useState, useEffect } from 'react';

interface AIChatProps {
  userId?: string | null;
}

type Message = { role: 'user' | 'ai'; text: string; imageUrls?: string[] };

const getHistoryKey = (userId?: string | null) => `aiChatHistory_${userId || 'guest'}`;

const AIChat: React.FC<AIChatProps> = ({ userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Načti historii z localStorage při změně userId
  useEffect(() => {
    const key = getHistoryKey(userId);
    const saved = localStorage.getItem(key);
    if (saved) setMessages(JSON.parse(saved));
    else setMessages([]);
  }, [userId]);

  // Ulož historii do localStorage při změně messages
  useEffect(() => {
    const key = getHistoryKey(userId);
    localStorage.setItem(key, JSON.stringify(messages));
  }, [messages, userId]);

  // Záznam hlasu
  const startRecording = async () => {
    setAudioBlob(null);
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      setAudioBlob(new Blob(chunks, { type: 'audio/webm' }));
      setRecording(false);
    };
    recorder.start();
  };
  const stopRecording = () => {
    mediaRecorder?.stop();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && images.length === 0 && !audioBlob) return;
    // 1. Nejprve zkus najít odpověď ve znalostní bázi
    let foundFromKB = false;
    if (input.trim()) {
      try {
        const kbRes = await fetch('/api/knowledge/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: input }),
        });
        if (kbRes.ok) {
          const kbData = await kbRes.json();
          setMessages((prev) => [...prev, { role: 'user', text: input }, { role: 'ai', text: kbData.answer }]);
          setInput('');
          foundFromKB = true;
        }
      } catch {}
    }
    if (foundFromKB) return;
    if (input.trim()) setMessages((prev) => [...prev, { role: 'user', text: input }]);
    if (images.length) setMessages((prev) => [...prev, { role: 'user', text: `[obrázky odeslány]`, imageUrls: images.map(f => URL.createObjectURL(f)) }]);
    if (audioBlob) setMessages((prev) => [...prev, { role: 'user', text: '[hlasová zpráva odeslána]' }]);
    setLoading(true);
    try {
      let res, data;
      if (images.length || audioBlob) {
        const formData = new FormData();
        formData.append('userId', userId || 'host');
        if (input.trim()) formData.append('message', input);
        images.forEach((img) => formData.append('image', img));
        if (audioBlob) formData.append('audio', audioBlob, 'audio.webm');
        res = await fetch('/api/voiceflow-chat', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/voiceflow-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input, userId }),
        });
      }
      data = await res.json();
      if (data.imageUrls && Array.isArray(data.imageUrls)) {
        setMessages((prev) => [...prev, { role: 'ai', text: data.reply }, { role: 'user', text: `[náhledy obrázků]`, imageUrls: data.imageUrls }]);
      } else {
        setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
      }
      setImages([]);
      setAudioBlob(null);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Chyba při komunikaci s AI.' }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem(getHistoryKey(userId));
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setImages(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-xl font-bold mb-2">AI chat</h2>
      <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">Jste přihlášen jako: <b>{userId || 'host'}</b></div>
      <button onClick={handleClear} className="mb-2 text-xs text-red-600 hover:underline">Vymazat konverzaci</button>
      <div
        className={`mb-4 h-64 overflow-y-auto flex flex-col gap-2 border rounded p-2 bg-gray-50 dark:bg-gray-900 relative ${dragActive ? 'ring-2 ring-green-500' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {dragActive && (
          <div className="absolute inset-0 bg-green-100/80 dark:bg-green-900/80 flex items-center justify-center z-10 pointer-events-none rounded">
            <span className="text-green-700 dark:text-green-100 font-bold text-lg">Přetáhněte obrázek sem…</span>
          </div>
        )}
        {messages.length === 0 && <div className="text-gray-400">Zeptejte se na cokoliv ohledně servisu kol…</div>}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            {m.imageUrls && m.imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end mb-1">
                {m.imageUrls.map((url, idx) => (
                  <img key={idx} src={url} alt="Náhled obrázku" className="inline-block max-w-[120px] max-h-[80px] rounded border" />
                ))}
              </div>
            )}
            <span className={m.role === 'user' ? 'inline-block bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 px-2 py-1 rounded' : 'inline-block bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded'}>
              {m.text}
            </span>
          </div>
        ))}
        {loading && <div className="text-gray-400">AI přemýšlí…</div>}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 items-center flex-wrap mt-2">
        <input
          className="flex-1 border rounded px-2 py-1 dark:bg-gray-900 dark:text-white min-w-[120px]"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Váš dotaz…"
          disabled={loading}
        />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={e => setImages(e.target.files ? Array.from(e.target.files) : [])}
          disabled={loading}
          className="text-xs"
        />
        {images.length > 0 && (
          <span className="text-xs text-gray-600 dark:text-gray-300 max-w-[120px] truncate">{images.map(img => img.name).join(', ')}</span>
        )}
        <button
          type="button"
          className={`bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50 min-w-[90px] ${recording ? 'animate-pulse' : ''}`}
          onClick={recording ? stopRecording : startRecording}
          disabled={loading}
        >
          {recording ? 'Zastavit' : 'Nahrát hlas'}
        </button>
        {audioBlob && (
          <audio controls src={URL.createObjectURL(audioBlob)} className="max-w-[120px]" />
        )}
        <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded disabled:opacity-50 min-w-[90px]" disabled={loading || (!input.trim() && images.length === 0 && !audioBlob)}>
          {loading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full align-middle" /> : 'Odeslat'}
        </button>
      </form>
    </div>
  );
};

export default AIChat;
