// Alle icoontjes tekenen met currentColor: lijnen voor de contour, een zachte vulling (opacity .22) voor body
// en volle vlakjes voor de accenten. Zo blijven ze ook op kleine tegels goed leesbaar.
const VUL = { fill: 'currentColor', fillOpacity: 0.22 } as const;

const ICONEN: React.ReactNode[] = [
  // ster
  <path key="ster" d="M12 2.8l2.8 5.9 6.4.9-4.7 4.5 1.2 6.4L12 17.3l-5.7 3.2 1.200-6.400-4.700-4.500 6.400-.9z" fill="currentColor" />,

  // kerstboom
  <g key="boom">
    <path d="M12 2.5l4.500 6h-2.500l4 5.500h-3l3.500 5H5.500l3.500-5H6l4-5.500H7.500z" {...VUL} />
    <rect x="10.500" y="19.500" width="3" height="2.500" fill="currentColor" stroke="none" />
  </g>,

  // hart
  <path key="hart" d="M12 20.500s-8.200-5-8.200-10.800A4.600 4.600 0 0 1 12 6.800a4.600 4.600 0 0 1 8.200 2.900C20.200 15.500 12 20.500 12 20.500z" fill="currentColor" />,

  // huisje met schoorsteen
  <g key="huis">
    <path d="M6 10.500V20h12v-9.500" {...VUL} />
    <path d="M3 12l9-8 9 8" />
    <path d="M16 7V4.500h2V9" />
    <rect x="10" y="14" width="4" height="6" fill="currentColor" stroke="none" />
  </g>,

  // rendier
  <g key="rendier">
    <path d="M8.500 8.500C7.500 6 5.500 5 4 5.500M7.500 6.800C6.500 6.500 5.200 6.700 4.500 7.500M15.500 8.500c1-2.500 3-3.500 4.500-3M16.500 6.800c1-.3 2.300-.1 3 .7" />
    <path d="M7 10.500c-1.500 0-2.500-1-2.500-2M17 10.500c1.500 0 2.500-1 2.500-2" />
    <path d="M8.500 8.500h7l.5 6.500a4 4 0 0 1-8 0z" {...VUL} />
    <circle cx="10.200" cy="12" r=".9" fill="currentColor" stroke="none" />
    <circle cx="13.800" cy="12" r=".9" fill="currentColor" stroke="none" />
    <circle cx="12" cy="16.200" r="1.600" fill="currentColor" stroke="none" />
  </g>,

  // sneeuwvlok: drie armen, elk met vertakkingen
  <g key="vlok">
    {[0, 60, 120].map((hoek) => (
      <g key={hoek} transform={`rotate(${hoek} 12 12)`}>
        <path d="M12 2.500v19M9.600 4.700L12 7.200l2.400-2.500M9.600 19.300L12 16.800l2.400 2.500" />
      </g>
    ))}
  </g>,

  // cadeautje met strik
  <g key="cadeau">
    <rect x="4.500" y="10.500" width="15" height="10" rx="1" {...VUL} />
    <rect x="3.500" y="7.500" width="17" height="3" rx="1" {...VUL} />
    <path d="M12 7.500v13" strokeWidth="2.600" />
    <path d="M12 7.500C10.500 3.500 6.500 4 8 6.800c.7 1.200 2.500 1 4 .7zM12 7.500c1.500-4 5.500-3.500 4-.7-.7 1.200-2.500 1-4 .7z" />
  </g>,

  // kaars
  <g key="kaars">
    <rect x="8" y="10.500" width="8" height="10" rx="1" {...VUL} />
    <path d="M6 20.500h12" />
    <path d="M12 10.500V8.500" />
    <path d="M12 2.500c2.500 2.300 2.500 4.500 0 5.800-2.500-1.300-2.500-3.500 0-5.800z" fill="currentColor" />
  </g>,

  // zuurstok: dikke stok met strepen
  <g key="zuurstok">
    <path d="M8 21.500V9a4.500 4.500 0 0 1 9 0v1" strokeWidth="4" strokeOpacity="0.3" />
    <path d="M8 21.500V9a4.500 4.500 0 0 1 9 0v1" strokeWidth="4" strokeDasharray="2 2.400" strokeLinecap="butt" />
  </g>,

  // kerstbel
  <g key="bel">
    <path d="M5 18c1.800-1.700 2.500-4 2.500-7a4.500 4.500 0 0 1 9 0c0 3 .7 5.300 2.500 7z" {...VUL} />
    <path d="M4.500 18h15" />
    <circle cx="12" cy="20.500" r="1.500" fill="currentColor" stroke="none" />
    <path d="M12 6.500V4.500" />
    <circle cx="12" cy="3.700" r="1.100" fill="currentColor" stroke="none" />
  </g>,

  // maan met sterretjes
  <g key="maan">
    <path d="M18.500 14.500A8 8 0 0 1 9 4.500 8 8 0 1 0 18.500 14.500z" fill="currentColor" />
    <circle cx="17.500" cy="5.500" r="1" fill="currentColor" stroke="none" />
    <circle cx="20.500" cy="9.500" r=".7" fill="currentColor" stroke="none" />
  </g>,

  // krans met strik
  <g key="krans">
    <circle cx="12" cy="11.500" r="7" strokeWidth="3.600" strokeOpacity="0.7" />
    <circle cx="12" cy="4.600" r="1.300" fill="currentColor" stroke="none" />
    <circle cx="18.800" cy="11.500" r="1.300" fill="currentColor" stroke="none" />
    <circle cx="5.200" cy="11.500" r="1.300" fill="currentColor" stroke="none" />
    <path d="M12 18.500l-3.200 3.200M12 18.500l3.200 3.200" />
    <circle cx="12" cy="18.500" r="1.400" fill="currentColor" stroke="none" />
  </g>,
];

export const AANTAL_ICONEN = ICONEN.length;

export default function AdventIcoon({ nr, className }: { nr: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {ICONEN[nr % ICONEN.length]}
    </svg>
  );
}
