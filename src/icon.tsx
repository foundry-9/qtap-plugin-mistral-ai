import React from 'react';

interface IconProps {
  className?: string;
}

/**
 * Mistral AI logo icon — stylized "M" wind motif.
 */
export function MistralIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="4" height="4" />
      <rect x="18" y="2" width="4" height="4" />
      <rect x="2" y="6" width="4" height="4" />
      <rect x="10" y="6" width="4" height="4" />
      <rect x="18" y="6" width="4" height="4" />
      <rect x="2" y="10" width="4" height="4" />
      <rect x="6" y="10" width="4" height="4" />
      <rect x="10" y="10" width="4" height="4" />
      <rect x="14" y="10" width="4" height="4" />
      <rect x="18" y="10" width="4" height="4" />
      <rect x="2" y="14" width="4" height="4" />
      <rect x="10" y="14" width="4" height="4" />
      <rect x="18" y="14" width="4" height="4" />
      <rect x="2" y="18" width="4" height="4" />
      <rect x="18" y="18" width="4" height="4" />
    </svg>
  );
}
