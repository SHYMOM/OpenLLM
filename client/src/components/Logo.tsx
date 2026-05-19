

export function Logo({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 32 32" 
      width={size} 
      height={size} 
      className={className}
      fill="none"
    >
      <path 
        d="M16 4 L28 10 L28 22 L16 28 L4 22 L4 10 Z" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinejoin="round" 
        className="opacity-90"
      />
      <circle cx="16" cy="16" r="5" fill="currentColor" />
      <line x1="16" y1="4" x2="16" y2="11" stroke="currentColor" strokeWidth="2.5" />
      <line x1="4" y1="10" x2="11.5" y2="13.5" stroke="currentColor" strokeWidth="2.5" />
      <line x1="28" y1="10" x2="20.5" y2="13.5" stroke="currentColor" strokeWidth="2.5" />
      <line x1="4" y1="22" x2="11.5" y2="18.5" stroke="currentColor" strokeWidth="2.5" />
      <line x1="28" y1="22" x2="20.5" y2="18.5" stroke="currentColor" strokeWidth="2.5" />
      <line x1="16" y1="28" x2="16" y2="21" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}
