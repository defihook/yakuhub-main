import { Avatar, Box, Chip, Grid, Skeleton, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import { round } from 'lodash';
import SolanaLogo from 'assets/images/icons/solana-logo.png';
import EthLogo from 'assets/images/blockchains/ethereum-icon.png';
import { useNavigate, useParams } from 'react-router-dom';
import { useSolPrice } from 'contexts/CoinGecko';
import { IMAGE_PROXY } from 'config/config';
import NFTProjectRowSkeleton from './NFTProjectRowSkeleton';
import { formatAmount } from 'utils/utils';

const NFTProjectRow = ({
    project_id,
    project,
    floor_price,
    market_cap,
    floor_price_1day_change,
    average_price,
    average_price_1day_change,
    volume_7day,
    volume_1day_change,
    percentage_of_token_listed,
    num_of_token_listed,
    isLoading,
    theme,
    index,
    page,
    pageSize
}: any) => {
    const { chain } = useParams();
    const navigate = useNavigate();
    const solPrice = useSolPrice();
    if (isLoading) {
        return <NFTProjectRowSkeleton index={index} />;
    }
    return (
        <Grid
            item
            xs={12}
            sx={{
                p: { xs: 1, md: 0 },
                paddingLeft: { xs: 1, md: '0 !important' },
                paddingTop: { xs: 1, md: '0 !important' },
                borderRadius: 0
            }}
        >
            <MainCard
                content={false}
                border={false}
                sx={{
                    width: '100%',
                    py: 1,
                    px: 0,
                    borderRadius: 0,
                    '&:hover': {
                        backgroundColor: '#d329ff15'
                    },
                    cursor: 'pointer'
                }}
                onClick={() => navigate(`/explore/collection/${chain}/${project_id}`)}
            >
                <Grid container sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Grid item xs={1.5} sm={1} md={1} lg={0.5} xl={0.5} sx={{ textAlign: 'center', p: 1 }}>
                        {(page - 1) * pageSize + (index + 1)}
                    </Grid>
                    <Grid item xs={2.5} sm={1} md={1.5} lg={0.5} xl={0.5} sx={{ p: 1 }}>
                        <Avatar src={`${IMAGE_PROXY}${project.img_url}`} />
                    </Grid>
                    <Grid item xs={8} sm={4} md={2.5} lg={2} xl={3} sx={{ p: 1 }}>
                        <Typography component="h6" fontWeight={700}>
                            {project.display_name}
                        </Typography>
                        {Number(project.supply).toLocaleString()}
                    </Grid>
                    <Grid item xs={4} sm={2} md={1} lg={1} xl={1} sx={{ p: 1, textAlign: { xs: 'end', sm: 'start' } }}>
                        <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                            Floor Price
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: { xs: 'flex-end', sm: 'flex-start' },
                                minHeight: 24
                            }}
                        >
                            {Number(round(floor_price, 2)).toLocaleString()}
                            <Avatar
                                src={chain === 'SOL' ? SolanaLogo : EthLogo}
                                sx={{
                                    width: 16,
                                    height: 16,
                                    objectFit: 'contain',
                                    ml: 1
                                }}
                                color="inherit"
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={8} sm={2} md={2} lg={2} xl={1} sx={{ textAlign: 'end', p: 1 }}>
                        <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                            Market Cap.
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: { xs: 'flex-end', sm: 'flex-start' },
                                alignItems: 'center',
                                minHeight: 24
                            }}
                        >
                            ${formatAmount(Number(market_cap))}
                        </Box>
                    </Grid>
                    <Grid item xs={4} sm={2} md={2} lg={1} xl={1} sx={{ textAlign: { xs: 'end', md: 'center' }, p: 1 }}>
                        <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                            Floor 24h %
                        </Typography>
                        <Chip
                            sx={{ my: '1px' }}
                            size="small"
                            label={
                                <Typography component="p" noWrap>
                                    <Typography
                                        component="span"
                                        sx={{
                                            transform: floor_price_1day_change > 0 ? 'rotate(180deg)' : 'none',
                                            display: 'inline-block'
                                        }}
                                    >
                                        ▾
                                    </Typography>{' '}
                                    {Number(Math.abs(round(floor_price_1day_change * 100, 1))).toLocaleString()}%
                                </Typography>
                            }
                            color={floor_price_1day_change > 0 ? 'success' : 'error'}
                        />
                    </Grid>
                    <Grid item xs={4} sm={2} md={1} lg={1} xl={1} sx={{ p: 1, textAlign: { xs: 'end', sm: 'center' } }}>
                        <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                            Avg. Price
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: { xs: 'flex-end', sm: 'center' },
                                minHeight: 24
                            }}
                        >
                            {formatAmount(Number(round(average_price, 2)))}
                            <Avatar
                                src={chain === 'SOL' ? SolanaLogo : EthLogo}
                                sx={{
                                    width: 16,
                                    height: 16,
                                    objectFit: 'contain',
                                    ml: 1
                                }}
                                color="inherit"
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={4} sm={2} md={1} lg={1} xl={1} sx={{ textAlign: { xs: 'end', sm: 'center' }, p: 1 }}>
                        <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                            Avg 24h %
                        </Typography>
                        <Chip
                            sx={{ my: '1px' }}
                            size="small"
                            label={
                                <Typography component="p" noWrap>
                                    <Typography
                                        component="span"
                                        sx={{
                                            transform: average_price_1day_change > 0 ? 'rotate(180deg)' : 'none',
                                            display: 'inline-block'
                                        }}
                                    >
                                        ▾
                                    </Typography>{' '}
                                    {Number(Math.abs(round(average_price_1day_change * 100, 1))).toLocaleString()}%
                                </Typography>
                            }
                            color={average_price_1day_change > 0 ? 'success' : 'error'}
                        />
                    </Grid>
                    <Grid item xs={4} sm={2} md={2} lg={1} xl={1} sx={{ textAlign: 'end', p: 1 }}>
                        <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                            Vol (7D)
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minHeight: 24 }}>
                            {formatAmount(Number(volume_7day / solPrice), 2)}◎
                        </Box>
                    </Grid>
                    <Grid item xs={4} sm={2} md={2} lg={1} xl={1} sx={{ textAlign: { xs: 'end', sm: 'center' }, p: 1 }}>
                        <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                            Vol 24h %
                        </Typography>
                        <Chip
                            sx={{ my: '1px' }}
                            size="small"
                            label={
                                <Typography component="p" noWrap>
                                    <Typography
                                        component="span"
                                        sx={{
                                            transform: volume_1day_change > 0 ? 'rotate(180deg)' : 'none',
                                            display: 'inline-block'
                                        }}
                                    >
                                        ▾
                                    </Typography>{' '}
                                    {Number(Math.abs(round(volume_1day_change * 100, 1))).toLocaleString()}%
                                </Typography>
                            }
                            color={volume_1day_change > 0 ? 'success' : 'error'}
                        />
                    </Grid>
                    <Grid
                        item
                        xs={4}
                        sm={2}
                        md={2}
                        lg={1}
                        xl={1}
                        sx={{ textAlign: { xs: 'end', sm: 'center' }, px: { xs: 1, sm: 2, lg: 1 }, py: 1 }}
                    >
                        <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                            Listed
                        </Typography>
                        <Box
                            sx={{ display: 'flex', justifyContent: { xs: 'flex-end', sm: 'center' }, alignItems: 'center', minHeight: 24 }}
                        >
                            {Number(round(percentage_of_token_listed * 100, 1)).toLocaleString()}% ({num_of_token_listed})
                        </Box>
                    </Grid>
                </Grid>
            </MainCard>
        </Grid>
    );
};
export default NFTProjectRow;
