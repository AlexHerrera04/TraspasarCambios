import React, { useEffect, useMemo, useState } from 'react';
import { Typography, IconButton } from '@material-tailwind/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { capitalize } from 'lodash';
import { Content, ContentOrigin } from '../../types/goals';
import { getContents } from '../../services/contentService';
import ContentDetailModal from '../ContentDetailModal';

interface SelectContentModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (content: Content) => void;
  contentType?: 'quiz' | 'content' | 'assessment';
}

const normalizeText = (value?: string) => {
  if (!value) return '';

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

const formatTypeLabel = (value?: string) => {
  if (!value) return 'Generic';
  return capitalize(value.split('_').join(' '));
};

const formatOriginLabel = (content: any) => {
  const source = content.external_source || content.origin;
  return source ? capitalize(String(source)) : 'Origen';
};

const extractCapacityLabels = (content: any): string[] => {
  const labels = new Set<string>();

  const addLabel = (value: unknown) => {
    if (typeof value === 'string' && value.trim()) {
      labels.add(value.trim());
    }
  };

  if (typeof content.capacity === 'string') {
    content.capacity
      .split(',')
      .map((item: string) => item.trim())
      .filter(Boolean)
      .forEach(addLabel);
  }

  if (Array.isArray(content.capacity)) {
    content.capacity.forEach((item: any) => {
      if (typeof item === 'string') addLabel(item);
      if (item && typeof item === 'object') {
        addLabel(item.capacity);
        addLabel(item.name);
        addLabel(item.label);
        addLabel(item.title);
      }
    });
  }

  if (Array.isArray(content.capacity_filter)) {
    content.capacity_filter.forEach((item: any) => {
      if (typeof item === 'string') addLabel(item);
      if (item && typeof item === 'object') {
        addLabel(item.capacity);
        addLabel(item.name);
        addLabel(item.label);
        addLabel(item.title);
      }
    });
  }

  if (Array.isArray(content.tags)) {
    content.tags.forEach(addLabel);
  }

  return Array.from(labels);
};

export const SelectContentModal: React.FC<SelectContentModalProps> = ({
  open,
  onClose,
  onSelect,
  contentType = 'content',
}) => {
  const isMultiSelect = contentType === 'content';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState<ContentOrigin | 'all'>(
    contentType === 'content' ? 'all' : 'internal'
  );
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCapacity, setSelectedCapacity] = useState('all');
  const [selectedContents, setSelectedContents] = useState<Content[]>([]);
  const [detailContent, setDetailContent] = useState<Content | null>(null);

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSelectedType('all');
      setSelectedCapacity('all');
      setSelectedOrigin(contentType === 'content' ? 'all' : 'internal');
      setSelectedContents([]);
      setDetailContent(null);
    }
  }, [open, contentType]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const { data, isLoading } = useQuery(
    ['route-content-picker', contentType, selectedOrigin, searchTerm],
    () =>
      getContents({
        page: 1,
        limit: 1000,
        origin: selectedOrigin === 'all' ? undefined : selectedOrigin,
        search: searchTerm,
        type: contentType,
      }),
    {
      enabled: open,
      staleTime: 30000,
    }
  );

  const contents = data?.contents || [];

  const availableTypes = useMemo(() => {
    const unique = new Set<string>();

    contents.forEach((content) => {
      if (content.type) unique.add(content.type);
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [contents]);

  const availableCapacities = useMemo(() => {
    const unique = new Set<string>();

    contents.forEach((content: any) => {
      extractCapacityLabels(content).forEach((label) => unique.add(label));
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [contents]);

  const filteredContents = useMemo(() => {
    return contents.filter((content: any) => {
      const matchesName =
        !searchTerm ||
        normalizeText(content.name).includes(normalizeText(searchTerm));

      const matchesType =
        selectedType === 'all' ||
        normalizeText(content.type) === normalizeText(selectedType);

      const capacities = extractCapacityLabels(content);
      const matchesCapacity =
        selectedCapacity === 'all' ||
        capacities.some(
          (capacity) =>
            normalizeText(capacity) === normalizeText(selectedCapacity)
        );

      return matchesName && matchesType && matchesCapacity;
    });
  }, [contents, searchTerm, selectedType, selectedCapacity]);

  const getTitle = () => {
    if (contentType === 'quiz') return 'Seleccionar Quiz';
    if (contentType === 'assessment') return 'Seleccionar Assessment';
    return 'Añadir contenido';
  };

  const isSelected = (contentId: number) =>
    selectedContents.some((content) => content.id === contentId);

  const toggleSelection = (content: Content) => {
    setSelectedContents((current) => {
      if (current.some((item) => item.id === content.id)) {
        return current.filter((item) => item.id !== content.id);
      }

      return [...current, content];
    });
  };

  const handleSelect = (content: Content) => {
    if (isMultiSelect) {
      toggleSelection(content);
      return;
    }

    onSelect(content);
    onClose();
  };

  const handleAddSelected = () => {
    selectedContents.forEach((content) => onSelect(content));
    onClose();
  };

  const handleClearSelected = () => {
    setSelectedContents([]);
  };

  const handleDetailConfirm = (content: Content) => {
    if (isMultiSelect) {
      toggleSelection(content);
      return;
    }

    onSelect(content);
    setDetailContent(null);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-[#0f172a] text-white">
        <div className="flex h-screen flex-col overflow-hidden">
          <div className="container mx-auto flex h-full min-h-0 flex-col px-3 pb-6 pt-6 lg:px-0">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <Typography variant="h3" className="text-white">
                  {getTitle()}
                </Typography>
                <Typography className="mt-2 text-sm text-white/60">
                  Busca por nombre, filtra por tipo de contenido o por
                  capacidades.
                </Typography>
              </div>

              <IconButton
                variant="text"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <XMarkIcon className="h-6 w-6" />
              </IconButton>
            </div>

            <div className="mb-8 grid gap-4 lg:grid-cols-[220px_260px_220px_1fr]">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/75">
                  Origen
                </label>
                <select
                  value={selectedOrigin}
                  onChange={(event) =>
                    setSelectedOrigin(event.target.value as ContentOrigin | 'all')
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none transition focus:border-primary-500"
                >
                  <option value="all" className="bg-[#111827] text-white">
                    Todos
                  </option>
                  <option value="internal" className="bg-[#111827] text-white">
                    Contenido interno
                  </option>
                  <option value="external" className="bg-[#111827] text-white">
                    Contenido externo
                  </option>
                  <option value="community" className="bg-[#111827] text-white">
                    Comunidad
                  </option>
                  <option value="public" className="bg-[#111827] text-white">
                    Público
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/75">
                  Tipo de contenido
                </label>
                <select
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none transition focus:border-primary-500"
                >
                  <option value="all" className="bg-[#111827] text-white">
                    Todos
                  </option>
                  {availableTypes.map((type) => (
                    <option
                      key={type}
                      value={type}
                      className="bg-[#111827] text-white"
                    >
                      {formatTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/75">
                  Capacidades
                </label>
                <select
                  value={selectedCapacity}
                  onChange={(event) => setSelectedCapacity(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none transition focus:border-primary-500"
                >
                  <option value="all" className="bg-[#111827] text-white">
                    Todas
                  </option>
                  {availableCapacities.map((capacity) => (
                    <option
                      key={capacity}
                      value={capacity}
                      className="bg-[#111827] text-white"
                    >
                      {capacity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/75">
                  Buscar por nombre
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Escribe el nombre del contenido..."
                  className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Typography className="text-white/60">
                    Cargando contenidos...
                  </Typography>
                </div>
              ) : filteredContents.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 pb-6 md:grid-cols-2 xl:grid-cols-4">
                  {filteredContents.map((content: any) => {
                    const capacityLabels = extractCapacityLabels(content);
                    const selected = isSelected(content.id);

                    return (
                      <div
                        key={content.id}
                        className="flex min-h-[430px] flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div
                          style={{
                            backgroundImage: content.public_image
                              ? `url(${content.public_image})`
                              : undefined,
                          }}
                          className="relative flex h-56 items-center justify-between rounded-lg bg-gray-700 bg-cover bg-center shadow-md"
                        >
                          <span className="absolute left-2 top-2 rounded-lg bg-black/50 p-2 text-xs shadow-md drop-shadow-md">
                            {formatTypeLabel(content.type)}
                          </span>

                          <span className="absolute right-2 top-2 rounded-lg bg-black/50 p-2 text-xs shadow-md drop-shadow-md">
                            {formatOriginLabel(content)}
                          </span>
                        </div>

                        <h2 className="mb-0 mt-3 text-lg font-bold">
                          {content.name}
                        </h2>

                        <p className="my-3 line-clamp-5 text-sm leading-6 text-white/60">
                          {content.short_description || content.description}
                        </p>

                        <div className="mb-4 flex flex-wrap gap-2">
                          {capacityLabels.slice(0, 4).map((label) => (
                            <span
                              key={`${content.id}-${label}`}
                              className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70"
                            >
                              {label}
                            </span>
                          ))}
                        </div>

                        <div className="mt-auto flex gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailContent(content)}
                            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                          >
                            Ver detalles
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelect(content)}
                            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium text-white transition ${
                              selected
                                ? 'bg-emerald-600 hover:bg-emerald-500'
                                : 'bg-primary-600 hover:bg-primary-500'
                            }`}
                          >
                            {isMultiSelect
                              ? selected
                                ? 'Seleccionado'
                                : 'Seleccionar'
                              : 'Seleccionar'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Typography variant="h5" className="text-white">
                      No se encontraron contenidos
                    </Typography>
                    <Typography className="mt-2 text-sm text-white/50">
                      Ajusta la búsqueda, el tipo de contenido o las
                      capacidades.
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isMultiSelect && selectedContents.length > 0 && (
            <div className="pointer-events-none absolute bottom-6 right-6 z-20">
              <div className="pointer-events-auto rounded-2xl border border-white/10 bg-[#111827]/95 px-4 py-3 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-4">
                  <Typography className="text-sm text-white/75">
                    {selectedContents.length} seleccionado
                    {selectedContents.length === 1 ? '' : 's'}
                  </Typography>

                  <button
                    type="button"
                    onClick={handleClearSelected}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleAddSelected}
                    className="rounded-xl bg-primary-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-primary-500"
                  >
                    Añadir seleccionados
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ContentDetailModal
        content={detailContent}
        open={Boolean(detailContent)}
        onClose={() => setDetailContent(null)}
        onConfirm={handleDetailConfirm}
        isSelected={detailContent ? isSelected(detailContent.id) : false}
        multiSelect={isMultiSelect}
      />
    </>
  );
};

export default SelectContentModal;