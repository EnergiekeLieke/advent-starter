'use client';

export default function Fout({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md p-8 text-center text-sm text-slate-700">
      <h1 className="mb-2 text-lg font-semibold">Even geduld</h1>
      <p>De kalender kon nu niet worden geladen. Dat is meestal zo weer voorbij.</p>
      <button type="button" onClick={reset} className="mt-4 rounded-full border border-slate-400 px-4 py-2 hover:bg-slate-100">
        Probeer opnieuw
      </button>
    </div>
  );
}
