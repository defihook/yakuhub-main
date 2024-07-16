import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowUpward, ArrowDownward, AccountBalance, ContentCopy } from '@mui/icons-material';
import Sidebar from '../sidebar';
import Assets from './assets';
import Nft from './nft';
import Staking from './staking';

import { useLazyQuery } from '@apollo/client';
import { queries } from '../../../../graphql/graphql';

const Tabs = [
    {
        name: 'assets',
        title: 'Assets'
    },
    {
        name: 'nft',
        title: 'NFT'
    },
    {
        name: 'staking',
        title: 'Staking'
    }
];

const Vault = () => {
    const [workspace, setWorkspace] = useState<any>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [tab, setTab] = useState<string>('assets');
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
                <div className="flex justify-between items-center mt-2">
                    <h2 className="primary-title ml-2 mr-auto">Vault</h2>
                    {tab === 'nft' && (
                        <div className="vault-header">
                            <Button variant="contained" className="dark-btn mr-2 lg:mr-3">
                                Buy
                            </Button>
                            <Button variant="contained" className="dark-btn mr-2 lg:mr-3">
                                <span className="text-muted">
                                    <ArrowUpward sx={{ fontSize: 18 }} />
                                    <span className="ml-1 hidden lg:inline">Send</span>
                                </span>
                            </Button>
                            <Button variant="contained" className="blue-btn mr-2 lg:mr-3">
                                <ArrowDownward sx={{ fontSize: 18 }} />
                                <span className="ml-1 hidden lg:inline">Deposit</span>
                            </Button>
                            <Button variant="contained" className="dark-btn">
                                <AccountBalance sx={{ fontSize: 16 }} />
                                <span className="mx-2">
                                    CshY...<span className="hidden lg:inline">3VrP</span>
                                </span>
                                <ContentCopy sx={{ fontSize: 16 }} />
                            </Button>
                        </div>
                    )}
                </div>
                <ul className="tabs list-unstyled flex mt-4 mb-6">
                    {Tabs.map((el, idx) => (
                        <li key={idx} className={tab === el.name ? 'active' : ''}>
                            <button type="button" className="bg-transparent" onClick={() => setTab(el.name)}>
                                <h3 className="secondary-title">{el.title}</h3>
                            </button>
                        </li>
                    ))}
                </ul>

                {tab === 'assets' && <Assets workspace={workspace} loading={loading} />}
                {tab === 'nft' && <Nft />}
                {tab === 'staking' && <Staking />}
            </div>
        </div>
    );
};

export default Vault;
