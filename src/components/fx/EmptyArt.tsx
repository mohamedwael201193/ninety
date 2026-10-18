/** Empty-state illustration: passport + dotted flight arc, pure SVG. */
export function EmptyArt() {
  return (
    <svg viewBox="0 0 200 120" className="mx-auto h-28 w-auto" aria-hidden="true">
      <defs>
        <linearGradient id="ea-g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#1f443c" /><stop offset="1" stopColor="#17332d" /></linearGradient>
      </defs>
      <ellipse cx="100" cy="108" rx="58" ry="6" fill="#0c0a08" opacity=".06" />
      <path className="ea-arc" d="M30 88 C 60 20, 140 14, 176 52" fill="none" stroke="#0c0a08" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="3 5" />
      <circle cx="30" cy="88" r="3.5" fill="#e4f222" stroke="#0c0a08" strokeWidth="1" />
      <g className="ea-plane"><path d="M170 48 l10 4 -10 4 2 -4z" fill="#0c0a08" /></g>
      <g transform="rotate(-8 100 70)">
        <rect x="74" y="36" width="52" height="68" rx="7" fill="url(#ea-g)" />
        <circle cx="100" cy="64" r="11" fill="none" stroke="#e4f222" strokeWidth="1.6" />
        <path d="M89 64h22M100 53c-5 6-5 16 0 22M100 53c5 6 5 16 0 22" stroke="#e4f222" strokeWidth="1.1" fill="none" />
        <rect x="86" y="84" width="28" height="3" rx="1.5" fill="#e4f222" opacity=".8" />
        <rect x="90" y="91" width="20" height="2.5" rx="1.25" fill="#fff" opacity=".35" />
      </g>
      <g transform="translate(132 76) rotate(12)">
        <rect width="30" height="18" rx="4" fill="#fff" stroke="#d2cecb" />
        <text x="15" y="12.5" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#c2361f">90</text>
      </g>
    </svg>
  );
}
