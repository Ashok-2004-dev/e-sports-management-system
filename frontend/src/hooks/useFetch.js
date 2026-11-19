import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

// loads data from the API and gives back { data, loading, error, reload }
export default function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    if (!url) return;
    setLoading(true);
    api.get(url).then((d) => { setData(d); setError(''); }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [url]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}
