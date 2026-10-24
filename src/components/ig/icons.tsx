// Instagram-style glyphs (24px, 2px stroke) drawn to match the native app.
type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const GridIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <line x1="9.015" y1="3" x2="9.015" y2="21" /><line x1="14.985" y1="3" x2="14.985" y2="21" />
    <line x1="21" y1="9.015" x2="3" y2="9.015" /><line x1="21" y1="14.985" x2="3" y2="14.985" />
  </svg>
);
export const ReelsIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
    <line x1="2.5" y1="7.5" x2="21.5" y2="7.5" />
    <line x1="13.5" y1="2.5" x2="16.5" y2="7.5" /><line x1="7" y1="2.5" x2="10" y2="7.5" />
    <path d="M9.8 11.2v6.1l5.1-3.05z" fill="currentColor" stroke="none" />
  </svg>
);
export const TaggedIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M10.2 18.6 12 21l1.8-2.4H19a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11.6a2 2 0 0 0 2 2z" />
    <circle cx="12" cy="9.5" r="2.8" /><path d="M7.5 16c.9-1.9 2.6-3 4.5-3s3.6 1.1 4.5 3" />
  </svg>
);
export const PinIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M16.8 2.6a1 1 0 0 0-1.4 0l-1 1a1 1 0 0 0-.2 1.1l.6 1.3-3.6 3.6-3-.6a1 1 0 0 0-.9.3l-1.5 1.5a1 1 0 0 0 0 1.4l3 3-5.2 5.2 1.4 1.4 5.2-5.2 3 3a1 1 0 0 0 1.4 0l1.5-1.5a1 1 0 0 0 .3-.9l-.6-3 3.6-3.6 1.3.6a1 1 0 0 0 1.1-.2l1-1a1 1 0 0 0 0-1.4z" />
  </svg>
);
export const CarouselIcon = ({ className }: P) => (
  <svg viewBox="0 0 48 48" className={className} fill="currentColor">
    <path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z" />
  </svg>
);
export const ReelBadgeIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12.8 1h-1.6l3 5h5.6l-3-5h-4zm4.9 0 3 5h2.2A6.6 6.6 0 0 0 17.8 1zM7.8 1A6.7 6.7 0 0 0 1.1 6h7.1L5.2 1zm.4 0 3 5h-2.4-.6 3l-3-5zM1 8v8.7A6.3 6.3 0 0 0 7.3 23h9.4a6.3 6.3 0 0 0 6.3-6.3V8zm8.6 3.6 6 3.4-6 3.4z" />
  </svg>
);
export const PlayIcon = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M6 4.5v15l13-7.5z" /></svg>
);
export const VerifiedIcon = ({ className }: P) => (
  <svg viewBox="0 0 40 40" className={className}>
    <path fill="var(--ig-blue)" d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" />
  </svg>
);
export const ThreadsIcon = ({ className }: P) => (
  <svg viewBox="0 0 192 192" className={className} fill="currentColor">
    <path d="M141.5 88.99a66 66 0 0 0-2.52-1.14c-1.48-27.27-16.38-42.88-41.4-43.04h-.34c-14.97 0-27.42 6.39-35.08 18.02l13.76 9.44c5.72-8.68 14.7-10.53 21.33-10.53h.23c8.24.05 14.46 2.45 18.49 7.12 2.93 3.4 4.9 8.11 5.87 14.05a105 105 0 0 0-23.7-1.14c-23.84 1.37-39.17 15.28-38.14 34.6.52 9.8 5.4 18.24 13.75 23.75 7.06 4.66 16.15 6.94 25.6 6.42 12.48-.68 22.27-5.44 29.1-14.15 5.18-6.62 8.46-15.19 9.91-25.99 5.95 3.59 10.36 8.31 12.8 13.99 4.13 9.65 4.38 25.5-8.56 38.43-11.33 11.32-24.95 16.22-45.54 16.37-22.84-.17-40.11-7.5-51.34-21.77C35.24 139.95 29.84 119.8 29.6 94c.24-25.8 5.64-45.95 16.06-59.2C56.88 20.52 74.15 13.2 97 13.03c23.01.17 40.6 7.53 52.27 21.86 5.72 7.03 10.04 15.87 12.88 26.18l16.15-4.31c-3.44-12.69-8.85-23.62-16.22-32.69C147.04 5.77 125.2-3.33 97.07-3.52h-.11C68.88-3.33 47.3 5.8 32.8 24.21 19.9 40.6 13.24 63.4 13.02 93.93v.14c.22 30.53 6.88 53.33 19.78 69.72C47.3 182.2 68.88 191.32 96.95 191.52h.11c24.96-.17 42.55-6.7 57.05-21.19 18.97-18.95 18.4-42.7 12.15-57.29-4.49-10.46-13.04-18.96-24.76-24.05zM98.44 129.5c-10.44.59-21.29-4.1-21.82-14.13-.4-7.43 5.29-15.73 22.43-16.71 1.96-.12 3.89-.17 5.78-.17 6.23 0 12.05.6 17.35 1.76-1.98 24.7-13.56 28.69-23.74 29.25z" />
  </svg>
);
