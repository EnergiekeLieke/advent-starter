'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login({ wachtwoordIngesteld }: { wachtwoordIngesteld: boolean }) {
  const router = useRouter();
  const [wachtwoord, setWachtwoord] = useState('');
  const [fout, setFout] = useState('');
  const [bezig, setBezig] = useState(false);

  async function verstuur(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);
    setFout('');
    const res = await fetch('/api/beheer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wachtwoord }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setFout(data.fout ?? 'Inloggen is niet gelukt.');
      setBezig(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-bold">Beheer</h1>
      <p className="mt-1 text-sm text-slate-600">Hier pas je jouw adventkalender aan.</p>

      {!wachtwoordIngesteld ? (
        <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Er is nog geen wachtwoord ingesteld. Voeg in Vercel de variabele <code className="font-mono">BEHEER_WACHTWOORD</code> toe
          (Settings, Environment Variables), kies zelf een wachtwoord en deploy opnieuw. Lokaal zet je hem in <code className="font-mono">.env.local</code>.
        </div>
      ) : (
        <form onSubmit={verstuur} className="mt-6 space-y-3">
          <label className="block text-sm font-medium" htmlFor="wachtwoord">Wachtwoord</label>
          <input
            id="wachtwoord"
            type="password"
            value={wachtwoord}
            onChange={(e) => setWachtwoord(e.target.value)}
            autoFocus
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
          />
          {fout && <p className="text-sm text-red-700" role="alert">{fout}</p>}
          <button
            type="submit"
            disabled={bezig || !wachtwoord}
            className="w-full rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {bezig ? 'Even kijken...' : 'Inloggen'}
          </button>
        </form>
      )}
    </main>
  );
}
