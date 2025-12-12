import { useMemo } from 'react';
import { useSitioData } from './useSitioData';

export function useLeadsData() {
  const { sitio } = useSitioData();
  return useMemo(() => ({ sitioId: sitio?.id || null }), [sitio]);
}
