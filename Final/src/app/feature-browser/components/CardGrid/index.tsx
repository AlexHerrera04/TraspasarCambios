import { Link } from 'react-router-dom';
import { Card } from '../Card';
import { Alert, Spinner } from '@material-tailwind/react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Typography } from '@material-tailwind/react';

const CardGrid = (props: any) => {
  const { data, isFetching, searchParam, filterParam, title } = props;
  if (isFetching)
    return (
      <div className="flex justify-center h-screen">
        <Spinner className="h-24 w-24"></Spinner>
      </div>
    );

  return (
    <div>
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex items-center">
          <Typography
              className="text-2xl font-bold"
              variant="h3"
              color="white"
              key={`title-${title}`}
            >
              {title}
          </Typography>
        </div>
      </div>

      <div className=" grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8">
        {data && data.length > 0 ? (
          data.map((card: any) => (
            <Link
              className="w-54"
              to={`/explorer/${card.id}`}
              key={card.id}
              state={{ background: location }}
            >
              <Card key={card.id} {...card} />
            </Link>
          ))
        ) : (
          <Alert icon={<InformationCircleIcon />} variant="ghost">
            No results...
          </Alert>
        )}
      </div>
    </div>
  );
};

export default CardGrid;
