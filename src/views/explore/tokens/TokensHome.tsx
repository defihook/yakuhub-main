/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import _, { includes, map } from 'lodash';
import { queries } from '../../../graphql/graphql';
import {
    Avatar,
    Box,
    Button,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    LinearProgress,
    MenuItem,
    OutlinedInput,
    Select,
    Tab,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { ArrowDownwardOutlined, RefreshOutlined } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { TabContext, TabList } from '@mui/lab';
import InfiniteScroll from 'react-infinite-scroller';
import TokenRow from './TokenRow';
import { IconSortAscending, IconSortDescending } from '@tabler/icons';
import { useSelector } from 'store';
import { useMeta } from 'contexts/meta/meta';
import { useLazyQuery } from '@apollo/client';
import SolanaLogo from 'assets/images/icons/solana-logo.png';
import EthLogo from 'assets/images/blockchains/ethereum-icon.png';

const SortingArrow = ({ fieldNames, orderBy, ordering }: any) => (
    <>
        {includes(fieldNames, orderBy) ? (
            <ArrowDownwardOutlined sx={{ fontSize: 14, transform: ordering === 'ASC' ? 'rotate(180deg)' : 'none' }} />
        ) : (
            <></>
        )}
    </>
);
function TokensHomes() {
    const theme = useTheme();
    const { sticky } = useMeta();
    const ref = useRef<any>(null);
    const [tabIdx, setTabIdx] = useState('all');
    const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));
    const { drawerOpen } = useSelector((state: any) => state.menu);
    const defaultVariables = {
        category: undefined,
        orderBy: 'market_cap',
        page: 1,
        perPage: 50
    };
    const orderFieldsList = [
        {
            label: 'Market Cap.',
            value: 'market_cap'
        },
        {
            label: 'Volume (7D)',
            value: 'volume'
        }
    ];
    const tokenCategoryFieldsList = [
        {
            label: 'ALL',
            value: 'all'
        },
        {
            label: 'SOL',
            value: 'solana-ecosystem'
        },
        {
            label: 'ETH',
            value: 'ethereum-ecosystem'
        },
        {
            label: 'NFT',
            value: 'non-fungible-tokens-nft'
        },
        {
            label: 'DeFi',
            value: 'decentralized-finance-defi'
        },
        {
            label: 'Gaming',
            value: 'gaming'
        },
        {
            label: 'Meme',
            value: 'meme-token'
        }
    ];
    const [isLoading, setIsLoading] = useState(true);
    const [variables, setVariables] = useState<any>({ ...defaultVariables });
    const [tokens, setTokens] = useState<any>([]);
    const [orderBy, setOrderBy] = useState('market_cap');
    const [orderDirection, setOrderDirection] = useState('DESC');
    const [getTokenStats] = useLazyQuery(queries.GET_MARKET_COINS);
    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        if (newValue !== 'all') {
            setVariables({ ...variables, category: newValue, page: 1 });
        } else {
            setVariables({ ...variables, category: undefined, page: 1 });
        }
        setTabIdx(newValue);
    };
    const handleOrderFilterChange = (event: any) => {
        const {
            target: { value }
        } = event;
        if (value === orderBy) {
            toggleOrdering();
            return;
        }
        setVariables({ ...variables, orderBy: value, page: 1 });
        setOrderBy(value);
        setOrderDirection('DESC');
    };

    const updatePage = async (page = variables.page, forceReload = false) => {
        console.log('update', page);
        setIsLoading(true);
        if (forceReload) {
            setTokens([]);
        }
        const order = `${variables.orderBy}_${orderDirection}`.toLowerCase();
        const { data: refreshData } = await getTokenStats({
            variables: {
                params: {
                    category: variables.category,
                    order,
                    page,
                    per_page: variables.perPage,
                    vs_currency: 'usd',
                    sparkline: true,
                    price_change_percentage: '1h,24h,7d'
                }
            }
        });
        if (refreshData?.marketsCoins?.code === 200) {
            const newTokens = _.get(refreshData, 'marketsCoins.data', []);
            if (forceReload) {
                setTokens(newTokens);
            } else {
                setTokens([...tokens, ...newTokens]);
            }
        }
        setIsLoading(false);
    };

    const toggleOrdering = () => {
        setOrderDirection(orderDirection === 'DESC' ? 'ASC' : 'DESC');
        setVariables({ ...variables, page: 1 });
    };

    const getPage = (page: number) => {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        const nextPage = variables.page + 1;
        setVariables({
            ...variables,
            page: nextPage
        });
        updatePage(nextPage);
    };

    useEffect(() => {
        setIsLoading(true);
        updatePage(1, true);
    }, [orderDirection, orderBy, tabIdx]);

    const defaultBgColor = theme.palette.mode === 'dark' ? '#120c18' : '#fff';
    const header = (
        <Grid
            container
            sx={{
                alignItems: 'center',
                justifyContent: 'flex-end',
                display: { lg: 'flex', md: 'none', sm: 'none', xs: 'none' },
                position: sticky > 108 ? 'fixed' : 'initial',
                top: 77,
                backgroundColor: sticky > 108 ? defaultBgColor : 'transparent',
                left: drawerOpen ? 260 : 70,
                paddingLeft: sticky > 108 ? '20px' : 0,
                right: 0,
                paddingRight: sticky > 108 ? '28px' : '8px',
                width: sticky > 108 ? `calc(100% - ${drawerOpen ? '260px' : '70px'} - 20px)` : '100%',
                zIndex: 400,
                flexWrap: 'nowrap'
            }}
        >
            <Grid item sx={{ textAlign: 'center', p: 1, width: { md: 80, sm: 30, xs: 30 } }}>
                <Typography component="p" sx={{ fontSize: 12 }} noWrap>
                    Rank
                </Typography>
            </Grid>
            <Grid item xs={6} sm={3} lg={2.5} sx={{ p: 1 }}>
                &nbsp;
            </Grid>
            <Grid item xs={3} sm={2} lg={1.5} sx={{ p: 1, textAlign: { xs: 'end', sm: 'start' } }}>
                <Typography component="p" sx={{ fontSize: 12 }} noWrap>
                    Price
                </Typography>
            </Grid>
            <Grid item xs={6} sm={6} lg={1.5} sx={{ textAlign: { xs: 'start', sm: 'center', lg: 'end' }, p: 1, cursor: 'pointer' }}>
                <Typography
                    component="p"
                    sx={{
                        fontSize: 12,
                        display: 'flex',
                        justifyContent: { xs: 'flex-start', sm: 'center', lg: 'flex-start' },
                        alignItems: 'center',
                        gap: 0.5
                    }}
                    noWrap
                >
                    Market Cap. <SortingArrow {...{ orderBy, fieldNames: ['market_cap'], ordering: orderDirection }} />
                </Typography>
            </Grid>
            <Grid item xs={4} sm={2} lg={1.5} sx={{ textAlign: { xs: 'start', md: 'center' }, p: 1 }}>
                <Typography component="p" sx={{ fontSize: 12 }} noWrap>
                    Price 1h %
                </Typography>
            </Grid>
            <Grid item xs={4} sm={2} lg={1.5} sx={{ textAlign: { xs: 'center', md: 'center' }, p: 1 }}>
                <Typography component="p" sx={{ fontSize: 12 }} noWrap>
                    Price 24h %
                </Typography>
            </Grid>
            <Grid item xs={4} sm={2} lg={1.5} sx={{ textAlign: { xs: 'end', md: 'center' }, p: 1 }}>
                <Typography component="p" sx={{ fontSize: 12 }} noWrap>
                    Price 7D %
                </Typography>
            </Grid>
            <Grid item xs={6} sm={6} lg={1.5} sx={{ textAlign: { xs: 'end', sm: 'center', lg: 'end' }, p: 1, cursor: 'pointer' }}>
                <Typography
                    component="p"
                    sx={{
                        fontSize: 12,
                        display: 'flex',
                        justifyContent: { xs: 'flex-start', sm: 'center', lg: 'flex-end' },
                        alignItems: 'center',
                        gap: 0.5
                    }}
                    noWrap
                >
                    Volume 24h <SortingArrow {...{ orderBy, fieldNames: ['volume'], ordering: orderDirection }} />
                </Typography>
            </Grid>
        </Grid>
    );

    return (
        <>
            <TabContext value={tabIdx}>
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
                        >
                            {!matchUpMd && (
                                <TabList
                                    onChange={handleTabChange}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    sx={{
                                        marginTop: '-12px',
                                        mb: { xs: 2, md: 0 },
                                        width: '100%',
                                        '.MuiTabs-root': {
                                            width: '100%'
                                        },
                                        '.MuiTabs-flexContainer': { borderBottom: 'none' }
                                    }}
                                    textColor="secondary"
                                    indicatorColor="secondary"
                                >
                                    {_.map(tokenCategoryFieldsList, ({ label, value }: any) => (
                                        <Tab label={label} id={`${value}Tab`} value={value} key={value} />
                                    ))}
                                </TabList>
                            )}
                            {matchUpMd && (
                                <div className="nft-collection">
                                    <div
                                        style={{
                                            borderColor: 'rgba(51, 39, 63, 1)',
                                            borderWidth: 1,
                                            borderStyle: 'solid',
                                            borderRadius: 30000,
                                            gap: 4,
                                            display: 'flex'
                                        }}
                                    >
                                        {map(tokenCategoryFieldsList, ({ label, value }: any) => (
                                            <Button
                                                key={value}
                                                sx={{ borderRadius: 30000, px: 2 }}
                                                variant={tabIdx === value ? 'contained' : 'text'}
                                                color="secondary"
                                                onClick={(e) => handleTabChange(e, value)}
                                                startIcon={
                                                    value === 'solana-ecosystem' ? (
                                                        <Avatar
                                                            src={SolanaLogo}
                                                            sx={{
                                                                width: 20,
                                                                height: 20,
                                                                objectFit: 'contain',
                                                                backgroundColor: 'transparent'
                                                            }}
                                                            color="inherit"
                                                        />
                                                    ) : (
                                                        value === 'ethereum-ecosystem' && (
                                                            <Avatar
                                                                src={EthLogo}
                                                                sx={{
                                                                    width: 20,
                                                                    height: 20,
                                                                    objectFit: 'contain'
                                                                }}
                                                                color="inherit"
                                                            />
                                                        )
                                                    )
                                                }
                                            >
                                                {label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Box>
                    }
                    secondary={
                        !matchUpMd && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <FormControl sx={{ width: '100%' }}>
                                    <InputLabel id="orderFieldLbl">Sort by</InputLabel>
                                    <Select
                                        labelId="orderFieldLbl"
                                        id="orderField"
                                        value={orderBy}
                                        onChange={(e) => handleOrderFilterChange(e)}
                                        input={<OutlinedInput label="Sort By" />}
                                        sx={{ pr: 5, pl: 1, minWidth: 180 }}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 48 * 4.5 + 8
                                                }
                                            }
                                        }}
                                    >
                                        {_.map(orderFieldsList, ({ label, value }: any) => (
                                            <MenuItem key={value} value={value}>
                                                {label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <IconButton onClick={() => toggleOrdering()}>
                                    {orderDirection === 'DESC' ? <IconSortDescending /> : <IconSortAscending />}
                                </IconButton>
                                <IconButton onClick={() => updatePage(1, true)}>
                                    <RefreshOutlined />
                                </IconButton>
                            </Box>
                        )
                    }
                    contentSX={{
                        p: 0
                    }}
                >
                    {/* Content */}

                    <Box sx={{ mt: '8px', width: '100%', px: '0px', position: 'relative' }}>
                        {header}
                        {sticky > 108 && <Box sx={{ width: '100%', height: 48 }}>&nbsp;</Box>}
                        <InfiniteScroll
                            loadMore={getPage}
                            hasMore
                            loader={<LinearProgress key="loadMore" sx={{ mt: 4 }} color="secondary" />}
                        >
                            <Grid container spacing={1} ref={ref}>
                                {_.map(tokens, (token, key) => (
                                    <TokenRow {...token} key={key} />
                                ))}
                                {isLoading && _.range(0, 50).map((i) => <TokenRow isLoading index={i} key={i} />)}
                            </Grid>
                        </InfiniteScroll>
                    </Box>
                </MainCard>
            </TabContext>
        </>
    );
}

export default TokensHomes;
