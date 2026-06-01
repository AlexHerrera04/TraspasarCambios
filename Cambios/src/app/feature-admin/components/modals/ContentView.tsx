import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Input, Card, CardBody, Typography } from '@material-tailwind/react';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  BuildingLibraryIcon,
  GlobeAltIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { Content, ContentOrigin } from '../../types/goals';
import { getContents } from '../../services/contentService';
import ContentDetailModal from '../ContentDetailModal';

interface ContentViewProps {
  onSelect: (content: Content) => void;
  onClose: () => void;
}

export const ContentView: React.FC<ContentViewProps> = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState<ContentOrigin>('internal');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [showContentDetail, setShowContentDetail] = useState(false);

  const originTypes = [
    {
      type: 'internal' as ContentOrigin,
      label: 'Contenido Interno',
      icon: BuildingLibraryIcon,
      description: 'Contenido creado por tu organización',
      color: 'bg-primary-500',
      hoverColor: 'hover:bg-primary-600',
    },
    {
      type: 'external' as ContentOrigin,
      label: 'Contenido Externo',
      icon: GlobeAltIcon,
      description: 'Contenido compartido por expertos o proovedoores externos',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
    {
      type: 'community' as ContentOrigin,
      label: 'Comunidad',
      icon: UserGroupIcon,
      description: 'Contenido generado por la comunidad y/o IA',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
    },
    {
      type: 'public' as ContentOrigin,
      label: 'Público',
      icon: AcademicCapIcon,
      description: 'Contenido de fuentes publicas',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
  ];

  const { data } = useInfiniteQuery(
    ['contents', selectedOrigin, searchTerm],
    async ({ pageParam = 1 }) => {
      const response = await getContents({
        page: pageParam,
        limit: 100,
        origin: selectedOrigin,
        search: searchTerm,
        type: 'content',
      });
      return response;
    },
    {
      getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
      staleTime: 5 * 60 * 1000,
    }
  );

  const contents = data?.pages.flatMap(page => 
    page.contents.filter(content => content.origin === selectedOrigin)
  ) || [];

  return (
    <>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Buscar contenido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full !bg-gray-800 text-white border-gray-700"
          containerProps={{
            className: '!min-w-0',
          }}
          labelProps={{
            className: 'hidden',
          }}
          icon={
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          }
        />
      </div>

      <div className="flex gap-6">
        {/* Panel izquierdo - Tipos de Origen */}
        <div className="w-72 flex-shrink-0">
          <div className="flex flex-col gap-3">
            {originTypes.map((origin) => (
              <button
                key={origin.type}
                onClick={() => setSelectedOrigin(origin.type)}
                className={`
                  p-4 rounded-lg transition-all text-left
                  ${
                    selectedOrigin === origin.type
                      ? `${origin.color} text-white shadow-lg`
                      : `bg-gray-800 hover:bg-gray-700`
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`
                      p-2 rounded-lg
                      ${
                        selectedOrigin === origin.type
                          ? 'bg-white/10'
                          : 'bg-gray-700'
                      }
                    `}
                  >
                    <origin.icon
                      className={`h-6 w-6 ${
                        selectedOrigin === origin.type
                          ? 'text-white'
                          : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <Typography className="text-sm font-medium">
                      {origin.label}
                    </Typography>
                    <Typography
                      className={`text-xs mt-1 ${
                        selectedOrigin === origin.type
                          ? 'text-white/80'
                          : 'text-gray-400'
                      }`}
                    >
                      {origin.description}
                    </Typography>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Panel derecho - Lista de contenidos */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4">
            {contents.map((content) => (
              <Card
                key={content.id}
                className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer border border-gray-700"
              >
                <CardBody className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <Typography variant="h6" className="text-white mb-1">
                        {content.name}
                      </Typography>
                      <Typography className="text-sm text-gray-400 mb-3">
                        {content.description}
                      </Typography>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onSelect(content);
                            onClose();
                          }}
                          className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600"
                        >
                          Seleccionar
                        </button>
                        <button
                          onClick={() => {
                            setSelectedContent(content);
                            setShowContentDetail(true);
                          }}
                          className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-600"
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {selectedContent && (
        <ContentDetailModal
          content={selectedContent}
          open={showContentDetail}
          onClose={() => setShowContentDetail(false)}
          onConfirm={(content) => {
            onSelect(content);
            setShowContentDetail(false);
            onClose();
          }}
        />
      )}
    </>
  );
}; 