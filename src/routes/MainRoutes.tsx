import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'components/Loadable';
import SolanaGuard from 'utils/route-guard/SolanaGuard';
import StakingConfigPage from 'views/workspace/config/staking';
import RaffleConfigPage from 'views/workspace/config/raffle';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard')));
const Profile = Loadable(lazy(() => import('views/profile')));
const Portfolio = Loadable(lazy(() => import('views/profile/components/Portfolio')));
const Overview = Loadable(lazy(() => import('views/overview')));

// explore
const NFTsHome = Loadable(lazy(() => import('views/explore/nfts/NFTsHome')));
const NFTCollectionPage = Loadable(lazy(() => import('views/explore/nfts/NFTCollectionPage')));
const NFTDetailView = Loadable(lazy(() => import('views/explore/nfts/NFTDetailView')));
const NFTDetailViewETH = Loadable(lazy(() => import('views/explore/nfts/NFTDetailViewETH')));

const TokensHome = Loadable(lazy(() => import('views/explore/tokens/TokensHome')));
const TokenDetailView = Loadable(lazy(() => import('views/explore/tokens/TokenDetailView')));

const DefiHome = Loadable(lazy(() => import('views/explore/defi/DefiHome')));
const DefiTokenDetails = Loadable(lazy(() => import('views/explore/defi/DefiTokenDetails')));
const WalletsHome = Loadable(lazy(() => import('views/explore/wallets/WalletsHome')));

// applications
const Appstore = Loadable(lazy(() => import('views/application/index')));
const MintCalendar = Loadable(lazy(() => import('views/application/mint-calendar/index')));
const JupiterForm = Loadable(lazy(() => import('views/application/jup-swap/JupiterForm')));

// spaces
const Spaces = Loadable(lazy(() => import('views/spaces/index')));
const SpacePage = Loadable(lazy(() => import('views/spaces/SpacePage')));
const ProposalPage = Loadable(lazy(() => import('views/spaces/ProposalPage')));

// workspace
const WorkSpaces = Loadable(lazy(() => import('views/workspace/index')));
const CreateWorkSpace = Loadable(lazy(() => import('views/workspace/create')));
const Users = Loadable(lazy(() => import('views/workspace/dashboard/users')));
const Vault = Loadable(lazy(() => import('views/workspace/dashboard/vault')));
const Apps = Loadable(lazy(() => import('views/workspace/dashboard/apps')));
const StaffAdmin = Loadable(lazy(() => import('views/workspace/dashboard/staff-management/admin/Admin')));
const StaffEmployee = Loadable(lazy(() => import('views/workspace/dashboard/staff-management/employee/Employee')));

// raffles
const Raffles = Loadable(lazy(() => import('views/application/raffles/index')));
const CreateRaffle = Loadable(lazy(() => import('views/application/raffles/CreateRaffle')));
const RaffleCreate = Loadable(lazy(() => import('views/application/raffles/RaffleCreate')));
const RafflePage = Loadable(lazy(() => import('views/application/raffles/RafflePage')));

