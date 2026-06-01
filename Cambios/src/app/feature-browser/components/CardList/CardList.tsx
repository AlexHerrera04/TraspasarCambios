import { Card } from '../Card';
import { useNavigate, useParams } from 'react-router-dom';
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
  const navigate = useNavigate();
  const navigationPrevRef = React.useRef(null);
  const navigationNextRef = React.useRef(null);

  return (
    <div className="mb-2 flex flex-col gap-2">
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
            className="ml-3 flex cursor-text items-center"
            onClick={() => {
              handleFilter(title);
            }}
          >
            <Typography className="cursor-pointer text-lg">See all</Typography>
            <ChevronRightIcon className="h-6 w-6" />
          </div>
        )}
      </div>

      {isFetching && (
        <div className="mt-4 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="relative w-full overflow-hidden rounded-lg bg-white p-4 shadow hover:shadow-md">
            <div className="flex animate-pulse space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="space-y-2">
                  <div className="h-4 rounded bg-gray-200"></div>
                  <div className="h-4 w-5/6 rounded bg-gray-200"></div>
                  <div className="h-4 w-5/6 rounded bg-gray-200"></div>
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
          breakpoints={breakpoints}
        >
          {data.map((card: any) => (
            <SwiperSlide key={card.id} className="!w-72">
              <div className="block">
                <Card
                  key={card.id}
                  isSelected={params?.id === String(card.id)}
                  {...card}
                  onOpenDetails={() => navigate(`/explorer/${card.id}`)}
                />
              </div>
            </SwiperSlide>
          ))}
          <div ref={navigationPrevRef} />
          <div ref={navigationNextRef} />
        </Swiper>
      )}
    </div>
  );
};