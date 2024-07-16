import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'components/Loadable';
import YakuGuard from 'utils/route-guard/YakuGuard';
import SolanaGuard from 'utils/route-guard/SolanaGuard';

// Yaku applications
const YakuStaking = Loadable(lazy(() => import('views/yaku/staking/Staking')));
const YakuSniper = Loadable(lazy(() => import('views/yaku/sniping/SniperHome')));

const YakuRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        // Yaku Holder Section
        {
            path: '/applications/staking',
            element: (
                <YakuGuard>
                    <YakuStaking />
                </YakuGuard>
            )
        },
        {
            path: '/applications/sniper',
            element: (
                <SolanaGuard>
                    <YakuSniper />
                </SolanaGuard>
            )
        }
    ]
};

export default YakuRoutes;