// tools
const NFTTools = Loadable(lazy(() => import('views/tools/index')));
const BurnNfts = Loadable(lazy(() => import('views/tools/BurnNfts')));
const SendNfts = Loadable(lazy(() => import('views/tools/SendNfts')));
const BundledView = Loadable(lazy(() => import('views/profile/BundledView')));

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        // General
        {
            path: '/home',
            element: <DashboardDefault />
        },

        // Explore
        {
            path: '/explore/collection/:chain',
            element: <NFTsHome />
        },
        {
            path: '/explore/collection/:chain/:projectId',
            element: (
                <SolanaGuard>
                    <NFTCollectionPage />
                </SolanaGuard>
            )
        },
        {
            path: '/explore/collection/SOL/:projectId/:mint',
            element: (
                <SolanaGuard>
                    <NFTDetailView />
                </SolanaGuard>
            )
        },
        {
            path: '/explore/collection/ETH/:projectId/:mint',
            element: <NFTDetailViewETH />
        },
        {
            path: '/explore/token',
            element: <TokensHome />
        },
        {
            path: '/explore/token/:tokenId',
            element: <TokenDetailView />
        },
        {
            path: '/explore/defi',
            element: <DefiHome />
        },
        {
            path: '/explore/defi/:tokenId',
            element: <DefiTokenDetails />
        },
        {
            path: '/explore/wallets',
            element: <WalletsHome />
        },
        // Applications
        {
            path: '/applications',
            element: <Appstore />
        },
        {
            path: '/applications/calendar',
            element: (
                <SolanaGuard>
                    <MintCalendar />
                </SolanaGuard>
            )
        },
        {
            path: '/applications/swap',
            element: (
                <SolanaGuard>
                    <JupiterForm />
                </SolanaGuard>
            )
        },
        {
            path: '/applications/burn-nfts',
            element: (
                <SolanaGuard>
                    <BurnNfts />
                </SolanaGuard>
            )
        },
        {
            path: '/applications/send-nfts',
            element: (
                <SolanaGuard>
                    <SendNfts />
                </SolanaGuard>
            )
        },

        // Spaces
        {
            path: '/spaces',
            element: <Spaces />
        },
        {
            path: '/spaces/:symbol',
            element: <SpacePage />
        },
        {
            path: '/spaces/:symbol/proposal/:id',
            element: <ProposalPage />
        },

        // Workspaces
        {
            path: '/workspaces',
            element: (
                <SolanaGuard>
                    <WorkSpaces />
                </SolanaGuard>
            )
        },
        {
            path: '/workspaces/create',
            element: (
                <SolanaGuard>
                    <CreateWorkSpace />
                </SolanaGuard>
            )
        },
        {
            path: '/workspaces/users/:id',
            element: (
                <SolanaGuard>
                    <Users />
                </SolanaGuard>
            )
        },
        {
            path: '/workspaces/vault/:id',
            element: (
                <SolanaGuard>
                    <Vault />
                </SolanaGuard>
            )
        },
        {
            path: '/workspaces/apps/:id',
            element: (
                <SolanaGuard>
                    <Apps />
                </SolanaGuard>
            )
        },
        {
            path: '/workspaces/staff-management/admin/:id',
            element: (
                <SolanaGuard>
                    <StaffAdmin />
                </SolanaGuard>
            )
        },
        {
            path: '/workspaces/staff-management/employee',
            element: (
                <SolanaGuard>
                    <StaffEmployee />
                </SolanaGuard>
            )
        },

        // Tools
        {
            path: '/tools',
            element: (
                <SolanaGuard>
                    <NFTTools />
                </SolanaGuard>
            )
        },
        {
            path: '/tools/:tab',
            element: (
                <SolanaGuard>
                    <NFTTools />
                </SolanaGuard>
            )
        },

        // Raffles
        {
            path: '/applications/raffles',
            element: (
                <SolanaGuard>
                    <Raffles />
                </SolanaGuard>
            )
        },
        {
            path: '/applications/raffles/create',
            element: (
                <SolanaGuard>
                    <CreateRaffle />
                </SolanaGuard>
            )
        },
        {
            path: '/applications/raffles/new/:mint',
            element: (
                <SolanaGuard>
                    <RaffleCreate />
                </SolanaGuard>
            )
        },
        {
            path: '/applications/raffles/:raffleKey',
            element: (
                <SolanaGuard>
                    <RafflePage />
                </SolanaGuard>
            )
        },
        {
            path: '/bundle',
            element: (
                <SolanaGuard>
                    <BundledView />
                </SolanaGuard>
            )
        },
        {
            path: '/account',
            element: <Profile />
        },
        {
            path: '/overview',
            element: (
                <SolanaGuard>
                    <Overview />
                </SolanaGuard>
            )
        },
        {
            path: '/account/:wallet',
            element: <Profile />,
            children: [{ path: 'portfolio', element: <Portfolio /> }]
        },
        {
            path: '/workspace/config/staking',
            element: <StakingConfigPage />
        },
        {
            path: '/workspace/config/raffle',
            element: <RaffleConfigPage />
        }
    ]
};

export default MainRoutes;
