/**
 * Minimal JS/TS syntax highlighter for the marketing code panels.
 *
 * Lifted out of CodeShowcase so the infrastructure bento can render its own
 * snippet with identical styling. Emits the `.token-*` classes defined in
 * globals.css, which resolve to the `--code-*` ramp steps — so the colours
 * follow the palette rather than being baked in here.
 *
 * Deliberately naive: a single split on a keyword/literal regex, good enough
 * for the short hand-written snippets on the landing page and nothing more.
 */
export function highlight(code: string): React.ReactNode {
  return code.split("\n").map((line, i) => {
    const parts: React.ReactNode[] = [];
    const tokens = line.split(
      /(import|from|const|await|process|new|\/\/.+$|"[^"]*"|`[^`]*`|\b\d+\b)/g,
    );
    tokens.forEach((token, j) => {
      if (!token) return;
      if (/^(import|from|const|await|new)$/.test(token)) {
        parts.push(
          <span key={j} className="token-keyword">
            {token}
          </span>,
        );
      } else if (/^\/\//.test(token)) {
        // .token-comment carries the italic
        parts.push(
          <span key={j} className="token-comment">
            {token}
          </span>,
        );
      } else if (/^"/.test(token) || /^`/.test(token)) {
        parts.push(
          <span key={j} className="token-string">
            {token}
          </span>,
        );
      } else if (/^\d+$/.test(token)) {
        parts.push(
          <span key={j} className="token-number">
            {token}
          </span>,
        );
      } else if (/^process$/.test(token)) {
        parts.push(
          <span key={j} className="token-function">
            {token}
          </span>,
        );
      } else {
        parts.push(<span key={j}>{token}</span>);
      }
    });
    return (
      <div key={i} className="leading-6">
        {parts}
      </div>
    );
  });
}
