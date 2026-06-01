import {
  Card,
  CardBody,
  Typography,
  Button
} from '@material-tailwind/react';
import { useQuery } from '@tanstack/react-query';
import api from '../../core/api/apiProvider';

interface ReportTableProps {
  searchTerm: string;
}

interface Report {
  id: number,
  name: string,
  description: string,
  from_date: string,
  to_date: string,
  url: string
}

const ReportTable: React.FC<ReportTableProps> = ({ searchTerm = ''}) => {
  const { data: userReports = [], isLoading: isLoadingReports } = useQuery({
    queryKey: ['userReports'],
    queryFn: async () => {
      const { data } = await api.get(`${import.meta.env.VITE_API_URL}/reports`)
      return data
    }
  });

  const filteredReports = userReports.filter((report: Report) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      report.name.toLowerCase().includes(searchLower) ||
      report.id.toString().includes(searchLower)
    );
  });

  if (isLoadingReports) {
    return (
      <div className="text-center p-4">
        Cargando reportes
      </div>
    );
  }

  // {!orgsLoading && organizations.length === 0 && (
  //   <div className="text-center p-4 text-gray-500">
  //     No hay organizaciones para mostrar
  //   </div>
  // )}

  return (
    <Card className="h-full w-full bg-gray-800">
      <CardBody className="overflow-y-auto px-0">
        <table className="w-full min-w-max table-auto text-center">
          <thead>
            <tr>
              {[
                'ID',
                'Reporte',
                'Descripción',
                'Fecha',
                'Acciones'
              ].map((head) => (
                <th
                  key={head}
                  className="border-y border-blue-gray-100 bg-gray-700 p-4"
                >
                  <Typography
                    variant="small"
                    color="white"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report: Report) => (
              <tr
                key={report.id}
                className="hover:bg-gray-600/50 transition-colors"
              >
                <td className="p-4 border-b border-blue-gray-50">
                  <Typography
                    variant="small"
                    color="white"
                    className="font-normal"
                  >
                    {report.id}
                  </Typography>
                </td>
                <td className="p-4 border-b border-blue-gray-50">
                  <Typography
                    variant="small"
                    color="white"
                    className="font-normal"
                  >
                    {report.name}
                  </Typography>
                </td>
                <td className="p-4 border-b border-blue-gray-50">
                  <Typography
                    variant="small"
                    color="white"
                    className="font-normal"
                  >
                    {report.description}
                  </Typography>
                </td>
                <td className="p-4 border-b border-blue-gray-50">
                  <Typography
                    variant="small"
                    color="white"
                    className="font-normal"
                  >
                    {report.to_date}
                  </Typography>
                </td>
                <td className="p-4 border-b border-blue-gray-50">
                  <Button
                    className="normal-case text-sm font-normal tracking-wide p-3 bg-blue-800"
                    onClick={() => {
                      window.open(report.url)
                    }}
                  >
                    Descargar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
      {!isLoadingReports && filteredReports.length === 0 && (
          <div className="text-center p-4 text-gray-500">
            No hay reportes para mostrar
          </div>
      )}
    </Card>
  );
};

export default ReportTable;