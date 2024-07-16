import { Avatar, Box, Chip, Grid, Typography } from '@mui/material';
import { IMAGE_PROXY } from 'config/config';
import { useSolPrice } from 'contexts/CoinGecko';
import { round } from 'lodash';

const NFTPProjectMoverView = ({
    project,
    volume_1day,
    volume_1day_change,
    floor_price,
    floor_price_1day_change,
    index: idx,
    navigate
}: any) => {
    const solPrice = useSolPrice();
    return (
        <Grid
            key={idx}
            item
            xs={12}
            sx={{
                '&:hover': {
                    backgroundColor: '#d329ff15'
                },
                borderRadius: '.75rem',
                px: 1
            }}
        >
            <Grid
                container
                columnSpacing={1}
                sx={{ my: 1, cursor: 'pointer' }}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="nowrap"
                onClick={navigate}
            >
                <Grid item xs={7} display="flex" flexDirection="row" justifyContent="flex-start" alignItems="center">
                    <Avatar src={`${IMAGE_PROXY}${project.img_url}`} />
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        sx={{ ml: 1, width: '100%' }}
                    >
                        <Grid container>
                            <Grid item xs={12}>
                                <Typography component="h6" fontWeight={700} noWrap>
                                    {project.display_name}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography component="p" fontSize={12}>
                                    24h Vol: {round(Number(volume_1day / solPrice), 2).toLocaleString()} ◎
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography
                                    component="p"
                                    fontSize={12}
                                    sx={{ color: volume_1day_change > 0 ? 'success.dark' : 'error.dark' }}
                                >
                                    {volume_1day_change > 0 ? '+' : ''}
                                    {round(Number(volume_1day_change * 100), 2).toLocaleString()}%
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
                <Grid item xs={4} sx={{ mt: 2 }} display="flex" flexDirection="row" justifyContent="flex-end" alignItems="center">
                    <Chip size="small" label={`${Number(floor_price).toLocaleString()} ◎`} />
                    <Chip
                        sx={{ ml: 1 }}
                        size="small"
                        color={floor_price_1day_change > 0 ? 'success' : 'error'}
                        label={`${floor_price_1day_change > 0 ? '+' : ''}${round(
                            Number(floor_price_1day_change * 100),
                            2
                        ).toLocaleString()}%`}
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};

export default NFTPProjectMoverView;
