import api from 'src/app/core/api/apiProvider';
import { ContentOrigin, Content } from '../types/goals';

interface GetContentsParams {
  page: number;
  limit: number;
  origin?: ContentOrigin;
  search?: string;
  type?: 'quiz' | 'content' | 'assessment';
}

interface ContentResponse {
  contents: Content[];
  total: number;
  hasMore: boolean;
  nextPage: number | null;
}

interface Assessment {
  name: string;
  description: string;
}

const normalizeText = (value?: string) => {
  if (!value) return '';

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

const isQuiz = (content: Content) =>
  normalizeText(content.type).includes('quiz');

const isAssessment = (content: Content) => {
  const normalized = normalizeText(content.type);
  return (
    normalized.includes('assessment') ||
    normalized.includes('assesment') ||
    normalized.includes('evaluacion')
  );
};

const matchesRequestedType = (
  content: Content,
  type?: 'quiz' | 'content' | 'assessment'
) => {
  if (!type) return true;
  if (type === 'quiz') return isQuiz(content);
  if (type === 'assessment') return isAssessment(content);
  return !isQuiz(content) && !isAssessment(content);
};

export const getContents = async ({
  page = 1,
  limit = 10,
  origin,
  search,
  type,
}: GetContentsParams): Promise<ContentResponse> => {
  try {
    const response = await api.get(`${import.meta.env.VITE_API_URL}/contents/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      params: {
        page,
        limit,
        origin,
        search,
      },
    });

    const contents = response.data || [];

    let filteredContents = contents.filter((content: Content) => {
      if (origin && content.origin !== origin) {
        return false;
      }

      if (!matchesRequestedType(content, type)) {
        return false;
      }

      return true;
    });

    if (search) {
      const searchLower = search.toLowerCase();
      filteredContents = filteredContents.filter(
        (content: Content) =>
          content.name?.toLowerCase().includes(searchLower) ||
          content.description?.toLowerCase().includes(searchLower)
      );
    }

    return {
      contents: filteredContents,
      total: filteredContents.length,
      hasMore: false,
      nextPage: null,
    };
  } catch (error) {
    console.error('Error fetching contents:', error);
    return {
      contents: [],
      total: 0,
      hasMore: false,
      nextPage: null,
    };
  }
};

export const getAssessments = async ({
  search,
}: {
  search?: string;
}): Promise<ContentResponse> => {
  try {
    const response = await api.get(`${import.meta.env.VITE_API_URL}/contents/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      params: {
        origin: 'internal',
        limit: 1000,
      },
    });

    let assessments = (response.data || []).filter((content: Content) =>
      isAssessment(content)
    );

    if (search) {
      const searchLower = search.toLowerCase();
      assessments = assessments.filter(
        (assessment: Assessment) =>
          assessment.name?.toLowerCase().includes(searchLower) ||
          assessment.description?.toLowerCase().includes(searchLower)
      );
    }

    return {
      contents: assessments,
      total: assessments.length,
      hasMore: false,
      nextPage: null,
    };
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return {
      contents: [],
      total: 0,
      hasMore: false,
      nextPage: null,
    };
  }
};

export const getContentQuiz = async (contentId: number) => {
  try {
    const { data } = await api.get(
      `${import.meta.env.VITE_API_URL}/goals/quiz/${contentId}/`
    );
    return data;
  } catch (error) {
    console.error('Error fetching content quiz:', error);
    return null;
  }
};