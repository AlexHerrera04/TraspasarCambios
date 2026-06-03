import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useQueries, useQuery } from '@tanstack/react-query';
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
  removeContinueWatchingItem,
  YOUTUBE_CONTINUE_WATCHING_UPDATED,
} from '../utils/youtubeContinueWatching';

const APP_LANGUAGE_KEY = 'appLanguage';

const StyledListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  margin: 0 0 5vh;
`;

const filterCategories = {
  C: {
    label: {
      es: 'Comunicación',
      en: 'Communication',
    },
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
    label: {
      es: 'Liderazgo',
      en: 'Leadership',
    },
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
    label: {
      es: 'Proyectos',
      en: 'Projects',
    },
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
    label: {
      es: 'Negociación',
      en: 'Negotiation',
    },
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
    label: {
      es: 'IT & PoCs',
      en: 'IT & PoCs',
    },
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
    label: {
      es: 'Coaching',
      en: 'Coaching',
    },
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

const CONTENT_CATEGORIES: { title: string; ids: number[] }[] = [
  {
    title: 'Frontend Engineering',
    ids: [
      2568, 2490, 2486, 2455, 2239, 2028, 2009, 1928, 1803, 1650, 1648, 1535,
      1417, 1336, 1324, 1299, 1289, 1187, 1147,
    ],
  },
  {
    title: 'Backend Engineering',
    ids: [
      2587, 2579, 2464, 2384, 2359, 2309, 2275, 2262, 2209, 2082, 1936, 1906,
      1856, 1717, 1686,
    ],
  },
  {
    title: 'Cloud & Infrastructure',
    ids: [
      2553, 2511, 2349, 2282, 2232, 2148, 2077, 1896, 1872, 1814, 1707, 1675,
      1659, 1536, 1259, 1241, 1011, 2628, 2442, 2430, 2408,
    ],
  },
  {
    title: 'DevOps & Platform Engineering',
    ids: [
      2512, 1989, 1170, 1835, 1688, 1192, 2436, 2415, 2411, 2337, 2325, 2295,
      2290, 2271, 2203, 2190, 2102, 2086,
    ],
  },
  {
    title: 'Cybersecurity',
    ids: [
      2560, 1690, 1456, 1667, 2622, 2594, 2547, 2499, 2472, 2371, 2288, 2195,
      2191, 2167, 2075, 2069,
    ],
  },
  {
    title: 'Data & Analytics',
    ids: [
      1941, 1069, 1699, 2620, 2606, 2597, 2585, 2582, 2565, 2550, 2532, 2492,
      2450, 2440, 2427, 2420, 2352, 2341, 2338, 2286,
    ],
  },
  {
    title: 'Artificial Intelligence',
    ids: [
      2429, 2413, 2222, 1877, 1845, 1213, 1168, 1118, 1036, 1946, 1773, 1702,
      1671, 1553,
    ],
  },
  {
    title: 'Business Intelligence',
    ids: [2480, 2171, 1418, 1406, 1033, 1539, 1200],
  },
  {
    title: 'Testing & QA',
    ids: [
      2398, 1788, 2577, 2563, 2554, 2491, 2457, 2363, 2194, 2143, 2044, 1738,
      1689, 1592, 1509,
    ],
  },
  {
    title: 'UX & Customer Experience',
    ids: [2528, 2524, 2502, 2202, 2175, 1735, 1596, 1442, 1352],
  },
];

const Browser = () => {
  const language =
    localStorage.getItem(APP_LANGUAGE_KEY) === 'en' ? 'en' : 'es';

  const copy =
    language === 'en'
      ? {
          continueWatching: 'Continue watching',
          mandatory: 'Mandatory Content',
          aligned: 'Aligned with your Digital DNA',
          internal: 'Internal to your company',
          latest: 'Latest content',
          youMayLike: 'You might be interested',
          recommendations: 'Recommendations',
          filteredContent: 'Filtered Content',
        }
      : {
          continueWatching: 'Seguir viendo',
          mandatory: 'Contenido Mandatorio',
          aligned: 'Alineado con tu ADN Digital',
          internal: 'Interno de tu empresa',
          latest: 'Lo más reciente',
          youMayLike: 'Podrían interesarte',
          recommendations: 'Recomendaciones',
          filteredContent: 'Contenido filtrado',
        };

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

  const categoryQueries = useQueries({
    queries: CONTENT_CATEGORIES.map((category) => ({
      queryKey: ['categoryContents', category.title],
      queryFn: async () => {
        const { data } = await api.get(
          `${import.meta.env.VITE_API_URL}/contents/batch?ids=${category.ids.join(
            ','
          )}`
        );
        return data;
      },
      enabled: category.ids.length > 0,
    })),
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

  const handleRemoveContinueWatching = useCallback(
    (id: string | number) => {
      removeContinueWatchingItem(id);
      refreshContinueWatching();
    },
    [refreshContinueWatching]
  );

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

        {searchTerm === '' && filterTerm === '' && (
          <>
            {mandatoryQuery.data && mandatoryQuery.data.length > 0 && (
              <List
                data={mandatoryQuery.data}
                isFetching={mandatoryQuery.isFetching}
                title={copy.mandatory}
                handleFilter={handleFilter}
                showSeeAll={false}
              />
            )}

            {continueWatching.length > 0 && (
              <List
                data={continueWatching}
                isFetching={false}
                title={copy.continueWatching}
                handleFilter={handleFilter}
                showSeeAll={false}
                onRemoveItem={handleRemoveContinueWatching}
              />
            )}

            <List
              data={data}
              isFetching={isFetching}
              title={copy.aligned}
              handleFilter={handleFilter}
              showSeeAll={false}
            />

            {internalQuery.data && internalQuery.data.length > 0 && (
              <List
                data={internalQuery.data}
                isFetching={internalQuery.isFetching}
                title={copy.internal}
                handleFilter={handleFilter}
                showSeeAll={false}
              />
            )}

            {CONTENT_CATEGORIES.map((category, index) => {
              const query = categoryQueries[index];
              if (!query.data || query.data.length === 0) return null;
              return (
                <List
                  key={category.title}
                  data={query.data}
                  isFetching={query.isFetching}
                  title={category.title}
                  handleFilter={handleFilter}
                  showSeeAll={false}
                />
              );
            })}

            <List
              data={newContentsQuery.data}
              isFetching={newContentsQuery.isFetching}
              title={copy.latest}
              handleFilter={handleFilter}
              showSeeAll={false}
            />

            <Favorites contents={data} isFetching={isFetching} />

            <CardGrid
              id="card-grid"
              data={data}
              isFetching={isFetching}
              title={copy.youMayLike}
              handleFilter={handleFilter}
            />
          </>
        )}

        {searchTerm === '' && filterTerm === '' && (
          <CardGrid
            id="card-grid"
            data={data}
            isFetching={isFetching}
            title={copy.recommendations}
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
                ?.label[language] || copy.filteredContent
            }
          />
        )}
      </StyledListContainer>
    </section>
  );

  return withNavbar({ children: browserContent });
};

export default Browser;