import { Box } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { adminValidation } from 'actions/shared';
import PagedList from 'components/PagedList';
import { useMeta } from 'contexts/meta/meta';
import { chunk, get, map } from 'lodash';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RaffleCreateCard from './RaffleCreateCard';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import { queries } from '../../../graphql/graphql';

export default function CreateRaffle() {
    const PAGE_SIZE = 24;
    const wallet = useWallet();
    const navigate = useNavigate();
    const { startLoading, stopLoading } = useMeta();
    const [masterList, setMasterList] = useState<any>([]);
    const [nftList, setNftList] = useState<any>([]);
    const [isAdmin, setIsAdmin] = useState(false);

    const [getNFTsByOwner] = useAuthLazyQuery(queries.GET_NFTS_BY_WALLET, {
        skip: !wallet,
        variables: {
            wallet
        },
        fetchPolicy: 'network-only'
    });
    const getNFTs = async () => {
        if (wallet.publicKey === null) {
            return;
        }
        try {
            startLoading();
            const { data: walletData } = await getNFTsByOwner({
                variables: {
                    wallet: wallet.publicKey.toBase58()
                }
            });
            const chunked = chunk(
                map(walletData?.getWallet, ({ mint, metadata }: any) => ({ ...metadata, ...(metadata.json || {}), mint })),
                PAGE_SIZE
            );
            setMasterList(chunked);
            await getPage(1, chunked);
        } catch (error) {
            console.error(error);
        } finally {
            stopLoading();
        }
    };

    const getPage = async (page: number, array: Array<any> = masterList) => {
        try {
            startLoading();
            const pagedNftList = get(array || masterList, page - 1);
            setNftList(pagedNftList);
        } catch (error) {
            console.error(error);
        } finally {
            stopLoading();
        }
    };

    useEffect(() => {
        if (wallet.publicKey !== null) {
            const admin = adminValidation(wallet.publicKey);
            setIsAdmin(admin);
            if (admin) {
                getNFTs();
            } else {
                navigate('/raffles');
            }
        } else {
            setIsAdmin(false);
            setNftList([]);
        }
        // eslint-disable-next-line
    }, [wallet.connected]);
    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 80px)',
                p: 4,
                backgroundColor: 'background.default',
                color: 'text.primary'
            }}
        >
            <PagedList component={RaffleCreateCard} masterList={masterList} pageList={nftList} getPage={getPage} pageSize={PAGE_SIZE} />
        </Box>
    );
}
