import { Grid, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import { map } from 'lodash';

const StatsGrid = ({ title, stats, component, placeholder, count }: any) => (
    <Grid item xs={12} md={6} lg={4}>
        <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
                <Typography variant="h3">{title}</Typography>
            </Grid>
        </Grid>
        <MainCard border={false} sx={{ mt: 1.5 }} contentSX={{ p: 2.25 }} style={{ height: 240, maxHeight: 240 }}>
            <Grid container>
                {stats?.length > 0
                    ? map(stats, (item, idx) => component(item, idx))
                    : map(Array(count), (key) => (
                          <Grid item xs={12} sx={{ display: 'flex', my: 1 }} key={key}>
                              {placeholder}
                          </Grid>
                      ))}
            </Grid>
        </MainCard>
    </Grid>
);

export default StatsGrid;
