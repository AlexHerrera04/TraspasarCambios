import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../auth/handlers/Login';
import Details from '../feature-browser/handlers/Details';
import Browser from '../feature-browser/handlers/Browser';
import Navigator from '../feature-navigator/handlers/Navigator';
import Questionare from '../feature-navigator/handlers/Questionnaire/Questionare';
import Dashboard from '../feature-dashboard/handlers/Dashboard';
import Selector from '../feature-navigator/handlers/Questionnaire/Selector';
import Onboarding from '../feature-onboarding/handlers/Onboarding';
import ChangePassword from '../feature-profile/handlers/ChangePassword';
import Profile from '../feature-profile/handlers/Profile';
import Content from '../feature-content/handlers/Content';
import NewContent from '../feature-content/handlers/NewContent';
import Quiz from '../feature-quiz/handlers/Quiz';
import Log from '../feature-log/handlers/Log';
import Admin from '../feature-admin/handlers/Admin';
import CreateOrganizationForm from '../feature-admin/components/FormOrganization';
import CreateUserFlow from '../feature-admin/components/CreateUserFlow';
import FormGoal from '../feature-admin/components/FormGoal';
import FormLearningRoute from '../feature-admin/components/FormLearningRoute';
import AssignGoal from '../feature-admin/components/AssignGoal';
import Contributions from '../feature-contributions/handlers/Contributions';
import CreateContributionPage from '../feature-contributions/handlers/CreateContributionPage';
import ImpactBenefitsPage from '../feature-contributions/components/ImpactBenefitsForm';
import ContributionEvidencePage from '../feature-contributions/components/ContributionEvidenceForm';
import ReviewPage from '../feature-contributions/components/ReviewForm';
import EvaluatorLogin from '../feature-contributions/components/EvaluatorLogin';
import EvaluationView from '../feature-contributions/components/EvaluationView';
import EvaluatorsFeedbackList from '../feature-contributions/components/EvaluatorsFeedbackList';
import EvaluatorFeedbackDetail from '../feature-contributions/components/EvaluatorFeedbackDetail';
import Notifications from '../feature-notifications/handlers/Notifications';
import Coach from '../feature-coach/handlers/Coach';
import withNavbar from '../core/handlers/withNavbar';

const Routes = () => {
  const routesForAuthUsers = [
    {
      path: '/',
      element: <ProtectedRoute />,
      children: [
        {
          path: '/onboarding',
          element: (
            <div className="min-h-screen flex flex-col">
              <Outlet />
            </div>
          ),
          children: [
            {
              path: '',
              element: <Onboarding />,
            },
          ],
        },
        {
          path: '/home',
          element: (
            <div className="min-h-screen flex flex-col">
              <Outlet />
            </div>
          ),
          children: [
            {
              path: '',
              element: <Dashboard />,
            },
          ],
        },
        {
          path: '/notificaciones',
          element: <Outlet />,
          children: [
            {
              path: '',
              element: <Notifications />,
            },
          ],
        },
        {
          path: '/coach',
          element: <Outlet />,
          children: [
            {
              path: '',
              element: <Coach />,
            },
          ],
        },
        {
          path: '/explorer',
          element: <Outlet />,
          children: [
            {
              path: '',
              element: <Browser />,
            },
            {
              path: ':id',
              element: <Details />,
            },
          ],
        },
        {
          path: '/diagnosticador',
          element: <Outlet />,
          children: [
            {
              path: '',
              element: <Navigator />,
            },
            {
              path: 'selector',
              element: <Selector />,
            },
            {
              path: 'questionare',
              element: <Questionare />,
            },
          ],
        },
        {
          path: '/profile',
          element: <Outlet />,
          children: [
            {
              path: '',
              element: <Profile />,
            },
            {
              path: 'change-password',
              element: <ChangePassword />,
            },
          ],
        },
        {
          path: 'content',
          element: <Outlet />,
          children: [
            {
              path: '',
              element: <Content />,
            },
            {
              path: 'new',
              element: <NewContent />,
            },
            {
              path: 'edit/:id',
              element: <NewContent />,
            },
          ],
        },
        {
          path: '/quiz',
          element: <Outlet />,
          children: [
            {
              path: ':id',
              element: <Quiz />,
            },
          ],
        },
        {
          path: 'history',
          element: <Outlet />,
          children: [
            {
              path: '',
              element: <Log />,
            },
          ],
        },
        {
          path: '/admin',
          element: (
            <div className="min-h-screen flex flex-col">
              <Outlet />
            </div>
          ),
          children: [
            {
              path: '',
              element: <Admin />,
            },
            {
              path: 'organization',
              element: <CreateOrganizationForm />,
            },
            {
              path: 'user',
              element: <CreateUserFlow />,
            },
            {
              path: 'goals',
              element: <FormGoal />,
            },
            {
              path: 'learning-routes',
              element: <FormLearningRoute />,
            },
            {
              path: 'assign-goal',
              element: <AssignGoal />,
            },
          ],
        },
        {
          path: '/contributor',
          element: (
            <div className="min-h-screen flex flex-col">
              <Outlet />
            </div>
          ),
          children: [
            {
              path: '',
              element: <Contributions />,
            },
            {
              path: 'create',
              element: <CreateContributionPage />,
            },
            {
              path: 'create/impact',
              element: <ImpactBenefitsPage />,
            },
            {
              path: 'create/evidence',
              element: <ContributionEvidencePage />,
            },
            {
              path: 'create/review',
              element: <ReviewPage />,
            },
            {
              path: 'feedback/:contributionId',
              element: withNavbar({ children: <EvaluatorsFeedbackList /> }),
            },
            {
              path: 'feedback/:contributionId/evaluator/:evaluatorId',
              element: withNavbar({ children: <EvaluatorFeedbackDetail /> }),
            },
          ],
        },
        {
          path: '/admin/goals/assign',
          element: <AssignGoal />
        },
        {
          path: '/evaluador/login',
          element: <EvaluatorLogin />,
        },
        {
          path: '/evaluador/evaluation/:token',
          element: <EvaluationView />,
        },
        {
          path: '/contributor/evaluations',
          element: <EvaluatorsFeedbackList evaluations={[]} showAll={true} />,
        },
        {
          path: '/contributor/evaluations/:evaluationId',
          element: <EvaluatorFeedbackDetail />,
        },
      ],
    },
  ];

  const router = createBrowserRouter([
    ...routesForAuthUsers,
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
    {
      path: '/evaluator/evaluation/:id',
      element: <EvaluationView />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;