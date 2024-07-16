import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import Sidebar from '../sidebar';
import KaminoImg from 'assets/images/workspace/kamino.png';
import PsyfinanceIcon from 'assets/images/workspace/psyfinance-icon.svg';
import SolendIcon from 'assets/images/workspace/solend-icon.png';
import OrcaIcon from 'assets/images/workspace/orca-icon.png';
import TulipIcon from 'assets/images/workspace/tulip-icon.png';
import MangoIcon from 'assets/images/workspace/mango-icon.png';

import { useLazyQuery } from '@apollo/client';
import { queries } from '../../../../graphql/graphql';

const AppsData = [
    {
        id: 'token-metadata',
        title: <FormattedMessage id="token-metadata" />,
        url: '/tools/token-metadata',
        icon: PsyfinanceIcon,
        description: 'Options protocol built on the Solana blockchain',
        coming: false
    },
    {
        id: 'nft-mints',
        title: <FormattedMessage id="nft-mints" />,
        url: '/tools/nft-mints',
        icon: SolendIcon,
        description: 'Autonomous interest rate machine for lending',
        coming: false
    },
    {
        id: 'holder-snapshot',
        title: <FormattedMessage id="holder-snapshot" />,
        url: '/tools/holder-snapshot',
        icon: OrcaIcon,
        description: 'User-friendly cryptocurrency exchange',
        coming: true
    },
    {
        id: 'mint-nft',
        title: <FormattedMessage id="mint-nft" />,
        url: '/tools/mint-nft',
        icon: TulipIcon,
        description: 'Yield aggregation with auto-compounding strategies',
        coming: true
    },
    {
        id: 'update-nft',
        title: <FormattedMessage id="update-nft" />,
        url: '/tools/update-nft',
        icon: MangoIcon,
        description: 'Lend, borrow, swap, and leverage-trade crypto assets',
        coming: true
    },
    {
        id: 'arweave-upload',
        title: <FormattedMessage id="arweave-upload" />,
        url: '/tools/arweave-upload',
        icon: MangoIcon,
        description: 'Lend, borrow, swap, and leverage-trade crypto assets',
        coming: true
    },
    {
        id: 'update-token',
        title: <FormattedMessage id="update-token" />,
        url: '/tools/update-token',
        icon: MangoIcon,
        description: 'Lend, borrow, swap, and leverage-trade crypto assets',
        coming: true
    }
];

const Apps = () => {
    const [workspace, setWorkspace] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const [getWorkspaceById] = useLazyQuery(queries.GET_WORKSPACE_BY_ID);

    const fetchWorkspace = async () => {
        console.log('WORKSPACE_ID: ', id);
        try {
            setLoading(true);
            console.log('WORKSPACE_FETCHING...');
            const { data } = await getWorkspaceById({ variables: { id } });
            console.log('WORKSPACE: ', data.getWorkspaceById);
            setWorkspace(data.getWorkspaceById);
        } catch (err) {
            console.error(err);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspace();
    }, []);

    return (
        <div className="vault-container flex">
            <div className="hidden lg:block">
                <Sidebar workspace={workspace} loading={loading} />
            </div>

            <div className="w-full">
                <div className="mb-6">
                    <h2 className="primary-title ml-2">Apps</h2>
                    <p className="detail-text text-muted mt-3 ml-2">
                        Interact with your favorite dapps and protocols directly from your Squads multisig.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-2 lg:gap-6">
                    <Link to="/tools/token-creation" className="app-box w-full md:w-1/3 p-2">
                        <img src={KaminoImg} alt="kamino" />
                        <div className="mx-4 my-5">
                            <h3 className="secondary-title">
                                <FormattedMessage id="token-creation" />
                            </h3>
                            <p className="detail-text text-muted mt-2">Automated position management for concentrated liquidity DEXs</p>
                        </div>
                        <p className="coming">Comming Soon</p>
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-6 w-100 md:w-2/3">
                        {AppsData.map((el, idx) => (
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
};

export default Apps;
