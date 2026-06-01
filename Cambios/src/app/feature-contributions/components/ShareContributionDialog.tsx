import { Dialog, Input, Button } from '@material-tailwind/react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import api from 'src/app/core/api/apiProvider';


interface ShareContributionDialogProps {
  open: boolean;
  onClose: () => void;
  contribution: any;
}

export const ShareContributionDialog: React.FC<ShareContributionDialogProps> = ({
  open,
  onClose,
  contribution,
}) => {
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');

  const handleShare = async () => {
    const response = await api.get(
      `${import.meta.env.VITE_API_URL}/contributor/contributions/${contribution.id}/send-summary?recipient_email=${recipientEmail}`
    );
    if (response.status === 200) {
      toast.success('Contribucion compartida exitosamente')
    } else {
      toast.error('Error al compartir la contribucion')
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      handler={onClose}
      className="bg-gray-800 text-white p-6 min-w-[400px]"
    >
      <div className="flex flex-col gap-6">
        <h3 className="text-xl font-semibold">Compartir Contribución</h3>
        
        <Input
          type="text"
          label="Nombre del Destinatario"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          className="!text-white"
          labelProps={{
            className: "!text-white/60"
          }}
          containerProps={{
            className: "!text-white"
          }}
        />

        <Input
          type="email"
          label="Email del Destinatario"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          className="!text-white"
          labelProps={{
            className: "!text-white/60"
          }}
          containerProps={{
            className: "!text-white"
          }}
        />

        <div className="flex justify-end gap-3">
          <Button
            variant="text"
            color="white"
            onClick={onClose}
            className="mr-1"
          >
            Cancelar
          </Button>
          <Button
            variant="gradient"
            color="blue"
            onClick={handleShare}
            disabled={!recipientName || !recipientEmail}
          >
            Compartir
          </Button>
        </div>
      </div>
    </Dialog>
  );
}; 