/* eslint-disable no-extra-boolean-cast */
import { Avatar, Box, List, ListItem, Tooltip, Typography } from '@mui/material';
import { map, round } from 'lodash';
import moment from 'moment';
import { getMarketplaceIcon, shortenAddress } from 'utils/utils';
import { useNavigate } from 'react-router-dom';

const TokenBidsList = ({ listData, chain }: any) => {
    const navigate = useNavigate();
    return (
        <List>
            <ListItem sx={{ gap: 1, justifyContent: 'space-between' }}>
                <Typography component="p" sx={{ width: '12%', textAlign: 'start' }} fontWeight={700} noWrap>
                    Bid Price
                </Typography>
                <Typography component="p" sx={{ width: '14%', textAlign: 'start' }} fontWeight={700} noWrap>
                    Buyer
                </Typography>

                <Box sx={{ width: 20, height: 20 }} />
                <Typography component="p" sx={{ width: '14%' }} fontWeight={700}>
                    Expires At
                </Typography>
            </ListItem>
            <Box sx={{ maxHeight: 800, overflowY: 'auto' }}>
                {map(
                    listData,
                    ({ auctionHouse, buyer, expiry, pdaAddress, price, tokenMint, tokenSize, marketplace_name, marketplace_icon }) => (
                        <ListItem sx={{ gap: 1, justifyContent: 'space-between' }}>
                            <Typography component="p" sx={{ width: '12%', textAlign: 'start' }} noWrap>
                                {round(Number(price), 3).toLocaleString()} ◎
                            </Typography>

                            <Typography
                                component="p"
                                sx={{ width: '14%', textAlign: 'start', cursor: 'pointer' }}
                                noWrap
                                onClick={() =>
                                    buyer &&
                                    navigate(`/account/${buyer}`, {
                                        replace: true
                                    })
                                }
                            >
                                {shortenAddress(buyer || '')}
                            </Typography>

                            {chain === 'SOL' ? (
                                <Tooltip title="Magic Eden">
                                    <Avatar
                                        src={getMarketplaceIcon('M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K')}
                                        sx={{ width: 20, height: 20, border: 'none', backgroundColor: 'transparent' }}
                                    />
                                </Tooltip>
                            ) : (
                                <Tooltip title={marketplace_name}>
                                    <Avatar
                                        src={marketplace_icon}
                                        sx={{ width: 20, height: 20, border: 'none', backgroundColor: 'transparent' }}
                                    />
                                </Tooltip>
                            )}
                            <Typography component="p" sx={{ width: '14%' }}>
                                {!!expiry ? moment.unix(expiry).format('YYYY/MM/DD HH:mm:SS') : 'No expiry'}
                            </Typography>
                        </ListItem>
                    )
                )}
            </Box>
        </List>
    );
};
export default TokenBidsList;
