/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Avatar, Box, LinearProgress, List, ListItem, Tooltip, Typography } from '@mui/material';
import { get, map, round } from 'lodash';
import moment from 'moment';
import { IMAGE_PROXY } from 'config/config';
import SolscanLogo from 'assets/images/icons/solscan.png';
import { getMarketplaceIcon, shortenAddress } from 'utils/utils';
import { queries } from '../../../graphql/graphql';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import { useEffect, useState } from 'react';
import { Promise } from 'bluebird';
import useAuthQuery from 'hooks/useAuthQuery';

const getStatusLabel = (type: string) => {
    switch (type) {
        case 'bid':
            return 'Placed Bid';
        case 'list':
            return 'Listed';
        case 'buyNow':
            return 'Bought';
        case 'cancelBid':
            return 'Cancelled Bid';
        case 'delist':
            return 'Delisted';
        default:
            return 'Unknown';
    }
};

const MEActivitiesList = ({ wallet, tabIdx }: any) => {
    const { data: walletActivities, refetch: refetchWalletActs } = useAuthQuery(queries.GET_WALLET_ACTIVITIES, {
        variables: {
            wallet,
            offset: 0,
            limit: 10
        }
    });
    const [getToken] = useAuthLazyQuery(queries.GET_TOKEN_BY_MINT);
    const [list, setList] = useState<any[]>([]);
    const [walletActs, setWalletActs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const getTokensData = async (walletHist: any[]) => {
        try {
            const digestedList = await Promise.mapSeries(walletHist, async (item: any) => ({
                ...item,
                ...get(
                    await getToken({
                        variables: {
                            mint: item.tokenMint
                        }
                    }),
                    'data.getTokenByMint',
                    {}
                )
            }));
            setList(digestedList);
        } catch (error) {
            console.error(error);
        }
    };

    const updateView = async () => {
        setIsLoading(true);
        setWalletActs([]);
        const { data } = await refetchWalletActs();
        setWalletActs(data?.getWalletActivities);
        if (data && data?.getWalletActivities) {
            await getTokensData(data?.getWalletActivities);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        updateView();
    }, [wallet, tabIdx]);

    return (
        <List>
            <ListItem
                sx={{
                    gap: 1,
                    justifyContent: 'space-between'
                }}
            >
                <Box sx={{ width: 40 }} />
                <Typography component="p" sx={{ width: '18%' }} fontWeight={700} noWrap>
                    Name
                </Typography>
                <Typography component="p" sx={{ width: '12%', textAlign: 'end' }} fontWeight={700} noWrap>
                    Price
                </Typography>
                <Typography component="p" sx={{ width: '14%', textAlign: 'start' }} fontWeight={700} noWrap>
                    Buyer
                </Typography>
                <Typography component="p" sx={{ width: '14%', textAlign: 'start' }} fontWeight={700} noWrap>
                    Seller
                </Typography>
                <Box sx={{ width: 20 }} />
                <Typography component="p" sx={{ width: '14%' }} fontWeight={700}>
                    Time
                </Typography>
                <Box sx={{ width: 20 }} />
                <Typography component="p" sx={{ minWidth: '18%' }} fontWeight={700}>
                    Status
                </Typography>
            </ListItem>
            {!isLoading ? (
                map(list, ({ signature, type, source, tokenMint, collection, image, name, slot, blockTime, buyer, seller, price }) => (
                    <ListItem
                        sx={{
                            gap: 1,
                            justifyContent: 'space-between',
                            '&:hover': {
                                backgroundColor: '#d329ff15'
                            }
                        }}
                    >
                        <Avatar src={`${IMAGE_PROXY}${image}`} />
                        <Typography component="p" sx={{ width: '18%' }} noWrap>
                            {name}
                        </Typography>
                        <Typography component="p" sx={{ width: '12%', textAlign: 'end' }} noWrap>
                            {round(Number(price), 3).toLocaleString()} ◎
                        </Typography>

                        <Typography component="p" sx={{ width: '14%', textAlign: 'start' }} noWrap>
                            {shortenAddress(buyer || '')}
                        </Typography>
                        <Typography component="p" sx={{ width: '14%', textAlign: 'start' }} noWrap>
                            {shortenAddress(seller || '')}
                        </Typography>

                        <Tooltip title={source}>
                            <Avatar
                                src={getMarketplaceIcon(source)}
                                sx={{ width: 20, height: 20, border: 'none', backgroundColor: 'transparent' }}
                            />
                        </Tooltip>
                        <Typography component="p" sx={{ width: '14%' }}>
                            {moment.unix(blockTime).fromNow()}
                        </Typography>
                        <Typography component="a" href={`https://solscan.io/tx/${signature}`} target="_blank">
                            <Avatar src={SolscanLogo} sx={{ width: 20, height: 20, border: 'none', backgroundColor: 'transparent' }} />
                        </Typography>
                        <Typography component="p" sx={{ minWidth: '18%' }}>
                            {getStatusLabel(type)}
                        </Typography>
                    </ListItem>
                ))
            ) : (
                <LinearProgress color="secondary" />
            )}
        </List>
    );
};
export default MEActivitiesList;
