import { useEffect, useState } from 'react';

const cache = new Map();

export function useFileContent(url) {
  const [state, setState] = useState(() => {
    if (!url) return { loading: false, text: '', error: null };
    if (cache.has(url)) return { loading: false, text: cache.get(url), error: null };
    return { loading: true, text: '', error: null };
  });

  useEffect(() => {
    if (!url) { setState({ loading: false, text: '', error: null }); return; }
    if (cache.has(url)) {
      setState({ loading: false, text: cache.get(url), error: null });
      return;
    }
    let cancelled = false;
    setState({ loading: true, text: '', error: null });
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.text();
      })
      .then(text => {
        if (cancelled) return;
        cache.set(url, text);
        setState({ loading: false, text, error: null });
      })
      .catch(err => {
        if (cancelled) return;
        setState({ loading: false, text: '', error: err.message });
      });
    return () => { cancelled = true; };
  }, [url]);

  return state;
}
