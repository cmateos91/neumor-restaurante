import { useMemo } from 'react';
import { useSitioData } from './useSitioData';

export function useFeaturesData() {
  const { features, addFeature, updateFeature, deleteFeature, setFeatures } = useSitioData();

  return useMemo(() => ({
    features,
    addFeature,
    updateFeature,
    deleteFeature,
    setFeatures
  }), [features, addFeature, updateFeature, deleteFeature, setFeatures]);
}
