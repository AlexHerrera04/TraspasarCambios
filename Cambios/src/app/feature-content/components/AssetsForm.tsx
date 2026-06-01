import { CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { IconButton, Spinner, Tooltip } from '@material-tailwind/react';
import { set } from 'lodash';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from 'src/app/core/api/apiProvider';
import Button from 'src/app/ui/Button';

interface Asset {
  file?: File;
  type?: string;
  file_name?: string;
  location_url?: string;
  id?: string;
}

const AssetsForm = ({ onAssetAdded, assets, uploading, handleDelete }: any) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      const asset: Asset = {
        file: selectedFile,
      };
      onAssetAdded(asset);
      setSelectedFile(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl mb-3">Subir un archivo</h2>
      <label
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        htmlFor="large_size"
      >
        Seleccionar archivo. Luego presiona subir. (Para subir varios archivos,
        repite la acción).
      </label>
      <div className="flex gap-3">
        <input
          onChange={handleFileChange}
          className="block w-full text-lg text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          id="large_size"
          type="file"
          disabled={uploading}
        />
        <Button onClick={handleUpload} disabled={!selectedFile} primary>
          Subir
        </Button>
      </div>
      <div className="flex justify-center my-3">
        {uploading && (
          <Spinner color="deep-purple" className="h-8 w-8"></Spinner>
        )}
      </div>
      <div className="mt-3">
        {assets
          .filter((a: any) => a.type == 'file')
          ?.map((asset: Asset, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mt-2"
            >
              <span>{asset.file_name}</span>
              <div>
                <Tooltip content="Delete item">
                  <IconButton
                    variant="text"
                    onClick={() => {
                      handleDelete(asset);
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </IconButton>
                </Tooltip>
              </div>

              {
                // <Button>Eliminar</Button>
              }
            </div>
          ))}
      </div>
    </div>
  );
};

export default AssetsForm;
