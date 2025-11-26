'use client';

import React from 'react';
import {
  Home, UtensilsCrossed, Image, CalendarCheck, Phone,
  ChevronDown, ChevronRight, Instagram, Facebook, Twitter
} from 'lucide-react';
import { FormRestaurante } from '../../hooks/useSitioData';

interface RestauranteTabProps {
  formRestaurante: FormRestaurante;
  setFormRestaurante: React.Dispatch<React.SetStateAction<FormRestaurante>>;
  expandedPage: string | null;
  setExpandedPage: (page: string | null) => void;
}

export function RestauranteTab({
  formRestaurante,
  setFormRestaurante,
  expandedPage,
  setExpandedPage
}: RestauranteTabProps) {
  const updateField = (field: keyof FormRestaurante, value: string) => {
    setFormRestaurante(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-3 animate-fadeIn">
      {/* ===== INICIO ===== */}
      <PageSection
        id="inicio"
        label="Inicio"
        icon={Home}
        expanded={expandedPage === 'inicio'}
        onToggle={() => setExpandedPage(expandedPage === 'inicio' ? null : 'inicio')}
      >
        {/* HERO - Lo primero que se ve */}
        <SectionBlock title="Hero - Lo primero que se ve">
          <InputField
            label="Nombre del restaurante"
            field="nombre"
            value={formRestaurante.nombre}
            onChange={updateField}
            placeholder="Nombre del restaurante"
          />
          <InputField
            label="Frase destacada"
            field="tagline"
            value={formRestaurante.tagline}
            onChange={updateField}
            placeholder="Ej: Cocina tradicional desde 1990"
          />
          <TextAreaField
            label="Descripcion (opcional)"
            field="descripcion"
            value={formRestaurante.descripcion}
            onChange={updateField}
            placeholder="Descripcion breve del restaurante"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Boton 1"
              field="inicio_btn_menu"
              value={formRestaurante.inicio_btn_menu}
              onChange={updateField}
            />
            <InputField
              label="Boton 2"
              field="inicio_btn_reservas"
              value={formRestaurante.inicio_btn_reservas}
              onChange={updateField}
            />
          </div>
        </SectionBlock>

        {/* SECCION CARACTERISTICAS */}
        <SectionBlock title="Seccion Caracteristicas">
          <InputField
            label="Titulo de la seccion"
            field="inicio_features_titulo"
            value={formRestaurante.inicio_features_titulo}
            onChange={updateField}
          />
          <InputField
            label="Subtitulo"
            field="inicio_features_subtitulo"
            value={formRestaurante.inicio_features_subtitulo}
            onChange={updateField}
          />
          <p className="text-xs text-gray-400 italic">Las caracteristicas se editan en el tab "Features"</p>
        </SectionBlock>

        {/* SECCION GALERIA DESTACADA */}
        <SectionBlock title="Seccion Galeria Destacada">
          <InputField
            label="Titulo de la seccion"
            field="inicio_galeria_titulo"
            value={formRestaurante.inicio_galeria_titulo}
            onChange={updateField}
          />
          <InputField
            label="Subtitulo"
            field="inicio_galeria_subtitulo"
            value={formRestaurante.inicio_galeria_subtitulo}
            onChange={updateField}
          />
          <InputField
            label="Texto del boton"
            field="inicio_galeria_btn"
            value={formRestaurante.inicio_galeria_btn}
            onChange={updateField}
          />
          <p className="text-xs text-gray-400 italic">Las imagenes se editan en el tab "Galeria" (marcadas como "Home")</p>
        </SectionBlock>
      </PageSection>

      {/* ===== MENU ===== */}
      <PageSection
        id="menu"
        label="Menu"
        icon={UtensilsCrossed}
        expanded={expandedPage === 'menu'}
        onToggle={() => setExpandedPage(expandedPage === 'menu' ? null : 'menu')}
      >
        <SectionBlock title="Encabezado de pagina">
          <InputField
            label="Titulo"
            field="menu_titulo"
            value={formRestaurante.menu_titulo}
            onChange={updateField}
          />
          <TextAreaField
            label="Subtitulo"
            field="menu_subtitulo"
            value={formRestaurante.menu_subtitulo}
            onChange={updateField}
            rows={2}
          />
        </SectionBlock>

        <SectionBlock title="Filtro de categorias">
          <InputField
            label='Texto "Ver todos"'
            field="menu_filtro_todos"
            value={formRestaurante.menu_filtro_todos}
            onChange={updateField}
          />
          <p className="text-xs text-gray-400 italic">Las categorias y platos se editan en el tab "Menu"</p>
        </SectionBlock>

        <SectionBlock title="Mensajes">
          <InputField
            label="Sin items en categoria"
            field="menu_sin_items"
            value={formRestaurante.menu_sin_items}
            onChange={updateField}
          />
        </SectionBlock>
      </PageSection>

      {/* ===== GALERIA ===== */}
      <PageSection
        id="galeria"
        label="Galeria"
        icon={Image}
        expanded={expandedPage === 'galeria'}
        onToggle={() => setExpandedPage(expandedPage === 'galeria' ? null : 'galeria')}
      >
        <div className="pt-3 space-y-3">
          <InputField
            label="Titulo de pagina"
            field="galeria_titulo"
            value={formRestaurante.galeria_titulo}
            onChange={updateField}
          />
          <TextAreaField
            label="Subtitulo"
            field="galeria_subtitulo"
            value={formRestaurante.galeria_subtitulo}
            onChange={updateField}
            rows={2}
          />
        </div>
      </PageSection>

      {/* ===== RESERVAS ===== */}
      <PageSection
        id="reservas"
        label="Reservas"
        icon={CalendarCheck}
        expanded={expandedPage === 'reservas'}
        onToggle={() => setExpandedPage(expandedPage === 'reservas' ? null : 'reservas')}
      >
        <SectionBlock title="Encabezado de pagina">
          <InputField
            label="Titulo"
            field="reservas_titulo"
            value={formRestaurante.reservas_titulo}
            onChange={updateField}
          />
          <TextAreaField
            label="Subtitulo"
            field="reservas_subtitulo"
            value={formRestaurante.reservas_subtitulo}
            onChange={updateField}
            rows={2}
          />
        </SectionBlock>

        <SectionBlock title="Boton de envio">
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Texto normal"
              field="reservas_btn_confirmar"
              value={formRestaurante.reservas_btn_confirmar}
              onChange={updateField}
            />
            <InputField
              label="Texto enviando"
              field="reservas_btn_enviando"
              value={formRestaurante.reservas_btn_enviando}
              onChange={updateField}
            />
          </div>
        </SectionBlock>

        <SectionBlock title="Mensaje de exito">
          <InputField
            label="Titulo"
            field="reservas_exito_titulo"
            value={formRestaurante.reservas_exito_titulo}
            onChange={updateField}
          />
          <TextAreaField
            label="Mensaje"
            field="reservas_exito_mensaje"
            value={formRestaurante.reservas_exito_mensaje}
            onChange={updateField}
            rows={2}
          />
        </SectionBlock>
      </PageSection>

      {/* ===== CONTACTO ===== */}
      <PageSection
        id="contacto"
        label="Contacto"
        icon={Phone}
        expanded={expandedPage === 'contacto'}
        onToggle={() => setExpandedPage(expandedPage === 'contacto' ? null : 'contacto')}
      >
        {/* Textos de pagina */}
        <div className="pt-3 space-y-3">
          <p className="text-xs font-medium text-[#d4af37] uppercase tracking-wide">Textos de pagina</p>
          <InputField
            label="Titulo"
            field="contacto_titulo"
            value={formRestaurante.contacto_titulo}
            onChange={updateField}
          />
          <TextAreaField
            label="Subtitulo"
            field="contacto_subtitulo"
            value={formRestaurante.contacto_subtitulo}
            onChange={updateField}
            rows={2}
          />
        </div>

        {/* Telefonos */}
        <div className="pt-4 space-y-3">
          <p className="text-xs font-medium text-[#d4af37] uppercase tracking-wide">Telefonos</p>
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Principal"
              field="telefono"
              value={formRestaurante.telefono}
              onChange={updateField}
              type="tel"
            />
            <InputField
              label="Secundario"
              field="telefono_secundario"
              value={formRestaurante.telefono_secundario}
              onChange={updateField}
              type="tel"
            />
          </div>
        </div>

        {/* Emails */}
        <div className="pt-4 space-y-3">
          <p className="text-xs font-medium text-[#d4af37] uppercase tracking-wide">Emails</p>
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Principal"
              field="email"
              value={formRestaurante.email}
              onChange={updateField}
              type="email"
            />
            <InputField
              label="Reservas"
              field="email_reservas"
              value={formRestaurante.email_reservas}
              onChange={updateField}
              type="email"
            />
          </div>
        </div>

        {/* Direccion */}
        <div className="pt-4 space-y-3">
          <p className="text-xs font-medium text-[#d4af37] uppercase tracking-wide">Direccion</p>
          <InputField
            label="Calle"
            field="direccion_calle"
            value={formRestaurante.direccion_calle}
            onChange={updateField}
            placeholder="Calle y numero"
          />
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Ciudad"
              field="direccion_ciudad"
              value={formRestaurante.direccion_ciudad}
              onChange={updateField}
            />
            <InputField
              label="CP"
              field="direccion_cp"
              value={formRestaurante.direccion_cp}
              onChange={updateField}
            />
          </div>
          <InputField
            label="Pais"
            field="direccion_pais"
            value={formRestaurante.direccion_pais}
            onChange={updateField}
          />
        </div>

        {/* Horarios */}
        <div className="pt-4 space-y-3">
          <p className="text-xs font-medium text-[#d4af37] uppercase tracking-wide">Horarios</p>
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Lun - Vie"
              field="horario_semana"
              value={formRestaurante.horario_semana}
              onChange={updateField}
              placeholder="12:00 - 23:00"
            />
            <InputField
              label="Fin de semana"
              field="horario_finde"
              value={formRestaurante.horario_finde}
              onChange={updateField}
              placeholder="12:00 - 00:00"
            />
          </div>
        </div>

        {/* Redes sociales */}
        <div className="pt-4 space-y-3">
          <p className="text-xs font-medium text-[#d4af37] uppercase tracking-wide">Redes sociales</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Instagram className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                data-field="instagram"
                value={formRestaurante.instagram}
                onChange={(e) => updateField('instagram', e.target.value)}
                className="neuro-input text-sm flex-1"
                placeholder="@usuario"
              />
            </div>
            <div className="flex items-center gap-2">
              <Facebook className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                data-field="facebook"
                value={formRestaurante.facebook}
                onChange={(e) => updateField('facebook', e.target.value)}
                className="neuro-input text-sm flex-1"
                placeholder="URL de Facebook"
              />
            </div>
            <div className="flex items-center gap-2">
              <Twitter className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                data-field="twitter"
                value={formRestaurante.twitter}
                onChange={(e) => updateField('twitter', e.target.value)}
                className="neuro-input text-sm flex-1"
                placeholder="@usuario"
              />
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="pt-4 space-y-3">
          <p className="text-xs font-medium text-[#d4af37] uppercase tracking-wide">Mapa</p>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">URL de Google Maps Embed</label>
            <textarea
              data-field="mapa_embed_url"
              value={formRestaurante.mapa_embed_url}
              onChange={(e) => updateField('mapa_embed_url', e.target.value)}
              className="neuro-input text-sm resize-none font-mono text-xs"
              rows={2}
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
          </div>
        </div>

        {/* Info adicional */}
        <div className="pt-4 space-y-3">
          <p className="text-xs font-medium text-[#d4af37] uppercase tracking-wide">Informacion adicional</p>
          <InputField
            label="Titulo"
            field="contacto_info_titulo"
            value={formRestaurante.contacto_info_titulo}
            onChange={updateField}
          />
          <TextAreaField
            label="Descripcion"
            field="contacto_info_descripcion"
            value={formRestaurante.contacto_info_descripcion}
            onChange={updateField}
            rows={3}
          />
        </div>
      </PageSection>
    </div>
  );
}

// === Componentes auxiliares ===

interface PageSectionProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function PageSection({ id, label, icon: Icon, expanded, onToggle, children }: PageSectionProps) {
  return (
    <div className="neuro-card-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className={`p-2 rounded-lg ${expanded ? 'neuro-pressed' : 'neuro-flat'}`}>
          <Icon className={`w-4 h-4 ${expanded ? 'text-[#d4af37]' : 'text-gray-500'}`} />
        </div>
        <span className="font-medium text-gray-700 flex-1">{label}</span>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

interface SectionBlockProps {
  title: string;
  children: React.ReactNode;
}

function SectionBlock({ title, children }: SectionBlockProps) {
  return (
    <div className="pt-4 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-[#d4af37] rounded-full" />
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</p>
      </div>
      {children}
    </div>
  );
}

interface InputFieldProps {
  label: string;
  field: keyof FormRestaurante;
  value: string;
  onChange: (field: keyof FormRestaurante, value: string) => void;
  placeholder?: string;
  type?: string;
}

function InputField({ label, field, value, onChange, placeholder, type = 'text' }: InputFieldProps) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <input
        type={type}
        data-field={field}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="neuro-input text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  field: keyof FormRestaurante;
  value: string;
  onChange: (field: keyof FormRestaurante, value: string) => void;
  placeholder?: string;
  rows?: number;
}

function TextAreaField({ label, field, value, onChange, placeholder, rows = 2 }: TextAreaFieldProps) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <textarea
        data-field={field}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="neuro-input text-sm resize-none"
        rows={rows}
        placeholder={placeholder}
      />
    </div>
  );
}

export default RestauranteTab;
