import Routes from 'routes';

// project imports
import Locales from 'components/Locales';
import NavigationScroll from 'layout/NavigationScroll';
import ThemeCustomization from 'themes';

// third-party
import { ToastContainer } from 'react-toastify';

// providers
import { MetaProvider } from 'contexts/meta/meta';
import { CoinGeckoProvider } from 'contexts/CoinGecko';
import { DialectProvider } from 'contexts/DialectProvider';

// auth provider
import { AuthProvider } from 'contexts/AuthContext';
import { WalletContext, WalletHandlerProvider } from 'contexts/WalletContext';
import { LoaderProvider } from 'components/BoxLoader';
import { RecoilRoot } from 'recoil';
import { JupitarProvider } from 'contexts/JupitarContext';
import { JupiterApiProvider } from 'contexts/JupiterApiProvider';
import { TPSProvider } from 'contexts/TPSContext';
import Composer from 'contexts/Composer';
import { ConnectionsProvider } from 'contexts/ConnectionsContext';
import { BundleWalletProvider } from 'contexts/BundleWalletContext';
import { CartProvider } from 'contexts/CartContext';
import { StakedProvider } from 'contexts/StakedContext';
import { NotificationsProvider } from 'contexts/NotificationsContext';
import { MECollectionsProvider } from 'contexts/MECollectionsContext';
import EthWalletProvider from 'contexts/EthWalletProvider';

const contexts = [
    AuthProvider,
    WalletContext,
    EthWalletProvider,
    ConnectionsProvider,
    ThemeCustomization,
    Locales,
    MetaProvider,
    WalletHandlerProvider,
    NotificationsProvider,
    CoinGeckoProvider,
    JupiterApiProvider,
    JupitarProvider,
    NavigationScroll,
    LoaderProvider,
    RecoilRoot,
    TPSProvider,
    BundleWalletProvider,
    CartProvider,
    DialectProvider,
    StakedProvider,
    MECollectionsProvider
];

const App = () => (
    <Composer components={contexts}>
        <Routes />
        <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            draggable={false}
            pauseOnHover={false}
            theme="colored"
            limit={5}
        />
    </Composer>
);

export default App;
