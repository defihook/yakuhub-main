import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import ProfileBox from './profile-box';
import SkillBox from './skill-box';
import CommunityBox from './community-box';
import ActivityBox from './activity-box';
import './overview.scss';

import useAuth from 'hooks/useAuth';
import { map } from 'lodash';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import { queries } from '../../graphql/graphql';
import useStaked from 'hooks/useStaked';

const Overview = () => {
    const auth = useAuth();
    const mainWallet = useWallet();
    const { wallet = mainWallet.publicKey?.toBase58() } = useParams();

    const { getStakedList, stakedYakuNfts: hookedYakuNfts } = useStaked();
    const [nfts, setNfts] = useState<{ staked: any[]; nftsList: any[] }>({ staked: [], nftsList: [] });
    const [getNFTsByOwner] = useAuthLazyQuery(queries.GET_NFTS_BY_WALLET, {
        skip: !wallet,
        variables: {
            wallet
        },
        fetchPolicy: 'network-only'
    });

    const fetchNFTs = async () => {
        if (!wallet) {
            return;
        }
        const { data: nftData } = await getNFTsByOwner({
            variables: {
                wallet
            }
        });

        const nftsList = map(nftData?.getWallet ?? [], ({ mint, metadata }) => ({ ...metadata, ...(metadata.json || {}), mint }));

        if (mainWallet.publicKey?.toBase58() !== wallet) {
            const staked = await getStakedList(false, wallet);
            setNfts({
                staked,
                nftsList
            });
        } else {
            setNfts({ staked: hookedYakuNfts, nftsList });
        }
    };

    useEffect(() => {
        if (auth.token && wallet) {
            fetchNFTs();
        }
    }, [wallet, mainWallet.publicKey, auth.token]);

    return (
        <main className="overview-container pt-8">
            <div className="container mx-auto flex flex-col justify-between gap-3 xl:flex-row">
                <aside className="mx-auto">
                    <ProfileBox wallet={wallet} />
                    <SkillBox stakedYakuNfts={nfts?.staked} />
                    <CommunityBox />
                </aside>
                <section className="flex-grow" />
                <aside className="mx-auto">
                    <ActivityBox wallet={wallet} />
                </aside>
            </div>
        </main>
    );
};

export default Overview;
