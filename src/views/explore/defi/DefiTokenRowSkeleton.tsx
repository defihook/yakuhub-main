import { Grid, Skeleton, Typography } from '@mui/material';
import MainCard from 'components/MainCard';

const DefiTokenRowSkeleton = ({ rank }: any) => {
    const createPercentageChangeComponent = (label: string) => (
        <Grid item xs={4} sm={2} lg={1.5} sx={{ textAlign: 'center', p: 1 }}>
            <Typography component="p" sx={{ fontSize: 12, display: { xs: 'block', md: 'none' } }} noWrap>
                {label}
            </Typography>
            <Skeleton variant="rounded" width="100%" height={24} />
        </Grid>
    );

    return (
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
                    }
                }}
            >
                <Grid container sx={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Grid item xs={3} sm={1} lg={0.5} sx={{ textAlign: 'center', p: 1 }}>
                        <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                            #
                        </Typography>
                        {rank}
                    </Grid>
                    <Grid item xs={3} sm={1} lg={0.5} sx={{ p: 1 }}>
                        <Skeleton variant="rounded" width="100%" height={24} />
                    </Grid>
                    <Grid item xs={3} sm={2} lg={2} sx={{ p: 1 }}>
                        <Skeleton variant="rounded" width="100%" height={24} />
                    </Grid>
                    <Grid item xs={3} sm={2} lg={1.5} sx={{ p: 1, textAlign: { xs: 'end', sm: 'start' } }}>
                        <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                            Category
                        </Typography>
                        <Skeleton variant="rounded" width="100%" height={24} />
                    </Grid>
                    {createPercentageChangeComponent('1h Change')}
                    {createPercentageChangeComponent('1d Change')}
                    {createPercentageChangeComponent('7d Change')}
                    <Grid item xs={6} sm={6} lg={1.5} sx={{ textAlign: { xs: 'start', sm: 'center', lg: 'end' }, p: 1 }}>
                        <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                            TVL
                        </Typography>
                        <Skeleton variant="rounded" width="100%" height={24} />
                    </Grid>
                    <Grid item xs={6} sm={6} lg={1.5} sx={{ textAlign: 'center', p: 1 }}>
                        <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                            Mcap/TVL
                        </Typography>
                        <Skeleton variant="rounded" width="100%" height={24} />
                    </Grid>
                </Grid>
            </MainCard>
        </Grid>
    );
};

export default DefiTokenRowSkeleton;
