import { IContribution } from '../types';

const STORAGE_KEY = 'contributionDraft';

export const persistenceService = {
  // Guardar datos de contribución
  saveContributionData: (data: Partial<IContribution>) => {
    try {
      const existingData = localStorage.getItem(STORAGE_KEY);
      const parsedData = existingData ? JSON.parse(existingData) : {};
      const updatedData = { ...parsedData, ...data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      return true;
    } catch (error) {
      console.error('Error saving contribution data:', error);
      return false;
    }
  },

  // Obtener datos de contribución
  getContributionData: (): Partial<IContribution> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting contribution data:', error);
      return {};
    }
  },

  // Limpiar datos de contribución
  clearContributionData: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing contribution data:', error);
      return false;
    }
  },

  // Guardar datos específicos de un paso
  saveStepData: (step: string, data: any) => {
    try {
      const existingData = localStorage.getItem(STORAGE_KEY);
      const parsedData = existingData ? JSON.parse(existingData) : {};
      const updatedData = { ...parsedData, [step]: data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      return true;
    } catch (error) {
      console.error('Error saving step data:', error);
      return false;
    }
  },

  // Obtener datos específicos de un paso
  getStepData: (step: string): any => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      const parsedData = JSON.parse(data);
      return parsedData[step] || null;
    } catch (error) {
      console.error('Error getting step data:', error);
      return null;
    }
  }
}; 