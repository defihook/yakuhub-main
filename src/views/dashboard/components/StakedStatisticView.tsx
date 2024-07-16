import { Box, Chip, Grid, Typography, useTheme } from '@mui/material';
import MainCard from 'components/MainCard';
import useStaked from 'hooks/useStaked';
import { isEmpty, round, sumBy } from 'lodash';
import StakedPieChart from './StakedPieChart';

const StakedStatisticView = ({ project_stats = [] }: any) => {
    const theme = useTheme();
    const { totalStaked, valueLocked, tokenDistributed } = useStaked();
    return (
        <MainCard
            border={false}
            content={false}
            sx={{
                color: theme.palette.primary.light,
                '&:hover': {
                    cursor: 'pointer',
                    transform: 'scale3d(1.05, 1.05, 1)',
                    transition: '.15s'
                },
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <StakedPieChart totalStaked={totalStaked} total={sumBy(project_stats, 'project.supply')} />

            <Grid container columnSpacing={1} rowSpacing={1} sx={{ my: 1, p: 2 }} justifyContent="space-between" alignItems="center">
                <Grid item xs={12} display="flex" flexDirection="row" justifyContent="center" alignItems="center">
                    <Typography fontWeight="800" color="secondary" sx={{ mb: 1, fontSize: '1.25rem' }}>
                        Statistic
                    </Typography>
                </Grid>
                <Grid item xs={12} display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
                    <Typography
                        component="p"
                        fontSize={14}
                        fontWeight="bold"
                        style={{ color: theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.grey[900] }}
                    >
                        Total Staked:
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                        <Chip
                            sx={{ ml: 1, fontWeight: 'bold', fontSize: 14 }}
                            size="small"
                            label={`${(totalStaked || 0).toLocaleString()}`}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
                    <Typography
                        component="p"
                        fontSize={14}
                        fontWeight="bold"
                        style={{ color: theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.grey[900] }}
                    >
                        Minimum value locked:
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                        <Chip
                            sx={{ ml: 1, fontWeight: 'bold', fontSize: 14 }}
                            size="small"
                            label={`$${round(valueLocked || 0, 2).toLocaleString()}`}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
                    <Typography
                        component="p"
                        fontSize={14}
                        fontWeight="bold"
                        style={{ color: theme.palette.mode === 'dark' ? theme.palette.grey[200] : theme.palette.grey[900] }}
                    >
                        Distributed in total:
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                        <Chip
                            sx={{ ml: 1, fontWeight: 'bold', fontSize: 14 }}
                            size="small"
                            label={`${round(tokenDistributed || 0, 2).toLocaleString()} YAKU`}
                        />
                    </Box>
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default StakedStatisticView;
