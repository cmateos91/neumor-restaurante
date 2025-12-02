'use client';

import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Mail, Phone, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: 'web' | 'instagram' | 'google' | 'referral' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  createdAt: Date;
  notes?: string;
}

interface LeadsTableProps {
  leads: Lead[];
  onLeadClick?: (lead: Lead) => void;
  onStatusChange?: (leadId: string, status: Lead['status']) => void;
}

const sourceLabels: Record<Lead['source'], string> = {
  web: 'Web',
  instagram: 'Instagram',
  google: 'Google',
  referral: 'Referido',
  other: 'Otro'
};

const statusLabels: Record<Lead['status'], { label: string; color: string }> = {
  new: { label: 'Nuevo', color: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'Contactado', color: 'bg-yellow-100 text-yellow-700' },
  qualified: { label: 'Calificado', color: 'bg-purple-100 text-purple-700' },
  converted: { label: 'Convertido', color: 'bg-green-100 text-green-700' },
  lost: { label: 'Perdido', color: 'bg-gray-100 text-gray-700' }
};

export function LeadsTable({ leads, onLeadClick, onStatusChange }: LeadsTableProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<Lead['status'] | 'all'>('all');

  // Filtrar y ordenar leads
  const filteredLeads = leads
    .filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortDir === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      return sortDir === 'asc'
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime();
    });

  const toggleSort = (field: 'name' | 'createdAt') => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  return (
    <div className="neuro-card p-5">
      {/* Header con busqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="neuro-input pl-10 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Lead['status'] | 'all')}
            className="neuro-select text-sm"
          >
            <option value="all">Todos</option>
            {Object.entries(statusLabels).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th
                className="text-left py-3 px-2 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => toggleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Nombre
                  {sortBy === 'name' && (
                    sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                Contacto
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                Origen
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                Estado
              </th>
              <th
                className="text-left py-3 px-2 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => toggleSort('createdAt')}
              >
                <div className="flex items-center gap-1">
                  Fecha
                  {sortBy === 'createdAt' && (
                    sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No se encontraron leads
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onLeadClick?.(lead)}
                  className="border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-2">
                    <p className="font-medium text-gray-700">{lead.name}</p>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Phone className="w-3 h-3" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm text-gray-600">{sourceLabels[lead.source]}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusLabels[lead.status].color}`}>
                      {statusLabels[lead.status].label}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{lead.createdAt.toLocaleDateString('es-ES')}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Menu de acciones
                      }}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeadsTable;
