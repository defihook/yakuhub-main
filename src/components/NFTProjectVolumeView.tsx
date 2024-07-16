import { Avatar, Chip, Grid, Typography } from '@mui/material';
import { IMAGE_PROXY } from 'config/config';
import { useSolPrice } from 'contexts/CoinGecko';
import { round } from 'lodash';

const NFTProjectVolumeView = ({ project, volume_7day, index: idx, navigate = (v: any) => {}, project_id }: any) => {
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
                my: 0.75,
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
                onClick={() => navigate(project_id || project)}
            >
                <Grid
                    item
                    xs={volume_7day !== undefined ? 7 : 12}
                    display="flex"
                    flexDirection="row"
                    justifyContent="flex-start"
                    alignItems="center"
                >
                    <Avatar src={`${IMAGE_PROXY}${project.img_url}`} />

                    <Typography sx={{ ml: 1 }} component="h6" fontWeight={700} noWrap>
                        {project.display_name}
                    </Typography>
                </Grid>
                {volume_7day !== undefined && (
                    <Grid item xs={5} display="flex" flexDirection="row" justifyContent="flex-end" alignItems="center">
                        <Chip size="small" label={`${round(Number(volume_7day / solPrice), 2).toLocaleString()}◎`} />
                    </Grid>
                )}
            </Grid>
        </Grid>
    );
};

export default NFTProjectVolumeView;
