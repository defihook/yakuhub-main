import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
import { Avatar, Chip, Grid, IconButton, Typography } from '@mui/material';
import { ChevronLeftOutlined, Star, StarBorder } from '@mui/icons-material';
import { useState } from 'react';

function TokenDetailHeader({ tokenData }: any) {
    const navigate = useNavigate();
    const [favoriteToken, setFavoriteToken] = useState<Boolean>(false);

    return (
        <Grid container sx={{ mt: 2, mb: { md: 2, sm: 1, sx: 0 } }} columnSpacing={2} alignItems="center" justifyContent="space-between">
            <Grid container sx={{ my: 2 }} columnSpacing={2} width="auto" alignItems="center">
                <Grid item>
                    <IconButton onClick={() => navigate('/explore/token', { replace: true })}>
                        <ChevronLeftOutlined />
                    </IconButton>
                </Grid>
                <Grid item>
                    <Avatar src={tokenData?.image?.large} sx={{ width: { md: 80, sm: 60, xs: 60 }, height: { md: 80, sm: 60, xs: 60 } }} />
                </Grid>
                <Grid item>
                    <Typography component="h3" fontSize={20} fontWeight={900} mb={0.5}>
                        {tokenData?.name.toUpperCase()}
                    </Typography>
                    <Chip size="small" label={`Rank # ${tokenData?.market_cap_rank || 'n/a'}`} />
                </Grid>
            </Grid>
            <Grid container sx={{ my: 2 }} columnSpacing={2} width="auto" alignItems="center">
                <Grid item>
                    <IconButton onClick={() => setFavoriteToken(!favoriteToken)}>{favoriteToken ? <Star /> : <StarBorder />}</IconButton>
                </Grid>
                <Grid item>
                    <Typography>Trading View</Typography>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default TokenDetailHeader;
