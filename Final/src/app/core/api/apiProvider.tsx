import axios from 'axios';

const api = axios.create({
  baseURL: '/',
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response.status === 401 && !originalRequest._retry) {
      // Don't redirect to login if we're on the evaluator evaluation page
      // This allows the page to handle 401 errors gracefully for public evaluation routes
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/evaluator/evaluation/')) {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

// Special API instance for evaluator routes with automatic service account authentication
export const evaluatorApi = axios.create({
  baseURL: '/',
});

// Service account credentials for evaluator access
const EVALUATOR_SERVICE_ACCOUNT = {
  email: "contribution@openkx.wiki",
  password: "user##5345"
};

let evaluatorToken: string | null = null;

// Function to authenticate the service account and get token
const authenticateServiceAccount = async (): Promise<string> => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/accounts/login`, EVALUATOR_SERVICE_ACCOUNT);
    evaluatorToken = response.data.token;
    return evaluatorToken;
  } catch (error) {
    console.error('Error authenticating service account:', error);
    throw error;
  }
};

// Request interceptor for evaluator API
evaluatorApi.interceptors.request.use(
  async (config) => {
    // Always use service account token for evaluator requests
    if (!evaluatorToken) {
      await authenticateServiceAccount();
    }
    
    if (evaluatorToken) {
      config.headers.Authorization = `Bearer ${evaluatorToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for evaluator API
evaluatorApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get 401, try to re-authenticate with service account
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await authenticateServiceAccount();
        if (evaluatorToken) {
          originalRequest.headers.Authorization = `Bearer ${evaluatorToken}`;
          return evaluatorApi(originalRequest);
        }
      } catch (authError) {
        console.error('Failed to re-authenticate service account:', authError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
