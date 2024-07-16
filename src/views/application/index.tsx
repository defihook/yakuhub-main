import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import KaminoImg from 'assets/images/workspace/kamino.png';
import PsyfinanceIcon from 'assets/images/workspace/psyfinance-icon.svg';
import SolendIcon from 'assets/images/workspace/solend-icon.png';
import OrcaIcon from 'assets/images/workspace/orca-icon.png';
import TulipIcon from 'assets/images/workspace/tulip-icon.png';
import MangoIcon from 'assets/images/workspace/mango-icon.png';

const AppstoreData = [
    {
        id: 'sniper',
        title: <FormattedMessage id="sniper" />,
        url: '/applications/sniper',
        icon: PsyfinanceIcon,
        description: 'Options protocol built on the Solana blockchain',
        coming: false
    },
    {
        id: 'mint-calendar',
        title: <FormattedMessage id="mint-calendar" />,
        url: '/applications/calendar',
        icon: SolendIcon,
        description: 'Autonomous interest rate machine for lending',
        coming: false
    },
    {
        id: 'raffles',
        title: <FormattedMessage id="raffles" />,
        url: '/applications/raffles',
        icon: OrcaIcon,
        description: 'User-friendly cryptocurrency exchange',
        coming: true
    },
    {
        id: 'staking',
        title: <FormattedMessage id="staking" />,
        url: '/applications/staking',
        icon: TulipIcon,
        description: 'Yield aggregation with auto-compounding strategies',
        coming: true
    },
    {
        id: 'send-nfts',
        title: <FormattedMessage id="send-nfts" />,
        url: '/applications/send-nfts',
        icon: MangoIcon,
        description: 'Lend, borrow, swap, and leverage-trade crypto assets',
        coming: true
    },
    {
        id: 'burn-nfts',
        title: <FormattedMessage id="burn-nfts" />,
        url: '/applications/burn-nfts',
        icon: MangoIcon,
        description: 'Lend, borrow, swap, and leverage-trade crypto assets',
        coming: true
    }
];

const Appstore = () => (
    <div className="vault-container flex">
        <div className="w-full">
            <div className="mb-6">
                <h2 className="primary-title ml-2">App Store</h2>
                <p className="detail-text text-muted mt-3 ml-2">
                    Interact with your favorite dapps and protocols directly from your Squads multisig.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-2 lg:gap-6">
                <Link to="/applications/swap" className="app-box w-full md:w-1/3 p-2">
                    <img src={KaminoImg} alt="kamino" />
                    <div className="mx-4 my-5">
                        <h3 className="secondary-title">
                            <FormattedMessage id="swap" />
                        </h3>
                        <p className="detail-text text-muted mt-2">Automated position management for concentrated liquidity DEXs</p>
                    </div>
                    <p className="coming">Comming Soon</p>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-6 w-100 md:w-2/3">
                    {AppstoreData.map((el, idx) => (
                        <Link key={idx} to={el.url} className="app-box flex">
                            <div className="flex-shrink-0">
                                <img src={el.icon} width={36} height={36} alt={el.url} />
                            </div>
                            <div className="ml-2">
                                <h3 className="secondary-title">{el.title}</h3>
                                <p className="detail-text text-muted">{el.description}</p>
                            </div>
                            {el.coming && <p className="coming">Comming Soon</p>}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default Appstore;
