import { Grid, Skeleton, Typography } from '@mui/material';
import MainCard from 'components/MainCard';

const WalletRowSkeleton = () => (
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
                <Grid item xs={4} sx={{ textAlign: { xs: 'start', sm: 'center', lg: 'end' }, p: 1 }}>
                    <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                        Wallet
                    </Typography>
                    <Skeleton variant="rounded" width="100%" height={24} />
                </Grid>
                <Grid item xs={4} sx={{ textAlign: { xs: 'end', sm: 'center', lg: 'end' }, p: 1 }}>
                    <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                        Twitter
                    </Typography>
                    <Skeleton variant="rounded" width="100%" height={24} />
                </Grid>
                <Grid item xs={4} sx={{ textAlign: { xs: 'end', sm: 'center', lg: 'end' }, p: 1 }}>
                    <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', md: 'none' } }} noWrap>
                        Sol Balance
                    </Typography>
                    <Skeleton variant="rounded" width="100%" height={24} />
                </Grid>
            </Grid>
        </MainCard>
    </Grid>
);

export default WalletRowSkeleton;
