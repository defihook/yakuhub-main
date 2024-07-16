import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

// Error Shit
const SolanaIssue = Loadable(lazy(() => import('views/pages/maintenance/SolanaIssue')));
const MaintenanceError = Loadable(lazy(() => import('views/pages/maintenance/Error')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('views/pages/maintenance/UnderConstruction')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        // Errors
        {
            path: '*',
            element: <MaintenanceError />
        },
        {
            path: '/solana',
            element: <SolanaIssue />
        },
        {
            path: '/under-construction',
            element: <MaintenanceUnderConstruction />
        }
    ]
};

export default AuthenticationRoutes;
