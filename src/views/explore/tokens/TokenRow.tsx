import _ from 'lodash';
import { Avatar, Box, Chip, Grid, Typography } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MainCard from 'components/MainCard';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

import TokenRowSkeleton from 'components/TokenRowSkeleton';
import TokenSparkline from './TokenSparkline';
import useWindowSize from 'hooks/useWindowSize';
import { useEffect, useState } from 'react';

const TokenRow = ({
    id: tokenId,
    image,
    name,
    current_price,
    market_cap,
    market_cap_rank = 'n/a',
    price_change_percentage_1h_in_currency,
    price_change_percentage_24h,
    price_change_percentage_7d_in_currency,
    sparkline_in_7d,
    symbol,
    total_volume,
    isLoading
}: any) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const sparklineData = _.get(sparkline_in_7d, 'price', []);
    const showSparkline = false;
    const { width } = useWindowSize();
    const [isMobile, setIsMobile] = useState(false);
    const [viewState, setViewState] = useState(false);
    const [viewIcon, setViewIcon] = useState(false);
    useEffect(() => {
        if (width! >= 1200) {
            setViewIcon(false);
            setViewState(true);
        } else {
            setViewIcon(true);
            setViewState(false);
        }
        if (width! >= 600) {
            setIsMobile(false);
        } else {
            setIsMobile(true);
        }
    }, [width]);
    const changeView = () => {
        setViewState(!viewState);
    };

    return (
        <>
            {!isLoading ? (
                <Grid
                    item
                    xs={12}
                    sx={{
                        p: { xs: 1, md: 0 },
                        paddingLeft: { xs: 1, md: '0 !important' },
                        paddingTop: { xs: 1, md: '0 !important' }
                    }}
                >
                    <MainCard
                        content={false}
                        border={false}
                        sx={{
                            width: '100%',
                            py: 1,
                            px: 1,
                            borderRadius: 0,
                            '&:hover': {
                                backgroundColor: '#d329ff15'
                            },
                            cursor: 'pointer'
                        }}
                    >
                        <Grid
                            container
                            sx={{
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: { lg: 'nowrap', md: 'wrap', sm: 'wrap', xs: 'wrap' }
                            }}
                            onClick={() => navigate(`/explore/token/${tokenId}`)}
                        >
                            <Grid item sx={{ textAlign: 'center', p: 1, zIndex: 2, width: { md: 80, sm: 40, xs: 40 } }}>
                                {market_cap_rank}
                            </Grid>
                            <Grid item sx={{ p: 1, zIndex: 2, width: 50 }}>
                                <Avatar src={image} />
                            </Grid>
                            <Grid item xs={4} sm={2} lg={2} sx={{ p: 1, zIndex: 2 }}>
                                <Typography component="h6" fontWeight={700}>
                                    {name}
                                </Typography>
                                {isMobile && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: { xs: 'flex-start' },
                                            minHeight: 24
                                        }}
                                    >
                                        ${Number(_.round(current_price, 2)).toLocaleString()}
                                    </Box>
                                )}
                            </Grid>
                            {!isMobile && (
                                <Grid item sm={2} lg={1.5} sx={{ p: 1, textAlign: { sm: 'start' }, zIndex: 2 }}>
                                    <Typography component="p" sx={{ fontSize: 12, display: { lg: 'none' } }} noWrap>
                                        Price
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: { sm: 'flex-start' },
                                            minHeight: 24
                                        }}
                                    >
                                        ${Number(_.round(current_price, 2)).toLocaleString()}
                                    </Box>
                                </Grid>
                            )}
                            <Grid
                                item
                                xs={4}
                                sm={6}
                                lg={1.5}
                                sx={{ textAlign: { xs: 'start', sm: 'center', lg: 'start' }, p: 1, zIndex: 2 }}
                            >
                                <Typography
                                    component="p"
                                    sx={{
                                        fontSize: 12,
                                        display: { xs: 'initial', lg: 'none' },
                                        textAlign: { xs: 'right', sm: 'center', lg: 'right' }
                                    }}
                                    noWrap
                                >
                                    {!viewIcon ? 'Market Cap.' : 'Vol 24h'}
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: { xs: 'flex-start', sm: 'center', lg: 'flex-start' },
                                        alignItems: 'center',
                                        minHeight: 24
                                    }}
                                >
                                    {!viewIcon ? `${Number(market_cap).toLocaleString()}` : `${Number(total_volume).toLocaleString()}`}
                                </Box>
                            </Grid>
                            {viewState ? (
                                <>
                                    <Grid item xs={6} sm={2} lg={1.5} sx={{ textAlign: { xs: 'center', md: 'center' }, p: 1, zIndex: 2 }}>
                                        {isMobile ? (
                                            <>
                                                <Typography
                                                    component="p"
                                                    sx={{
                                                        fontSize: 12,
                                                        display: { xs: 'block', lg: 'none' },
                                                        textAlign: { xs: 'center' }
                                                    }}
                                                    noWrap
                                                >
                                                    Market Cap.
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: { xs: 'center', sm: 'center', lg: 'flex-end' },
                                                        alignItems: 'center',
                                                        minHeight: 24
                                                    }}
                                                >
                                                    ${Number(market_cap).toLocaleString()}
                                                </Box>
                                            </>
                                        ) : (
                                            <>
                                                <Typography
                                                    component="p"
                                                    sx={{ fontSize: 12, display: { xs: 'initial', lg: 'none' } }}
                                                    noWrap
                                                >
                                                    Price 1h % <br />
                                                </Typography>
                                                <Chip
                                                    sx={{ my: '1px' }}
                                                    size="small"
                                                    label={
                                                        <Typography component="p" noWrap>
                                                            <Typography
                                                                component="span"
                                                                sx={{
                                                                    transform:
                                                                        price_change_percentage_1h_in_currency > 0
                                                                            ? 'rotate(180deg)'
                                                                            : 'none',
                                                                    display: 'inline-block'
                                                                }}
                                                            >
                                                                ▾
                                                            </Typography>{' '}
                                                            {Number(
                                                                Math.abs(_.round(price_change_percentage_1h_in_currency, 1))
                                                            ).toLocaleString()}
                                                            %
                                                        </Typography>
                                                    }
                                                    color={price_change_percentage_1h_in_currency > 0 ? 'success' : 'error'}
                                                />
                                            </>
                                        )}
                                    </Grid>
                                    <Grid item xs={3} sm={2} lg={1.5} sx={{ textAlign: { xs: 'center', md: 'center' }, p: 1, zIndex: 2 }}>
                                        {isMobile ? (
                                            <>
                                                <Typography
                                                    component="p"
                                                    sx={{ fontSize: 12, display: { xs: 'initial', lg: 'none' } }}
                                                    noWrap
                                                >
                                                    Price 1h % <br />
                                                </Typography>
                                                <Chip
                                                    sx={{ my: '1px' }}
                                                    size="small"
                                                    label={
                                                        <Typography component="p" noWrap>
                                                            <Typography
                                                                component="span"
                                                                sx={{
                                                                    transform:
                                                                        price_change_percentage_1h_in_currency > 0
                                                                            ? 'rotate(180deg)'
                                                                            : 'none',
                                                                    display: 'inline-block'
                                                                }}
                                                            >
                                                                ▾
                                                            </Typography>{' '}
                                                            {Number(
                                                                Math.abs(_.round(price_change_percentage_1h_in_currency, 1))
                                                            ).toLocaleString()}
                                                            %
                                                        </Typography>
                                                    }
                                                    color={price_change_percentage_1h_in_currency > 0 ? 'success' : 'error'}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <Typography
                                                    component="p"
                                                    sx={{ fontSize: 12, display: { xs: 'initial', lg: 'none' } }}
                                                    noWrap
                                                >
                                                    Price 24h % <br />
                                                </Typography>
                                                <Chip
                                                    sx={{ my: '1px' }}
                                                    size="small"
                                                    label={
                                                        <Typography component="p" noWrap>
                                                            <Typography
                                                                component="span"
                                                                sx={{
                                                                    transform: price_change_percentage_24h > 0 ? 'rotate(180deg)' : 'none',
                                                                    display: 'inline-block'
                                                                }}
                                                            >
                                                                ▾
                                                            </Typography>{' '}
                                                            {Number(Math.abs(_.round(price_change_percentage_24h, 1))).toLocaleString()}%
                                                        </Typography>
                                                    }
                                                    color={price_change_percentage_24h > 0 ? 'success' : 'error'}
                                                />
                                            </>
                                        )}
                                    </Grid>
                                    <Grid
                                        item
                                        xs={4}
                                        sm={2}
                                        lg={1.5}
                                        sx={{
                                            textAlign: { xs: 'end', md: 'center' },
                                            p: 1,
                                            zIndex: 2,
                                            display: { md: 'block', sm: 'none', xs: 'none' }
                                        }}
                                    >
                                        <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', lg: 'none' } }} noWrap>
                                            Price 7D %<br />
                                        </Typography>
                                        <Chip
                                            sx={{ my: '1px' }}
                                            size="small"
                                            label={
                                                <Typography component="p" noWrap>
                                                    <Typography
                                                        component="span"
                                                        sx={{
                                                            transform:
                                                                price_change_percentage_7d_in_currency > 0 ? 'rotate(180deg)' : 'none',
                                                            display: 'inline-block'
                                                        }}
                                                    >
                                                        ▾
                                                    </Typography>{' '}
                                                    {Number(Math.abs(_.round(price_change_percentage_7d_in_currency, 1))).toLocaleString()}%
                                                </Typography>
                                            }
                                            color={price_change_percentage_7d_in_currency > 0 ? 'success' : 'error'}
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={3}
                                        sm={6}
                                        lg={1.5}
                                        sx={{ textAlign: { xs: 'start', sm: 'center', lg: 'end' }, p: 1, zIndex: 2 }}
                                    >
                                        {isMobile ? (
                                            <>
                                                <Typography
                                                    component="p"
                                                    sx={{ fontSize: 12, display: { xs: 'initial', lg: 'none' } }}
                                                    noWrap
                                                >
                                                    Price 24h %
                                                </Typography>
                                                <Chip
                                                    sx={{ my: '1px' }}
                                                    size="small"
                                                    label={
                                                        <Typography component="p" noWrap>
                                                            <Typography
                                                                component="span"
                                                                sx={{
                                                                    transform: price_change_percentage_24h > 0 ? 'rotate(180deg)' : 'none',
                                                                    display: 'inline-block'
                                                                }}
                                                            >
                                                                ▾
                                                            </Typography>{' '}
                                                            {Number(Math.abs(_.round(price_change_percentage_24h, 1))).toLocaleString()}%
                                                        </Typography>
                                                    }
                                                    color={price_change_percentage_24h > 0 ? 'success' : 'error'}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <Typography
                                                    component="p"
                                                    sx={{ fontSize: 12, display: { xs: 'initial', lg: 'none' } }}
                                                    noWrap
                                                >
                                                    {viewIcon ? 'Market Cap.' : 'Vol 24h'}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: { xs: 'start', sm: 'center', lg: 'flex-end' },
                                                        alignItems: 'center',
                                                        minHeight: 24
                                                    }}
                                                >
                                                    {viewIcon
                                                        ? `${Number(market_cap).toLocaleString()}`
                                                        : `${Number(total_volume).toLocaleString()}`}
                                                </Box>
                                            </>
                                        )}
                                    </Grid>
                                </>
                            ) : (
                                <></>
                            )}
                            {showSparkline && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        width: '100%',
                                        opacity: theme.palette.mode === 'dark' ? '.30' : '.20'
                                    }}
                                >
                                    <TokenSparkline sparkline={sparklineData} symbol={symbol} />
                                </Box>
                            )}
                        </Grid>
                        {viewIcon ? (
                            <Grid
                                item
                                lg={1}
                                sx={{ textAlign: 'end', p: 1, zIndex: 3, position: 'absolute', top: '0px', right: '0px' }}
                                onClick={() => changeView()}
                            >
                                {viewState ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </Grid>
                        ) : (
                            <></>
                        )}
                    </MainCard>
                </Grid>
            ) : (
                <TokenRowSkeleton index={market_cap_rank} />
            )}
        </>
    );
};

export default TokenRow;
