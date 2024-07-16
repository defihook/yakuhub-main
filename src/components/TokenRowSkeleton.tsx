import { Grid, Skeleton, Typography } from '@mui/material';
import MainCard from 'components/MainCard';

const TokenRowSkeleton = ({ index }: any) => (
    <Grid
        item
        xs={12}
        sx={{
            paddingLeft: '0 !important',
            paddingTop: '0 !important',
            p: 0
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
        >
            <Grid container sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                <Grid item xs={3} sm={1} lg={0.5} sx={{ textAlign: 'center', p: 1 }}>
                    <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                        Rank
                    </Typography>
                    {index}
                </Grid>
                <Grid item xs={3} sm={1} lg={0.5} sx={{ p: 1 }}>
                    <Skeleton variant="rounded" width={48} height={48} />
                </Grid>
                <Grid item xs={3} sm={2} lg={2} sx={{ p: 1 }}>
                    <Skeleton variant="rounded" width="100%" height={24} />
                </Grid>
                <Grid item xs={3} sm={2} lg={1.5} sx={{ p: 1, textAlign: { xs: 'end', sm: 'start' } }}>
                    <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                        Price
                    </Typography>

                    <Skeleton variant="rounded" width="100%" height={24} />
                </Grid>
                <Grid item xs={4} sm={2} lg={1.5} sx={{ textAlign: { xs: 'start', md: 'center' }, p: 1 }}>
                    <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                        Price 1h %
                    </Typography>
                    <Skeleton variant="rounded" width="100%" height={24} />
                </Grid>
                <Grid item xs={4} sm={2} lg={1.5} sx={{ textAlign: { xs: 'center', md: 'center' }, p: 1 }}>
                    <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                        Price 24h %
                    </Typography>
                    <Skeleton variant="rounded" width="100%" height={24} />
                </Grid>
                <Grid item xs={4} sm={2} lg={1.5} sx={{ textAlign: { xs: 'end', md: 'center' }, p: 1 }}>
                    <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                        Price 7D %
                    </Typography>
                    <Skeleton variant="rounded" width="100%" height={24} />
                </Grid>
                <Grid item xs={6} sm={6} lg={1.5} sx={{ textAlign: { xs: 'start', sm: 'center', lg: 'end' }, p: 1 }}>
                    <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                        Market Cap.
                    </Typography>
                    <Skeleton variant="rounded" width="100%" height={24} />
                </Grid>
                <Grid item xs={6} sm={6} lg={1.5} sx={{ textAlign: { xs: 'end', sm: 'center', lg: 'end' }, p: 1 }}>
                    <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                        Volume 24h
                    </Typography>
                    <Skeleton variant="rounded" width="100%" height={24} />
                </Grid>
            </Grid>
        </MainCard>
    </Grid>
);

export default TokenRowSkeleton;
