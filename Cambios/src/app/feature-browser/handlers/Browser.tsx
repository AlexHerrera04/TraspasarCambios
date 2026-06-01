import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { debounce, flatMap } from 'lodash';
import { useSearchParams } from 'react-router-dom';
import withNavbar from '../../core/handlers/withNavbar';
import api from 'src/app/core/api/apiProvider';
import SearchBar from '../components/SearchBar';
import CardGrid from '../components/CardGrid';
import Favorites from '../components/Favorites/handlers/FavoritesRow';
import { List } from '../components/CardList/CardList';
import NewsTicker from 'src/app/ui/NewsTicker';
import {
  ContinueWatchingItem,
  getContinueWatchingItems,
  YOUTUBE_CONTINUE_WATCHING_UPDATED,
} from '../utils/youtubeContinueWatching';

const StyledListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  margin: 0 0 5vh;
`;

const filterCategories = {
  C: {
    label: 'Comunicación',
    keywords: [
      'comunica',
      'adapta',
      'mensaje',
      'colabora',
      'redacción',
      'influencia',
      'comprensión',
      'claridad',
      'cambio',
      'stakeholders',
      'feedback',
      'expectativas',
      'cultura',
    ],
  },
  L: {
    label: 'Liderazgo',
    keywords: [
      'cambio',
      'estrategia',
      'innovación',
      'adaptabilidad',
      'adaptación',
      'influencia',
      'inspiración',
      'visión',
      'rendimiento',
      'liderazgo',
      'estrategia',
      'estratégica',
      'coaching',
      'resultados',
      'tiempo',
      'alineación',
      'negocio',
    ],
  },
  P: {
    label: 'Proyectos',
    keywords: [
      'proyecto',
      'programas',
      'tiempo',
      'recursos',
      'negocio',
      'necesidades',
      'stakeholders',
      'cambio',
      'PM',
      'project',
    ],
  },
  N: {
    label: 'Negociación',
    keywords: [
      'estrategia',
      'acuerdo',
      'negocia',
      'escenario',
      'alternativ',
      'influencia',
      'persua',
      'adapta',
      'clima',
      'contexto',
      'impacto',
      'problema',
    ],
  },
  I: {
    label: 'IT & PoCs',
    keywords: [
      'innovación',
      'innovation',
      'estrategia',
      'cambio',
      'futuro',
      'crecimiento',
      'inspiración',
      'metodo',
      'agil',
      'lean',
      'disrup',
      'digital',
      'poc',
      'valida',
      'mvp',
      'idea',
      'data',
      'dato',
      'analytics',
      'ETL',
      'machine learning',
      'ML',
      'dama',
      'personalización',
      'cloud',
      'google',
      'nube',
      'sql',
      'big',
      'DL',
    ],
  },
  O: {
    label: 'Coaching',
    keywords: [
      'inspira',
      'motiva',
      'mentor',
      'tiempo',
      'personas',
      'conflicto',
      'coach',
      'empatía',
      'cultura',
      'adapta',
      'expecta',
      'crisis',
      'bienestar',
      'confia',
    ],
  },
};

const Browser = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTerm, setFilterTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [continueWatching, setContinueWatching] = useState<
    ContinueWatchingItem[]
  >([]);

  const refreshContinueWatching = useCallback(() => {
    setContinueWatching(getContinueWatchingItems());
  }, []);

  const debounceSearchTerm = useCallback(
    debounce((param: string) => {
      setSearchTerm(param);
    }, 500),
    []
  );

  const { data, isFetching } = useQuery({
    queryKey: ['cardList'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/recommendations/contents`
      );

      return data;
    },
  });

  const searchQuery = useQuery({
    queryKey: ['searchTerm', searchTerm],
    queryFn: async () => {
      if (searchTerm !== '') {
        const { data } = await api.get(
          `${
            import.meta.env.VITE_API_URL
          }/contents/contents_search/?query_param=${searchTerm}`
        );
        return data;
      }
      return null;
    },
    enabled: !!searchTerm,
  });

  const mandatoryQuery = useQuery({
    queryKey: ['mandatoryList'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/contents/mandatory`
      );
      return data;
    },
  });

  const internalQuery = useQuery({
    queryKey: ['internalList'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/contents/internal`
      );
      return data;
    },
  });

  const newContentsQuery = useQuery({
    queryKey: ['newList'],
    queryFn: async () => {
      const { data } = await api.get(
        `${import.meta.env.VITE_API_URL}/contents/new`
      );
      return data;
    },
  });

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    const currentFilter = searchParams.get('filter') || '';

    if (currentSearch) {
      debounceSearchTerm(currentSearch);
      setSearchInput(currentSearch);
    }

    if (currentFilter) {
      setFilterTerm(currentFilter);
    }
  }, [debounceSearchTerm, searchParams]);

  useEffect(() => {
    refreshContinueWatching();

    window.addEventListener(
      YOUTUBE_CONTINUE_WATCHING_UPDATED,
      refreshContinueWatching
    );
    window.addEventListener('focus', refreshContinueWatching);

    return () => {
      window.removeEventListener(
        YOUTUBE_CONTINUE_WATCHING_UPDATED,
        refreshContinueWatching
      );
      window.removeEventListener('focus', refreshContinueWatching);
    };
  }, [refreshContinueWatching]);

  const handleSearch = (param: string) => {
    setSearchParams({ search: param });
    setSearchInput(param);
    debounceSearchTerm(param);
  };

  const handleFilter = (param: string) => {
    setSearchParams({ filter: param });
    setFilterTerm(param);
  };

  const filterContent = (content: any) => {
    if (!filterTerm) return true;

    const selectedCategory =
      filterCategories[filterTerm as keyof typeof filterCategories];
    if (!selectedCategory) return true;

    if (typeof content.capacity !== 'string') return false;

    const capacityLower = content.capacity.toLowerCase();
    return selectedCategory.keywords.some((keyword) =>
      capacityLower.includes(keyword.toLowerCase())
    );
  };

  const values = flatMap(data, (item) => {
    if (Array.isArray(item.capacity_filter)) {
      return item.capacity_filter.map((capacity: any) => ({
        ...item,
        capacity: capacity.capacity,
      }));
    }

    return { ...item };
  });

  const browserContent = (
    <section className="container mx-auto px-3 lg:px-0">
      <StyledListContainer>
        <NewsTicker />

        <SearchBar
          handleSearch={handleSearch}
          handleFilter={handleFilter}
          activeFilter={filterTerm}
          searchTerm={searchInput}
        />

        {searchTerm === '' && filterTerm === '' && continueWatching.length > 0 && (
          <List
            data={continueWatching}
            isFetching={false}
            title="Seguir viendo"
            handleFilter={handleFilter}
            showSeeAll={false}
          />
        )}

        {searchTerm === '' && filterTerm === '' && (
          <>
            {mandatoryQuery.data && mandatoryQuery.data.length > 0 && (
              <List
                data={mandatoryQuery.data}
                isFetching={mandatoryQuery.isFetching}
                title="Contenido Mandatorio"
                handleFilter={handleFilter}
                showSeeAll={false}
              />
            )}

            {internalQuery.data && internalQuery.data.length > 0 && (
              <List
                data={internalQuery.data}
                isFetching={internalQuery.isFetching}
                title="Interno de tu empresa"
                handleFilter={handleFilter}
                showSeeAll={false}
              />
            )}

            <List
              data={data}
              isFetching={isFetching}
              title="Alineado con tu ADN Digital"
              handleFilter={handleFilter}
              showSeeAll={false}
            />

            <List
              data={newContentsQuery.data}
              isFetching={newContentsQuery.isFetching}
              title="Lo mas reciente"
              handleFilter={handleFilter}
              showSeeAll={false}
            />

            <Favorites contents={data} isFetching={isFetching} />

            <CardGrid
              id="card-grid"
              data={data}
              isFetching={isFetching}
              title="Podrían interesarte"
              handleFilter={handleFilter}
            />
          </>
        )}

        {searchTerm === '' && filterTerm === '' && (
          <CardGrid
            id="card-grid"
            data={data}
            isFetching={isFetching}
            title="Recomendaciones"
            handleFilter={handleFilter}
          />
        )}

        {searchTerm !== '' && (
          <CardGrid
            id="card-grid"
            data={searchQuery.data}
            isFetching={searchQuery.isFetching}
            searchParam={searchTerm}
          />
        )}

        {filterTerm !== '' && (
          <CardGrid
            id="card-grid"
            data={Array.from(
              new Set(values?.filter(filterContent).map((content) => content.id))
            ).map((id) => values.find((content) => content.id === id))}
            isFetching={isFetching}
            filterParam={filterTerm}
            title={
              filterCategories[filterTerm as keyof typeof filterCategories]
                ?.label || 'Filtered Content'
            }
          />
        )}
      </StyledListContainer>
    </section>
  );

  return withNavbar({ children: browserContent });
};

export default Browser;