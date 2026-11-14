/** A small line arrow (→ or ↓), sized by its font. */
export function Arrow({ className, down = false }: { className?: string; down?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" style={down ? { rotate: '90deg' } : undefined}>
      <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
