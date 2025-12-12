import { useMemo } from 'react';
import { useSitioData } from './useSitioData';

export function useGaleriaData() {
  const {
    galeria,
    setGaleria,
    addGaleriaItem,
    toggleGaleriaHome,
    toggleGaleriaVisible,
    updateGaleriaItem,
    deleteGaleriaItem
  } = useSitioData();

  return useMemo(() => ({
    galeria,
    setGaleria,
    addGaleriaItem,
    toggleGaleriaHome,
    toggleGaleriaVisible,
    updateGaleriaItem,
    deleteGaleriaItem
  }), [galeria, setGaleria, addGaleriaItem, toggleGaleriaHome, toggleGaleriaVisible, updateGaleriaItem, deleteGaleriaItem]);
}
