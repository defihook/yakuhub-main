import _ from 'lodash';
import { Avatar, Box, Chip, Grid, Typography } from '@mui/material';
import MainCard from 'components/MainCard';

import DefiTokenRowSkeleton from './DefiTokenRowSkeleton';
import { useNavigate } from 'react-router-dom';
import useWindowSize from 'hooks/useWindowSize';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState } from 'react';
import { abbreviateValue } from 'utils/utils';

const DefiTokenRow = ({
    page,
    pageSize,
    index,
    logo,
    name,
    category,
    slug,
    tvl,
    change_1h,
    change_1d,
    change_7d,
    mcap,
    isLoading
}: any) => {
    const navigate = useNavigate();
    const mCapTVL = _.round(mcap / tvl, 3);

    const { width } = useWindowSize();
    const [isMobile, setIsMobile] = useState(false);
    const [viewState, setViewState] = useState(false);
    const [viewIcon, setViewIcon] = useState(false);
    useEffect(() => {
        if (width! >= 1200) {
            setViewIcon(false);
            setViewState(true);
        } else {
            setViewIcon(true);
            setViewState(false);
        }
        if (width! >= 600) {
            setIsMobile(false);
        } else {
            setIsMobile(true);
        }
    }, [width]);
    const changeView = () => {
        setViewState(!viewState);
    };

    const createPercentageChangeComponent = (label: string, value: number | null) => (
        <Grid item xs={4} sm={2} lg={1.5} sx={{ textAlign: 'center', p: 1 }}>
            <Typography component="p" sx={{ fontSize: 12, display: { xs: 'block', lg: 'none' } }} noWrap>
                {label}
            </Typography>
            {value !== null ? (
                <Chip
                    sx={{ my: '1px' }}
                    size="small"
                    label={
                        <Typography component="p" noWrap>
                            <Typography
                                component="span"
                                sx={{
                                    transform: value > 0 ? 'rotate(180deg)' : 'none',
                                    display: 'inline-block'
                                }}
                            >
                                ▾
                            </Typography>{' '}
                            {Number(Math.abs(_.round(value, 2))).toLocaleString()}%
                        </Typography>
                    }
                    color={value > 0 ? 'success' : 'error'}
                />
            ) : null}
        </Grid>
    );

    const rank = (page - 1) * pageSize + (index + 1);

    return (
        <>
            {!isLoading ? (
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
                            },
                            cursor: 'pointer'
                        }}
                    >
                        <Grid
                            container
                            sx={{ alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => navigate(`/explore/defi/${slug}`)}
                        >
                            <Grid item xs={1} sm={1} lg={0.5} sx={{ textAlign: 'center', p: 1 }}>
                                <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', lg: 'none' } }} noWrap>
                                    #
                                </Typography>
                                {rank}
                            </Grid>
                            <Grid item xs={2} sm={1} lg={0.5} sx={{ p: 1 }}>
                                <Avatar src={logo} />
                            </Grid>
                            <Grid item xs={3} sm={2} lg={2} sx={{ p: 1 }}>
                                <Typography component="h6" fontWeight={700} noWrap>
                                    {name}
                                </Typography>
                            </Grid>
                            <Grid item xs={3} sm={2} lg={1.5} sx={{ p: 1, textAlign: { xs: 'end', sm: 'start' } }}>
                                <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', lg: 'none' } }} noWrap>
                                    Category
                                </Typography>
                                <Typography component="p" noWrap>
                                    {category}
                                </Typography>
                            </Grid>
                            <Grid item xs={3} sm={6} lg={1.5} sx={{ textAlign: { xs: 'center', lg: 'end' }, p: 1 }}>
                                <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', lg: 'none' } }} noWrap>
                                    TVL
                                </Typography>
                                <Typography
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        minHeight: 24
                                    }}
                                    noWrap
                                >
                                    {isMobile ? <>${abbreviateValue(parseInt(tvl, 10))}</> : <>${Number(tvl).toLocaleString()}</>}
                                </Typography>
                            </Grid>
                            {viewState && (
                                <>
                                    {createPercentageChangeComponent('1h Change', change_1h)}
                                    {createPercentageChangeComponent('1d Change', change_1d)}
                                    {!isMobile && <>{createPercentageChangeComponent('7d Change', change_7d)}</>}
                                    <Grid item xs={4} sm={6} lg={1.5} sx={{ textAlign: 'center', p: 1 }}>
                                        <Typography component="p" sx={{ fontSize: 12, display: { xs: 'initial', lg: 'none' } }} noWrap>
                                            Mcap/TVL
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                minHeight: 24
                                            }}
                                        >
                                            {mCapTVL ? Number(mCapTVL).toLocaleString() : null}
                                        </Box>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                        {viewIcon ? (
                            <Grid
                                item
                                lg={1}
                                sx={{ textAlign: 'end', p: 1, zIndex: 3, position: 'absolute', top: '0px', right: '0px' }}
                                onClick={() => changeView()}
                            >
                                {viewState ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </Grid>
                        ) : (
                            <></>
                        )}
                    </MainCard>
                </Grid>
            ) : (
                <DefiTokenRowSkeleton rank={index + 1} />
            )}
        </>
    );
};

export default DefiTokenRow;
