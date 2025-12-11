import { useMemo } from 'react';
import { useSitioData } from './useSitioData';

export function useMenuData() {
  const {
    categorias,
    menuItems,
    addCategoria,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    setMenuItems,
    setCategorias
  } = useSitioData();

  return useMemo(() => ({
    categorias,
    menuItems,
    addCategoria,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    setMenuItems,
    setCategorias
  }), [categorias, menuItems, addCategoria, addMenuItem, updateMenuItem, deleteMenuItem, setMenuItems, setCategorias]);
}
