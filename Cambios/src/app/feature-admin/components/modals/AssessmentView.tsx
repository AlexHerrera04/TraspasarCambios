import React, { useState } from 'react';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { Content } from '../../types/goals';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getContents } from '../../services/contentService';
import ContentDetailModal from '../ContentDetailModal';

interface AssessmentViewProps {
  onSelect: (content: Content) => void;
  onClose: () => void;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({ onSelect, onClose }) => {
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [showContentDetail, setShowContentDetail] = useState(false);

  const { data } = useInfiniteQuery(
    ['contents', 'assessment'],
    async ({ pageParam = 1 }) => {
      const response = await getContents({
        page: pageParam,
        limit: 100,
        type: 'quiz',
      });
      return response;
    },
    {
      getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
      staleTime: 5 * 60 * 1000,
    }
  );

  const assessments = data?.pages.flatMap(page => 
    page.contents.filter(content => content.type === 'quiz')
  ) || [];

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {assessments.map((content) => (
          <Card
            key={content.id}
            className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer border border-gray-700"
          >
            <CardBody className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <Typography variant="h6" className="text-white mb-1">
                    {content.name}
                  </Typography>
                  <Typography className="text-sm text-gray-400 mb-3">
                    {content.description}
                  </Typography>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onSelect(content);
                        onClose();
                      }}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600"
                    >
                      Seleccionar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedContent(content);
                        setShowContentDetail(true);
                      }}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-600"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {selectedContent && (
        <ContentDetailModal
          content={selectedContent}
          open={showContentDetail}
          onClose={() => setShowContentDetail(false)}
          onConfirm={(content) => {
            onSelect(content);
            setShowContentDetail(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default AssessmentView; 