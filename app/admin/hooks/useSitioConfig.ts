import { useSitioData } from './useSitioData';

export function useSitioConfig() {
  const { sitio, sitioConfig, formRestaurante, setFormRestaurante, saveRestaurante, loading, error } = useSitioData();

  return {
    sitio,
    sitioConfig,
    formRestaurante,
    setFormRestaurante,
    saveRestaurante,
    loading,
    error
  };
}
