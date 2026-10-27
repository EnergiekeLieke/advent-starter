// Gedeelde stijlen en veldjes voor de beheerpagina
export const INPUT = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm';
export const KNOP = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-50';
export const KNOP_PRIMAIR = 'rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50';

export type Bericht = { soort: 'ok' | 'fout'; regels: string[] } | null;

export function Veld({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
