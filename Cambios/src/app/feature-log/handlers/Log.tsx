import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import api from 'src/app/core/api/apiProvider';
import withNavbar from 'src/app/core/handlers/withNavbar';
import CardGrid from 'src/app/feature-browser/components/CardGrid';

const Log: FunctionComponent<any> = () => {
  const { data, isFetching } = useQuery({
    queryKey: ['content'],
    queryFn: async () => {
      const { data } = await api.get(
        `${
          import.meta.env.VITE_API_URL
        }/contents/interaction_content_history?type=View`
      );

      return data;
    },
  });

  const pageContent = (
    <div className="container mx-auto">
      <div>
        <h2 className="text-4xl font-bold mt-10 mb-7">Mi Historial</h2>
      </div>
      <CardGrid data={data} isFetching={isFetching}></CardGrid>
    </div>
  );

  return withNavbar({ children: pageContent });
};
export default Log;
