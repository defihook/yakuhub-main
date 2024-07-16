import { Avatar, Box, List, ListItem, Tooltip, Typography } from '@mui/material';
import { map, round } from 'lodash';
import moment from 'moment';
import { MARKETPLACE_PROGRAM_ID } from 'config/config';
import SolscanLogo from 'assets/images/icons/solscan.png';
import ETHscanLogo from 'assets/images/icons/eth.png';
import { getMarketplaceIcon, shortenAddress } from 'utils/utils';
import { useNavigate } from 'react-router-dom';

const getStatusLabel = (type: string) => {
    switch (type) {
        case 'BID':
            return 'Placed Bid';
        case 'LISTING':
            return 'Listed';
        case 'TRANSACTION':
            return 'Sold';
        case 'CANCELBID':
            return 'Cancelled Bid';
        case 'DELISTING':
            return 'Delisted';
        // eth nft case - reservoir api
        case 'bid':
            return 'Placed Bid';
        case 'ask':
            return 'Placed Offer';
        case 'transfer':
            return 'Transfer';
        case 'sale':
            return 'Sold';
        case 'mint':
            return 'Mint';
        case 'bid_cancel':
            return 'Cancelled Bid';
        case 'ask_cancel':
            return 'Cancelled Offer';
        default:
            return 'Unknown';
    }
};
const TokenActivitiesList = ({ listData, supply, chain }: any) => {
    const navigate = useNavigate();
    return (
        <List>
            <ListItem sx={{ gap: 1, justifyContent: 'space-between' }}>
                <Typography component="p" sx={{ minWidth: '18%' }} fontWeight={700}>
                    Type
                </Typography>
                <Typography component="p" sx={{ width: '12%', textAlign: 'end' }} fontWeight={700} noWrap>
                    Price
                </Typography>

                <Typography component="p" sx={{ width: '14%', textAlign: 'start' }} fontWeight={700} noWrap>
                    Seller
                </Typography>
                <Typography component="p" sx={{ width: '14%', textAlign: 'start' }} fontWeight={700} noWrap>
                    Buyer
                </Typography>

                <Box sx={{ width: 20, height: 20 }} />
                <Typography component="p" sx={{ width: '14%' }} fontWeight={700}>
                    Time
                </Typography>
                <Typography component="p" sx={{ width: '14%' }} fontWeight={700}>
                    Transaction
                </Typography>
            </ListItem>
            <Box sx={{ maxHeight: 800, overflowY: 'auto' }}>
                {map(
                    listData,
                    ({
                        amount,
                        block_timestamp,
                        buyer_address,
                        buyer_referral_address,
                        buyer_referral_fee,
                        escrow_address,
                        fee,
                        marketplace_instance_id,
                        marketplace_program_id,
                        marketplace_icon,
                        metadata,
                        price,
                        seller_address,
                        seller_referral_address,
                        seller_referral_fee,
                        signature,
                        type
                    }) => (
                        <ListItem sx={{ gap: 1, justifyContent: 'space-between' }}>
                            <Typography component="p" sx={{ minWidth: '18%' }}>
                                {getStatusLabel(type)}
                            </Typography>
                            <Typography component="p" sx={{ width: '12%', textAlign: 'end' }} noWrap>
                                {round(Number(price), 3).toLocaleString()} ◎
                            </Typography>

                            <Typography
                                component="p"
                                sx={{ width: '14%', textAlign: 'start', cursor: 'pointer' }}
                                noWrap
                                onClick={() =>
                                    seller_address &&
                                    navigate(`/account/${seller_address}`, {
                                        replace: true
                                    })
                                }
                            >
                                {shortenAddress(seller_address || '')}
                            </Typography>
                            <Typography
                                component="p"
                                sx={{ width: '14%', textAlign: 'start', cursor: 'pointer' }}
                                noWrap
                                onClick={() =>
                                    buyer_address &&
                                    navigate(`/account/${buyer_address}`, {
                                        replace: true
                                    })
                                }
                            >
                                {shortenAddress(buyer_address || '')}
                            </Typography>

                            {chain === 'SOL' && (
                                <Tooltip title={MARKETPLACE_PROGRAM_ID[marketplace_program_id]}>
                                    <Avatar
                                        src={getMarketplaceIcon(marketplace_program_id)}
                                        sx={{ width: 20, height: 20, border: 'none', backgroundColor: 'transparent' }}
                                    />
                                </Tooltip>
                            )}
                            {chain === 'ETH' && marketplace_icon ? (
                                <Tooltip title={marketplace_program_id}>
                                    <Avatar
                                        src={marketplace_icon}
                                        sx={{ width: 20, height: 20, border: 'none', backgroundColor: 'transparent' }}
                                    />
                                </Tooltip>
                            ) : (
                                <></>
                            )}
                            <Typography component="p" sx={{ width: '14%' }}>
                                {moment.unix(block_timestamp).fromNow()}
                            </Typography>
                            {chain === 'SOL' && (
                                <Typography component="a" href={`https://solscan.io/tx/${signature}`} target="_blank" sx={{ width: '14%' }}>
                                    <Avatar
                                        src={SolscanLogo}
                                        sx={{ width: 20, height: 20, border: 'none', backgroundColor: 'transparent' }}
                                    />
                                </Typography>
                            )}
                            {chain === 'ETH' && signature ? (
                                <Typography
                                    component="a"
                                    href={`https://etherscan.io/tx/${signature}`}
                                    target="_blank"
                                    sx={{ width: '14%' }}
                                >
                                    <Avatar
                                        src={ETHscanLogo}
                                        sx={{ width: 20, height: 20, border: 'none', backgroundColor: 'transparent' }}
                                    />
                                </Typography>
                            ) : (
                                <Typography component="a" target="_blank" sx={{ width: '14%' }}>
                                    None tx
                                </Typography>
                            )}
                        </ListItem>
                    )
                )}
            </Box>
        </List>
    );
};
export default TokenActivitiesList;
