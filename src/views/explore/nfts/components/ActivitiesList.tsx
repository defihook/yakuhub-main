import { Avatar, Box, Chip, List, ListItem, Tooltip, Typography } from '@mui/material';
import { map, round } from 'lodash';
import moment from 'moment';
import { IMAGE_PROXY, MARKETPLACE_PROGRAM_ID, RARITY_COLORS } from 'config/config';
import SolscanLogo from 'assets/images/icons/solscan.png';
import ETHscanLogo from 'assets/images/icons/eth.png';
import { StarRateRounded } from '@mui/icons-material';
import { getMarketplaceIcon, getRarity, rarityDiv, shortenAddress } from 'utils/utils';
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
const ActivitiesList = ({ listData, supply, chain }: any) => {
    const navigate = useNavigate();
    const explorerURL = (txHash: string) => (chain === 'SOL' ? `https://solscan.io/tx/${txHash}` : `https://etherscan.io/tx/${txHash}`);
    return (
        <List>
            <ListItem sx={{ gap: 1, justifyContent: 'space-between' }}>
                <Box sx={{ width: 40 }} />
                <Typography component="p" sx={{ width: '18%' }} fontWeight={700} noWrap>
                    Name
                </Typography>
                <Typography component="p" sx={{ width: '12%', textAlign: 'end' }} fontWeight={700} noWrap>
                    Price
                </Typography>
                <Typography component="p" sx={{ textAlign: 'center', width: '10%' }} fontWeight={700}>
                    Rank
                </Typography>

                <Typography component="p" sx={{ width: '14%', textAlign: 'start' }} fontWeight={700} noWrap>
                    Owner
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
            {map(listData, ({ meta_data_img, name, owner, rank_est, token_address, market_place_state }) => (
                <ListItem
                    sx={{
                        gap: 1,
                        justifyContent: 'space-between',
                        '&:hover': {
                            backgroundColor: '#d329ff15'
                        }
                    }}
                >
                    <Avatar src={`${IMAGE_PROXY}${meta_data_img}`} />
                    <Typography component="p" sx={{ width: '18%' }} noWrap>
                        {name}
                    </Typography>
                    <Typography component="p" sx={{ width: '12%', textAlign: 'end' }} noWrap>
                        {round(Number(market_place_state?.price), 3).toLocaleString()} ◎
                    </Typography>
                    <Typography component="p" sx={{ textAlign: 'center', width: '10%' }}>
                        {rank_est >= 0 && (
                            <Chip
                                icon={<StarRateRounded />}
                                label={rank_est}
                                size="small"
                                sx={{
                                    background: `${RARITY_COLORS[getRarity(rarityDiv(supply), rank_est) || '']}88`,
                                    color: '#fff',
                                    alignItems: 'center',
                                    lineHeight: 18,
                                    '.MuiSvgIcon-root': {
                                        height: '0.8rem',
                                        width: '0.8rem',
                                        fill: 'yellow',
                                        marginTop: '-3px'
                                    }
                                }}
                            />
                        )}
                    </Typography>

                    <Typography
                        component="p"
                        sx={{ width: '14%', textAlign: 'start', cursor: 'pointer' }}
                        noWrap
                        onClick={() =>
                            (market_place_state?.seller_address || market_place_state?.buyer_address) &&
                            navigate(`/account/${market_place_state?.seller_address || market_place_state?.buyer_address}`, {
                                replace: true
                            })
                        }
                    >
                        {shortenAddress(market_place_state?.seller_address || market_place_state?.buyer_address || '')}
                    </Typography>

                    <Tooltip
                        title={
                            chain === 'SOL'
                                ? MARKETPLACE_PROGRAM_ID[market_place_state.marketplace_program_id]
                                : market_place_state.marketplace_program_id
                        }
                    >
                        <Avatar
                            src={
                                chain === 'SOL'
                                    ? getMarketplaceIcon(market_place_state.marketplace_program_id)
                                    : market_place_state.marketplace_instance_id
                            }
                            sx={{ width: 20, height: 20, border: 'none', backgroundColor: 'transparent' }}
                        />
                    </Tooltip>
                    <Typography component="p" sx={{ width: '14%' }}>
                        {moment.unix(market_place_state.block_timestamp).fromNow()}
                    </Typography>
                    <Typography component="a" href={explorerURL(market_place_state.signature)} target="_blank">
                        <Avatar
                            src={chain === 'SOL' ? SolscanLogo : ETHscanLogo}
                            sx={{ width: 20, height: 20, border: 'none', backgroundColor: 'transparent' }}
                        />
                    </Typography>
                    <Typography component="p" sx={{ minWidth: '18%' }}>
                        {getStatusLabel(market_place_state.type)}
                    </Typography>
                </ListItem>
            ))}
        </List>
    );
};
export default ActivitiesList;
