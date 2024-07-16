import { useState, useEffect } from 'react';
import { queries } from '../../../graphql/graphql';
import { Container, Skeleton, Typography } from '@mui/material';
import { useLazyQuery } from '@apollo/client';
import { Box } from '@mui/system';

const ValueSpan = ({ val }: any) => (
    <>
        {!val ? (
            <Skeleton width={32} height={10} />
        ) : (
            <Typography component="span" color="secondary" fontSize={10}>
                {(+val).toLocaleString()}
            </Typography>
        )}
    </>
);

const SiteStats = () => {
    const [getSiteStats] = useLazyQuery(queries.GET_SITE_STATS);
    const [stats, setStats] = useState<any>({});
    const updateView = async () => {
        const {
            data: { getSiteStats: statsData }
        } = await getSiteStats();
        if (statsData) {
            setStats(statsData);
        }
    };
    useEffect(() => {
        updateView();
    }, []);
    return (
        <Container
            maxWidth="xl"
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: { xs: 'start', sm: 'center', md: 'center' },
                alignItems: 'center',
                gap: 1
            }}
        >
            <Typography component="p" fontSize={10}>
                Total users: <ValueSpan val={stats.total} />
            </Typography>
            <Typography component="p" fontSize={10}>
                Total active users: <ValueSpan val={stats.activeCount} />
            </Typography>
            <Typography component="p" fontSize={10}>
                Total linked twitter: <ValueSpan val={stats.twitterCount} />
            </Typography>
            <Typography component="p" fontSize={10}>
                Total linked discord: <ValueSpan val={stats.discordCount} />
            </Typography>
            <Typography component="p" fontSize={10}>
                Total linked ETH address: <ValueSpan val={stats.ethCount} />
            </Typography>
        </Container>
    );
};

export default SiteStats;
