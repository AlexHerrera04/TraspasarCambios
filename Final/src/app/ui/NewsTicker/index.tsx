import { useEffect, useMemo, useState } from 'react';
import newsImageA from 'src/assets/images/news/news-1.jpg';
import newsImageB from 'src/assets/images/news/news-2.jpg';
import newsImageC from 'src/assets/images/news/news-3.jpg';
import newsImageD from 'src/assets/images/news/news-4.jpg';
import newsImageE from 'src/assets/images/news/news-5.jpg';

type NewsItem = {
  id: string;
  source: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
};

const APP_LANGUAGE_KEY = 'appLanguage';

const NEWS_ITEMS_ES: NewsItem[] = [
  {
    id: 'america-retail',
    source: 'America Retail & Malls',
    title: 'Los centros comerciales refuerzan su propuesta experiencial',
    subtitle:
      'Retail, ocio y restauracion ganan peso en la captacion de trafico.',
    image: newsImageA,
    href: 'https://americaretail-malls.com/',
  },
  {
    id: 'icsc',
    source: 'ICSC',
    title: 'El retail real estate sigue priorizando activos bien ubicados',
    subtitle:
      'Leasing, uso mixto y reposicionamiento marcan el ritmo del mercado.',
    image: newsImageB,
    href: 'https://www.icsc.com/news-and-views/icsc-exchange',
  },
  {
    id: 'retail-dive',
    source: 'Retail Dive',
    title: 'Las cadenas ajustan formatos para crecer con mas eficiencia',
    subtitle:
      'Operacion, rentabilidad y expansion selectiva dominan las decisiones.',
    image: newsImageC,
    href: 'https://www.retaildive.com/',
  },
  {
    id: 'shopping-center-business',
    source: 'Shopping Center Business',
    title: 'Los malls apuestan por nuevos inquilinos y servicios',
    subtitle:
      'Los operadores buscan elevar permanencia y conversion en tienda.',
    image: newsImageD,
    href: 'https://shoppingcenterbusiness.com/category/malls/',
  },
  {
    id: 'commercial-observer',
    source: 'Commercial Observer',
    title: 'La inversion retail vuelve a enfocarse en ubicaciones premium',
    subtitle:
      'Los activos con mix comercial estable atraen mas interes inversor.',
    image: newsImageE,
    href: 'https://commercialobserver.com/retail/',
  },
];

const NEWS_ITEMS_EN: NewsItem[] = [
  {
    id: 'america-retail',
    source: 'America Retail & Malls',
    title: 'Shopping centers strengthen their experiential proposition',
    subtitle:
      'Retail, leisure and dining gain weight in traffic acquisition.',
    image: newsImageA,
    href: 'https://americaretail-malls.com/',
  },
  {
    id: 'icsc',
    source: 'ICSC',
    title: 'Retail real estate keeps prioritizing well-located assets',
    subtitle:
      'Leasing, mixed use and repositioning continue to shape the market.',
    image: newsImageB,
    href: 'https://www.icsc.com/news-and-views/icsc-exchange',
  },
  {
    id: 'retail-dive',
    source: 'Retail Dive',
    title: 'Retail chains adjust formats to grow more efficiently',
    subtitle:
      'Operations, profitability and selective expansion drive decisions.',
    image: newsImageC,
    href: 'https://www.retaildive.com/',
  },
  {
    id: 'shopping-center-business',
    source: 'Shopping Center Business',
    title: 'Malls are betting on new tenants and services',
    subtitle:
      'Operators aim to increase dwell time and in-store conversion.',
    image: newsImageD,
    href: 'https://shoppingcenterbusiness.com/category/malls/',
  },
  {
    id: 'commercial-observer',
    source: 'Commercial Observer',
    title: 'Retail investment refocuses on premium locations',
    subtitle:
      'Assets with a stable commercial mix attract stronger investor interest.',
    image: newsImageE,
    href: 'https://commercialobserver.com/retail/',
  },
];

const getItemsPerPage = () => {
  if (typeof window === 'undefined') {
    return 1;
  }

  if (window.innerWidth >= 1280) {
    return 3;
  }

  if (window.innerWidth >= 768) {
    return 2;
  }

  return 1;
};

const NewsCard = ({ item }: { item: NewsItem }) => {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer"
      className="block h-full rounded-2xl border border-white/10 bg-gray-900 p-3 transition hover:border-primary-500/40 hover:bg-white/5"
    >
      <div className="flex h-full min-h-[108px] items-center gap-3">
        <img
          src={item.image}
          alt={item.title}
          className="h-20 w-20 shrink-0 rounded-xl object-cover"
        />

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300">
            {item.source}
          </p>
          <h3 className="mt-1 text-sm font-bold text-white">{item.title}</h3>
          <p className="mt-1 text-xs text-gray-400">{item.subtitle}</p>
        </div>
      </div>
    </a>
  );
};

const NewsTicker = () => {
  const language = localStorage.getItem(APP_LANGUAGE_KEY) === 'en' ? 'en' : 'es';

  const copy =
    language === 'en'
      ? {
          title: 'Latest news',
          maximize: 'Maximize',
          minimize: 'Minimize',
          previous: 'Previous content',
          next: 'Next content',
        }
      : {
          title: 'Últimas noticias',
          maximize: 'Maximizar',
          minimize: 'Minimizar',
          previous: 'Contenido anterior',
          next: 'Contenido siguiente',
        };

  const newsItems = useMemo(
    () => (language === 'en' ? NEWS_ITEMS_EN : NEWS_ITEMS_ES),
    [language]
  );

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState<number>(getItemsPerPage);
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalItems = newsItems.length;
  const maxIndex = Math.max(totalItems - itemsPerPage, 0);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (currentIndex <= maxIndex) {
      return;
    }

    setCurrentIndex(maxIndex);
  }, [currentIndex, maxIndex]);

  useEffect(() => {
    if (isCollapsed || maxIndex === 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, 7000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isCollapsed, maxIndex]);

  const handleNext = () => {
    setCurrentIndex((current) => (current >= maxIndex ? 0 : current + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((current) => (current <= 0 ? maxIndex : current - 1));
  };

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mt-1 text-lg font-semibold text-white">
            {copy.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed((current) => !current)}
          className="self-start rounded-lg border border-white/10 bg-gray-900 px-2.5 py-1.5 text-sm font-normal text-white/70 transition hover:bg-white/10 hover:text-white md:self-auto"
        >
          {isCollapsed ? copy.maximize : copy.minimize}
        </button>
      </div>

      {!isCollapsed && (
        <div className="relative mt-4 px-10 md:px-12">
          <button
            type="button"
            onClick={handlePrev}
            disabled={maxIndex === 0}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-xl border border-white/10 bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={copy.previous}
          >
            &lt;
          </button>

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{
                width: `${(totalItems / itemsPerPage) * 100}%`,
                transform: `translateX(-${(currentIndex * 100) / totalItems}%)`,
              }}
            >
              {newsItems.map((item) => (
                <div
                  key={item.id}
                  className="shrink-0 grow-0 px-1.5"
                  style={{ width: `${100 / totalItems}%` }}
                >
                  <NewsCard item={item} />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={maxIndex === 0}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-xl border border-white/10 bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={copy.next}
          >
            &gt;
          </button>
        </div>
      )}
    </section>
  );
};

export default NewsTicker;