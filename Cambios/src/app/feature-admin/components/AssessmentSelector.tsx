import { Spinner } from '@material-tailwind/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import withNavbar from 'src/app/core/handlers/withNavbar';
import Button from 'src/app/ui/Button';
import Chip from 'src/app/ui/Chip';
import { getAssessments } from 'src/app/feature-admin/services/contentService';
import type { Content } from 'src/app/feature-admin/types/goals';

const LEARNING_ROUTE_DRAFT_KEY = 'learning-route-form-draft';
const LEARNING_ROUTE_SELECTED_ASSESSMENT_KEY =
  'learning-route-selected-assessment';
const LEARNING_ROUTE_RETURN_PATH_KEY = 'learning-route-return-path';

type SelectableAssessment = Content & {
  selected?: boolean;
};

const readReturnPath = () => {
  return (
    localStorage.getItem(LEARNING_ROUTE_RETURN_PATH_KEY) ||
    '/admin/learning-routes'
  );
};

const readCurrentSelectedAssessmentId = (): number | null => {
  try {
    const pendingRaw = localStorage.getItem(
      LEARNING_ROUTE_SELECTED_ASSESSMENT_KEY
    );

    if (pendingRaw) {
      const pending = JSON.parse(pendingRaw);
      if (pending?.id) {
        return Number(pending.id);
      }
    }

    const draftRaw = localStorage.getItem(LEARNING_ROUTE_DRAFT_KEY);
    if (draftRaw) {
      const draft = JSON.parse(draftRaw);
      if (draft?.selectedEvaluation?.id) {
        return Number(draft.selectedEvaluation.id);
      }
    }

    return null;
  } catch {
    return null;
  }
};

function AssessmentSelector() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<number | null>(
    readCurrentSelectedAssessmentId()
  );

  const { data, isFetching } = useQuery({
    queryKey: ['learning-route-assessments'],
    queryFn: async () => {
      const response = await getAssessments({});
      return response.contents || [];
    },
  });

  const assessments = useMemo<SelectableAssessment[]>(() => {
    return (data || []).map((assessment) => ({
      ...assessment,
      selected: assessment.id === selectedId,
    }));
  }, [data, selectedId]);

  const handleSelect = (assessment: SelectableAssessment) => {
    setSelectedId((current) =>
      current === assessment.id ? null : assessment.id
    );
  };

  const handleContinue = () => {
    const selectedAssessment = assessments.find(
      (assessment) => assessment.id === selectedId
    );

    if (!selectedAssessment) {
      toast.error('Debes seleccionar un Assessment.');
      return;
    }

    localStorage.setItem(
      LEARNING_ROUTE_SELECTED_ASSESSMENT_KEY,
      JSON.stringify({
        id: selectedAssessment.id,
        name: selectedAssessment.name,
        type: selectedAssessment.type,
      })
    );

    navigate(readReturnPath());
  };

  const handleCancel = () => {
    navigate(readReturnPath());
  };

  const content = (
    <div className="container mx-auto p-8">
      {isFetching ? (
        <div className="flex justify-center py-44">
          <Spinner className="h-24 w-24" />
        </div>
      ) : (
        <div>
          <h2 className="mb-10 text-center text-3xl">
            Selecciona un Assessment:
          </h2>

          {assessments.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/70">
              No hay assessments disponibles.
            </div>
          ) : (
            <div className="flex flex-wrap items-start justify-center gap-2">
              {assessments.map((item) => (
                <Chip
                  key={item.id}
                  item={item}
                  setActive={() => handleSelect(item)}
                />
              ))}
            </div>
          )}

          <div className="mt-10 flex justify-center gap-4">
            <Button outline onClick={handleCancel}>
              Volver
            </Button>
            <Button onClick={handleContinue} primary>
              Continuar
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return withNavbar({ children: content });
}

export default AssessmentSelector;