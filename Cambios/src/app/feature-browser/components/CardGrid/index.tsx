import { useNavigate } from 'react-router-dom';
import { Card } from '../Card';
import { Alert, Spinner } from '@material-tailwind/react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Typography } from '@material-tailwind/react';

const CardGrid = (props: any) => {
  const { data, isFetching, title } = props;
  const navigate = useNavigate();

  if (isFetching)
    return (
      <div className="flex h-screen justify-center">
        <Spinner className="h-24 w-24"></Spinner>
      </div>
    );

  return (
    <div>
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
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 xl:grid-cols-4">
        {data && data.length > 0 ? (
          data.map((card: any) => (
            <div className="w-54" key={card.id}>
              <Card
                key={card.id}
                {...card}
                onOpenDetails={() => navigate(`/explorer/${card.id}`)}
              />
            </div>
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