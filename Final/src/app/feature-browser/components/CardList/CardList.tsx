import { Card } from '../Card';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Typography } from '@material-tailwind/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { SwiperOptions } from 'swiper/types';
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';
import React from 'react';

export interface CardData {
  id: string;
  category: string;
  title: string;
  featureImage: string;
}

const breakpoints = {
  4000: {
    slidesPerView: 'auto',
  },
  2000: {
    slidesPerView: 'auto',
  },
  1280: {
    slidesPerView: 'auto',
  },
  860: {
    slidesPerView: 3,
  },
  464: {
    slidesPerView: 2,
  },
} as {
  [width: number]: SwiperOptions;
};

export const List = ({
  data,
  isFetching,
  title,
  handleFilter,
  showSeeAll = true,
}: any) => {
  const params = useParams();
  const location = useLocation();
  const navigationPrevRef = React.useRef(null);
  const navigationNextRef = React.useRef(null);

  return (
    <div className="flex flex-col gap-2 mb-2 ">
      <div className="flex items-center">
        <Typography
          className="text-2xl font-bold"
          variant="h3"
          color="white"
          key={`title-${title}`}
        >
          {title}
        </Typography>
        {showSeeAll && (
          <div
            className="flex ml-3 items-center cursor-text"
            onClick={() => {
              handleFilter(title);
            }}
          >
            <Typography className="text-lg cursor-pointer">See all</Typography>
            <ChevronRightIcon className="h-6 w-6" />
          </div>
        )}
      </div>

      {isFetching && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4 w-full">
          <div className="relative p-4 w-full bg-white rounded-lg overflow-hidden shadow hover:shadow-md">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative p-4 w-full bg-white rounded-lg overflow-hidden shadow hover:shadow-md">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative p-4 w-full bg-white rounded-lg overflow-hidden shadow hover:shadow-md">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative p-4 w-full bg-white rounded-lg overflow-hidden shadow hover:shadow-md">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isFetching && (
        <Swiper
          scrollbar={{ draggable: true }}
          className="w-full cursor-ew-resize"
          spaceBetween={32}
          slidesPerView={'auto'}
          navigation={{
            prevEl: navigationPrevRef.current,
            nextEl: navigationNextRef.current,
          }}
        >
          {data.map((card: any) => (
            <SwiperSlide key={card.id} className="!w-72">
              <Link
                to={`/explorer/${card.id}`}
                className="block"
                state={{ background: location }}
              >
                <Card
                  key={card.id}
                  isSelected={params?.id === card.id}
                  {...card}
                />
              </Link>
            </SwiperSlide>
          ))}
          <div ref={navigationPrevRef} />
          <div ref={navigationNextRef} />
        </Swiper>
      )}
    </div>
  );
};
