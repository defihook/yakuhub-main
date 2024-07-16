import { Avatar, Box, Grid, Skeleton, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import SolanaLogo from 'assets/images/icons/solana-logo.png';

const NFTProjectRowSkeleton = ({ index }: any) => (
    <Grid
        item
        xs={12}
        sx={{
            p: 0,
            paddingLeft: '0 !important',
            paddingTop: '0 !important',
            borderRadius: 0
        }}
    >
        <MainCard
            content={false}
            border={false}
            sx={{
                width: '100%',
                py: 1,
                px: 0
            }}
        >
            <Grid container sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                <Grid item xs={1} sm={1} md={1} lg={0.5} xl={0.5} sx={{ textAlign: 'center', p: 1 }}>
                    {index + 1}
                </Grid>
                <Grid item xs={3} sm={1} md={1.5} lg={0.5} xl={0.5} sx={{ p: 1 }}>
                    <Skeleton variant="rounded" width={48} height={48} />
                </Grid>
                <Grid item xs={8} sm={4} md={2.5} lg={2} xl={3} sx={{ p: 1 }}>
                    <Skeleton variant="rounded" width="100%" height={16} />
                    <Skeleton variant="rounded" width="100%" height={12} sx={{ mt: 1 }} />
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
                        <Skeleton variant="rounded" width="100%" height={12} />
                        <Avatar
                            src={SolanaLogo}
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
                    <Skeleton variant="rounded" width="100%" height={24} />
                </Grid>
                <Grid item xs={4} sm={2} md={2} lg={1} xl={1} sx={{ textAlign: { xs: 'end', md: 'center' }, p: 1 }}>
                    <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                        Floor 24h %
                    </Typography>
                    <Skeleton variant="rounded" width="100%" height={24} />
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
                        <Skeleton variant="rounded" width="100%" height={16} />
                        <Avatar
                            src={SolanaLogo}
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
                    <Skeleton variant="rounded" width="100%" height={24} />
                </Grid>
                <Grid item xs={4} sm={2} md={2} lg={1} xl={1} sx={{ textAlign: 'end', p: 1 }}>
                    <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                        Vol (7D)
                    </Typography>
                    <Skeleton variant="rounded" width="100%" height={24} />
                </Grid>
                <Grid item xs={4} sm={2} md={2} lg={1} xl={1} sx={{ textAlign: { xs: 'end', sm: 'center' }, p: 1 }}>
                    <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                        Vol 24h %
                    </Typography>
                    <Skeleton variant="rounded" width="100%" height={24} />
                </Grid>
                <Grid item xs={4} sm={2} md={2} lg={1} xl={1} sx={{ textAlign: 'end', px: { xs: 1, sm: 2, lg: 1 }, py: 1 }}>
                    <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                        Listed
                    </Typography>
                    <Skeleton variant="rounded" width="100%" height={24} />
                </Grid>
            </Grid>
        </MainCard>
    </Grid>
);
export default NFTProjectRowSkeleton;
