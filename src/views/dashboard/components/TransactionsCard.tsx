import React, { useEffect, useState } from 'react';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import { Avatar, Box, Grid, Typography } from '@mui/material';

// project imports
import MainCard from 'components/cards/MainCard';
import SkeletonBiggestSaleCard from 'components/cards/Skeleton/EarningCard';

// third party
import axios from 'axios';
import CountUp from 'react-countup';

// assets
import { IconAlertCircle } from '@tabler/icons';

const CardWrapper = styled(MainCard)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.dark : theme.palette.primary.dark,
    color: '#fff',
    overflow: 'hidden',
    position: 'relative',
    '&>div': {
        position: 'relative',
        zIndex: 5
    },
    '&:after': {
        content: '""',
        position: 'absolute',
        width: 210,
        height: 210,
        background:
            theme.palette.mode === 'dark'
                ? `linear-gradient(210.04deg, ${theme.palette.primary.dark} -50.94%, rgba(144, 202, 249, 0) 95.49%)`
                : theme.palette.primary[800],
        borderRadius: '50%',
        zIndex: 1,
        top: -85,
        right: -95,
        [theme.breakpoints.down('sm')]: {
            top: -105,
            right: -140
        }
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        zIndex: 1,
        width: 210,
        height: 210,
        background:
            theme.palette.mode === 'dark'
                ? `linear-gradient(140.9deg, ${theme.palette.primary.dark} -14.02%, rgba(144, 202, 249, 0) 82.50%)`
                : theme.palette.primary[800],
        borderRadius: '50%',
        top: -125,
        right: -15,
        opacity: 0.5,
        [theme.breakpoints.down('sm')]: {
            top: -155,
            right: -70
        }
    }
}));

interface TransactionsCardProps {
    isLoading: boolean;
}

const TransactionsCard = ({ isLoading }: TransactionsCardProps) => {
    const theme = useTheme();

    const [tps, setTps] = useState(0);
    const getTps = async () => {
        try {
            const { data } = await axios.get('https://api.solanart.io/get_solana_tps');
            setTps(data.tps);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        getTps();
    }, []);

    return (
        <>
            {isLoading ? (
                <SkeletonBiggestSaleCard />
            ) : (
                <CardWrapper border={false} content={false}>
                    <Box sx={{ p: 2.25 }}>
                        <Grid container direction="column">
                            <Grid item>
                                <Grid container justifyContent="space-between">
                                    <Grid item>
                                        <Avatar
                                            variant="rounded"
                                            sx={{
                                                ...theme.typography.largeAvatar,
                                                borderRadius: '8px',
                                                backgroundColor:
                                                    theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.primary[800],
                                                color: theme.palette.warning.dark,
                                                mt: 1
                                            }}
                                        >
                                            <IconAlertCircle fontSize="inherit" />
                                        </Avatar>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Grid container alignItems="center">
                                    <Grid item>
                                        <Typography sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75, mb: 0.75 }}>
                                            <CountUp end={tps} preserveValue />
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item sx={{ mb: 1.25 }}>
                                <Typography
                                    sx={{
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        color: theme.palette.mode === 'dark' ? theme.palette.text.secondary : theme.palette.secondary[200]
                                    }}
                                >
                                    Current Solana TPS
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </CardWrapper>
            )}
        </>
    );
};

export default TransactionsCard;
