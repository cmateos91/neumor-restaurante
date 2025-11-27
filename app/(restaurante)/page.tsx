'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChefHat, Award, Clock, MapPin, UtensilsCrossed, Wine, Star, Heart, Users, Leaf, Flame, Coffee } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import EditableWrapper from './_components/EditableWrapper';
import EditableSection from './_components/EditableSection';
import { PageSection, defaultHomeLayout } from '@/lib/page-builder.types';
import { useRestaurant } from '@/lib/restaurant-context';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ChefHat, Award, Clock, MapPin, UtensilsCrossed, Wine, Star, Heart, Users, Leaf, Flame, Coffee
};

export default function Home() {
  const { config, textos, features, galeriaHome } = useRestaurant();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [sections, setSections] = useState<PageSection[]>(defaultHomeLayout.sections);

  // Configurar sensor con delay para distinguir click de drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Manejar mensajes del admin (solo para page builder)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, data: msgData } = event.data || {};

      // Entrar/salir modo edición
      if (type === 'pagebuilder:enter-edit') {
        setIsEditMode(true);
      }
      if (type === 'pagebuilder:exit-edit') {
        setIsEditMode(false);
        setSelectedSectionId(null);
      }

      // Actualizar layout desde admin
      if (type === 'pagebuilder:update-layout') {
        if (msgData?.sections) {
          setSections(msgData.sections);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Notificar al admin cuando cambia el layout
  const notifyLayoutChange = useCallback((newSections: PageSection[]) => {
    window.parent.postMessage({
      type: 'preview:layout-changed',
      sections: newSections
    }, window.location.origin);
  }, []);

  // Notificar selección al admin
  const notifySelection = useCallback((sectionId: string | null) => {
    window.parent.postMessage({
      type: 'preview:section-selected',
      sectionId
    }, window.location.origin);
  }, []);

  // Manejar fin de drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          order: index
        }));
        notifyLayoutChange(newItems);
        return newItems;
      });
    }
  };

  // Seleccionar sección
  const handleSelectSection = (id: string) => {
    setSelectedSectionId(id);
    notifySelection(id);
  };

  // Deseleccionar
  const handleDeselectSection = () => {
    setSelectedSectionId(null);
    notifySelection(null);
  };

  // Datos del context
  const nombre = config?.nombre || 'Mi Restaurante';
  const tagline = config?.tagline || 'Bienvenido a nuestra experiencia gastronómica';
  const inicioTextos = textos.inicio;

  // Ordenar secciones
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  // Renderizar sección por tipo
  const renderSection = (section: PageSection) => {
    switch (section.type) {
      case 'hero':
        return (
          <section key={section.id} className="px-4 pt-12 pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center space-y-8">
                <div className="neuro-flat rounded-[3rem] p-12 md:p-20">
                  <div className="neuro-pressed rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                    <ChefHat className="w-12 h-12 text-[#d4af37]" />
                  </div>

                  <EditableWrapper elementId="inicio.hero.nombre" as="h1" className="text-5xl md:text-7xl font-bold text-[#2c2c2c] mb-6 tracking-tight transition-all">
                    {nombre}
                  </EditableWrapper>

                  <EditableWrapper elementId="inicio.hero.tagline" as="p" className="text-xl md:text-2xl text-[#666666] mb-8 max-w-3xl mx-auto leading-relaxed transition-all">
                    {tagline}
                  </EditableWrapper>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <EditableWrapper elementId="inicio.hero.btn_menu">
                      <Link href="/menu" prefetch={true}>
                        <button className="neuro-flat neuro-hover rounded-2xl px-8 py-4 text-[#2c2c2c] font-semibold w-full sm:w-auto transition-all cursor-pointer">
                          {inicioTextos.btn_menu}
                        </button>
                      </Link>
                    </EditableWrapper>
                    <EditableWrapper elementId="inicio.hero.btn_reservas">
                      <Link href="/reservas" prefetch={true}>
                        <button className="neuro-pressed rounded-2xl px-8 py-4 text-[#d4af37] font-semibold w-full sm:w-auto transition-all cursor-pointer">
                          {inicioTextos.btn_reservas}
                        </button>
                      </Link>
                    </EditableWrapper>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'features-grid':
        if (features.length === 0) return null;
        return (
          <section key={section.id} className="px-4 py-20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <EditableWrapper elementId="inicio.features.titulo" as="h2" className="text-4xl md:text-5xl font-bold text-[#2c2c2c] mb-4 transition-all">
                  {inicioTextos.features_titulo}
                </EditableWrapper>
                <EditableWrapper elementId="inicio.features.subtitulo" as="p" className="text-[#666666] text-lg max-w-2xl mx-auto transition-all">
                  {inicioTextos.features_subtitulo}
                </EditableWrapper>
              </div>

              <EditableWrapper elementId="inicio.features.items" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => {
                  const Icon = iconMap[feature.icono] || Star;
                  return (
                    <div
                      key={feature.id}
                      className="neuro-flat rounded-3xl p-8 text-center neuro-hover transition-all"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <div className="neuro-pressed rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <Icon className="w-10 h-10 text-[#d4af37]" />
                      </div>
                      <h3 className="text-xl font-bold text-[#2c2c2c] mb-3 transition-all">
                        {feature.titulo}
                      </h3>
                      <p className="text-[#666666] text-sm leading-relaxed transition-all">
                        {feature.descripcion}
                      </p>
                    </div>
                  );
                })}
              </EditableWrapper>
            </div>
          </section>
        );

      case 'gallery-preview':
        if (galeriaHome.length === 0) return null;
        return (
          <section key={section.id} className="px-4 py-20">
            <div className="max-w-7xl mx-auto">
              <div className="neuro-flat rounded-[3rem] p-8 md:p-16">
                <div className="text-center mb-12">
                  <EditableWrapper elementId="inicio.galeria.titulo" as="h2" className="text-4xl md:text-5xl font-bold text-[#2c2c2c] mb-4 transition-all">
                    {inicioTextos.galeria_titulo}
                  </EditableWrapper>
                  <EditableWrapper elementId="inicio.galeria.subtitulo" as="p" className="text-[#666666] text-lg transition-all">
                    {inicioTextos.galeria_subtitulo}
                  </EditableWrapper>
                </div>

                <EditableWrapper elementId="inicio.galeria.items" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {galeriaHome.slice(0, 3).map((image, i) => (
                    <div
                      key={image.id}
                      className="neuro-pressed rounded-2xl overflow-hidden h-64 neuro-hover relative transition-all"
                    >
                      <Image
                        src={image.url}
                        alt={image.titulo || `Ambiente ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </EditableWrapper>

                <div className="text-center mt-8">
                  <EditableWrapper elementId="inicio.galeria.btn">
                    <Link href="/galeria">
                      <button className="neuro-flat neuro-hover rounded-2xl px-8 py-4 text-[#2c2c2c] font-semibold transition-all cursor-pointer">
                        {inicioTextos.galeria_btn}
                      </button>
                    </Link>
                  </EditableWrapper>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  // Si no está en modo edición, renderizar normalmente
  if (!isEditMode) {
    return (
      <div className="min-h-screen page-transition">
        {sortedSections.filter(s => s.visible).map(renderSection)}
      </div>
    );
  }

  // Modo edición con drag and drop
  return (
    <div className="min-h-screen page-transition">
      {/* Indicador de modo edición */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#d4af37] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
        Modo Edicion - Arrastra las secciones para reordenar
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedSections.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedSections.filter(s => s.visible).map((section) => (
            <EditableSection
              key={section.id}
              id={section.id}
              isEditMode={isEditMode}
              isSelected={selectedSectionId === section.id}
              onSelect={handleSelectSection}
              onDeselect={handleDeselectSection}
            >
              {renderSection(section)}
            </EditableSection>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
