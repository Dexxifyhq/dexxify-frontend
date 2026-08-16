import localFont from 'next/font/local';

/**
 * TT Interphases Pro — variable font (wght 100–900, wdth 75–100, slnt 0–11).
 * One file covers every weight, so there is a single font request for the whole app.
 */
export const ttInterphases = localFont({
  src: './TTInterphasesPro-Variable.woff2',
  variable: '--font-tt-interphases',
  weight: '100 900',
  display: 'swap',
  fallback: [
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
});

/** TT Interphases Pro Mono — variable font (wght 400–700). Used for code blocks and numerics. */
export const ttInterphasesMono = localFont({
  src: './TTInterphasesProMono-Variable.woff2',
  variable: '--font-tt-interphases-mono',
  weight: '400 700',
  display: 'swap',
  fallback: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'monospace',
  ],
});
