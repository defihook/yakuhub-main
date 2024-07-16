/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import axios from 'axios';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import MainCard from 'components/MainCard';
import DefiTokenRow from './DefiTokenRow';
import { useSelector } from 'store';
import { useMeta } from 'contexts/meta/meta';
import PagedList from 'components/PagedList';
import ChainFilters from 'components/ChainFilters';

function DefiHome() {
    const theme = useTheme();
    const { sticky } = useMeta();
    const ref = useRef<any>(null);
    const { drawerOpen } = useSelector((state: any) => state.menu);
    const [isLoading, setIsLoading] = useState(true);
    const [chainFilterValue, setChainFilterValue] = useState<string | undefined>();
    const [allDefiTokens, setAllDefiTokens] = useState<any>([]);
    const [currentPageDefiTokens, setCurrentPageDefiTokens] = useState<any>([]);
    const PAGE_SIZE = 50;

    const updateDefiTokens = async (forceReload = false) => {
        setIsLoading(true);
        if (forceReload) {
            setAllDefiTokens([]);
        }
        const { data } = await axios.get('https://api.llama.fi/protocols');
        if (data) {
            const protocols = _.filter(data, (d) => {
                if (d.category === 'Chain') {
                    return false;
                }
                if (chainFilterValue) {
                    return _.includes(d.chains, chainFilterValue);
                }
                return true;
            });
            setAllDefiTokens(protocols);
        }
        setIsLoading(false);
    };

    const getPage = (page: number) => {
        setIsLoading(true);
        const startIndex = (page - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const defiTokens = _.slice(allDefiTokens, startIndex, endIndex);
        setCurrentPageDefiTokens(defiTokens);
        setIsLoading(false);
    };

    useEffect(() => {
        setIsLoading(true);
        updateDefiTokens(true);
    }, [chainFilterValue]);

    useEffect(() => {
        if (_.size(allDefiTokens)) {
            getPage(1);
        }
    }, [allDefiTokens]);

    const onChainFilterChange = (value: string | undefined) => {
        let filterValue;
        switch (value) {
            case 'sol':
                filterValue = 'Solana';
                break;
            case 'eth':
                filterValue = 'Ethereum';
                break;
        }
        setChainFilterValue(filterValue);
    };
    const defaultBgColor = theme.palette.mode === 'dark' ? '#120c18' : '#fff';
    const header = (
        <Grid
            container
            sx={{
                alignItems: 'center',
                justifyContent: 'flex-end',
                display: { xs: 'none', lg: 'flex' },
                position: sticky > 108 ? 'fixed' : 'initial',
                backgroundColor: sticky > 108 ? defaultBgColor : 'transparent',
                left: drawerOpen ? 260 : 70,
                paddingLeft: sticky > 108 ? '20px' : 0,
                right: 0,
                top: 77,
                paddingRight: sticky > 108 ? '28px' : '8px',
                width: sticky > 108 ? `calc(100% - ${drawerOpen ? '260px' : '70px'} - 20px)` : '100%',
                zIndex: 400
            }}
        >
            <Grid item xs={3} sm={1} lg={0.5} sx={{ textAlign: 'center', p: 1 }}>
                <Typography component="p" sx={{ fontSize: 12 }} noWrap>
                    #
                </Typography>
            </Grid>
            <Grid item xs={6} sm={3} lg={2.5} sx={{ p: 1 }}>
                &nbsp;
            </Grid>
            <Grid item xs={3} sm={2} lg={1.5} sx={{ p: 1, textAlign: 'center' }}>
                <Typography component="p" sx={{ fontSize: 12 }} noWrap>
                    Category
                </Typography>
            </Grid>
            <Grid item xs={6} sm={6} lg={1.5} sx={{ textAlign: 'center', p: 1 }}>
                <Typography component="p" sx={{ fontSize: 12 }} noWrap>
                    TVL
                </Typography>
            </Grid>
            <Grid item xs={4} sm={2} lg={1.5} sx={{ textAlign: 'center', p: 1 }}>
                <Typography component="p" sx={{ fontSize: 12 }} noWrap>
                    1h Change
                </Typography>
            </Grid>
            <Grid item xs={4} sm={2} lg={1.5} sx={{ textAlign: 'center', p: 1 }}>
                <Typography component="p" sx={{ fontSize: 12 }} noWrap>
                    1d Change
                </Typography>
            </Grid>
            <Grid item xs={6} sm={6} lg={1.5} sx={{ textAlign: 'center', p: 1 }}>
                <Typography component="p" sx={{ fontSize: 12 }} noWrap>
                    7d Change
                </Typography>
            </Grid>
            <Grid item xs={4} sm={2} lg={1.5} sx={{ textAlign: 'center', p: 1 }}>
                <Typography component="p" sx={{ fontSize: 12 }} noWrap>
                    Mcap/TVL
                </Typography>
            </Grid>
        </Grid>
    );

    return (
        <>
            <MainCard
                border={false}
                divider={false}
                titleSX={{
                    '.MuiCardHeader-content': {
                        width: '100%'
                    }
                }}
                sx={{
                    '.MuiCardHeader-root': {
                        overflowX: 'auto',
                        flexDirection: { xs: 'column', md: 'row' }
                    }
                }}
                title={
                    <Box
                        sx={{
                            display: 'flex',
                            width: '100%'
                        }}
                    />
                }
                contentSX={{
                    p: 0
                }}
                secondary={<ChainFilters onFilterChange={onChainFilterChange} />}
            >
                {/* Content */}

                <Box sx={{ mt: '8px', width: '100%', px: '0px', position: 'relative' }}>
                    {header}
                    {sticky > 108 && <Box sx={{ width: '100%', height: 48 }}>&nbsp;</Box>}
                    <Grid container spacing={0} ref={ref}>
                        <Box sx={{ mt: '8px', width: '100%', position: 'relative' }}>
                            {isLoading ? (
                                _.range(0, 50).map((i) => <DefiTokenRow isLoading index={i} key={i} />)
                            ) : (
                                <PagedList
                                    disableGutters
                                    sx={{ px: '0px' }}
                                    maxWidth={false}
                                    component={DefiTokenRow}
                                    pageSize={PAGE_SIZE}
                                    masterList={_.chunk(allDefiTokens, PAGE_SIZE)}
                                    pageList={currentPageDefiTokens}
                                    getPage={getPage}
                                    isLoading={isLoading}
                                    spacing={1}
                                />
                            )}
                        </Box>
                    </Grid>
                </Box>
            </MainCard>
        </>
    );
}

export default DefiHome;
