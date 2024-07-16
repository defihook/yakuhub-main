/* eslint-disable */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import { Grid, Stack, Box, InputAdornment, OutlinedInput, Button, Tab, Typography, Skeleton } from '@mui/material';

// web3 imports
import { getRaffleGlobalState } from 'actions/raffle';

// project imports
import RaffleCard from './RaffleCard';

// assets
import { IconSearch } from '@tabler/icons';
import { shouldForwardProp } from '@mui/system';

// third-party
import 'react-alice-carousel/lib/scss/alice-carousel.scss';
import { useWallet } from '@solana/wallet-adapter-react';
import { adminValidation } from 'actions/shared';
import { filter, find, get, isString, map, toLower } from 'lodash';
import { TabContext } from '@mui/lab';
import { TabPanel } from '@mui/lab';
import { FormattedMessage } from 'react-intl';
import { getRaffleData } from './fetchData';
import { Promise } from 'bluebird';
import AliceCarousel from 'react-alice-carousel';
import RaffleCarouselCard from './RaffleCarouselCard';
import useConnections from 'hooks/useConnetions';
import RaffleCardSkeleton from './RaffleCardSkeleton';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import { queries } from '../../../graphql/graphql';
import axios from 'axios';

// styles
const OutlineInputStyle = styled(OutlinedInput, { shouldForwardProp })(({ theme }) => ({
    width: 434,
    marginLeft: 16,
    paddingLeft: 16,
    paddingRight: 16,
    '& input': {
        background: 'transparent !important',
        paddingLeft: '4px !important'
    },
    [theme.breakpoints.down('lg')]: {
        width: 250
    },
    [theme.breakpoints.down('md')]: {
        width: '100%',
        marginLeft: 4,
        background: theme.palette.mode === 'dark' ? theme.palette.dark[800] : '#fff'
    }
}));

const responsive = {
    0: { items: 1 },
    568: { items: 2 },
    1024: { items: 3 }
};

const Raffles = () => {
    const showFeatures = false;
    const theme = useTheme();
    const wallet = useWallet();
    const navigate = useNavigate();
    const { publicKey } = wallet;

    const [isAdmin, setIsAdmin] = useState(false);
    const [search, setSearch] = useState('');

    const [masterRaffles, setMasterRaffles] = useState<any>([]);
    const [searchResult, setSearchResult] = useState<any>([]);
    const [loading, setLoading] = useState(false);
    const [tabIdx, setTabIdx] = useState('all');
    const [fetchMetadatas] = useAuthLazyQuery(queries.GET_NFTS_BY_MINT, {
        fetchPolicy: 'network-only'
    });
    const baseURL = 'https://nft.yaku.ai/api';

    const getRaffleList = async () => {
        setLoading(true);
        try {
            const { data: res } = await axios.post('https://nft.yaku.ai/api/raffle', {
                wallet: wallet.publicKey?.toBase58()
            });
            const list: Array<any> = [];

            if (res !== undefined && res !== null && res?.length !== 0) {
                const { data: nftData } = await axios.post(`${baseURL}/metadata/fetch`, {
                    mint: map(res, ({ raffleData: { nftMint } }: any) => nftMint)
                });
                await Promise.mapSeries(res, async ({ raffleKey, raffleData }: any, idx) => {
                    if (raffleData !== null) {
                        const nftMint = raffleData.nftMint;

                        const nftItem = find(nftData, ({ mint }: any) => mint === nftMint);
                        let { mint, metadata } = nftItem;
                        if (!get(metadata, 'json.image', '')) {
                            const { data: itemData } = await axios.post(`${baseURL}/metadata/fetch`, {
                                mint: nftMint
                            });
                            ({ mint, metadata } = itemData[0]);
                        }
                        const item = { ...metadata, ...(metadata.json || {}), mint, raffleKey, raffleData };
                        list.push(item);
                    }
                });
                list.sort((a, b) => b.raffleData.end - a.raffleData.end);
            }
            setMasterRaffles(list);
            setSearchResult([...list]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event: any) => {
        const {
            target: { value }
        } = event;
        setSearch(value);
        if (value && isString(value) && value.length > 0 && masterRaffles.length > 0) {
            setSearchResult(
                filter(
                    masterRaffles,
                    ({ name = '', family = '' }) => toLower(name).includes(toLower(value)) || toLower(family).includes(toLower(value))
                )
            );
        } else {
            setSearchResult([...masterRaffles]);
        }
    };

    const updatePage = async () => {
        setLoading(true);
        const admin = adminValidation(publicKey);
        setIsAdmin(admin);
        await getRaffleList();
        setLoading(false);
    };

    useEffect(() => {
        updatePage();
    }, [publicKey]);

    return (
        <TabContext value={tabIdx}>
            <Grid container spacing={2.5}>
                {/* featured section / carousel */}
                {showFeatures &&
                    filter(masterRaffles, ({ raffleData }: any) => raffleData.featured && raffleData.end > new Date().getTime()).length >
                        2 && (
                        <>
                            <Grid item xs={12}>
                                <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '1.5rem', py: 2 }}>
                                    <FormattedMessage id="featured-raffles" />
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sx={{ pt: '0 !important' }}>
                                {/* eslint-disable */}
                                <AliceCarousel
                                    autoPlay={true}
                                    infinite={true}
                                    autoPlayInterval={3500}
                                    responsive={responsive}
                                    disableButtonsControls
                                >
                                    {map(
                                        filter(
                                            masterRaffles,
                                            ({ raffleData }: any) => raffleData.featured && raffleData.end > new Date().getTime()
                                        ),
                                        (item: any, key: number) => (
                                            <Grid key={key} item xs={11.5}>
                                                <RaffleCarouselCard key={key} {...item} />
                                            </Grid>
                                        )
                                    )}
                                </AliceCarousel>
                            </Grid>
                        </>
                    )}
                {/* buttons / search / filter */}
                <Grid item xs={12}>
                    <Stack justifyContent="space-between" alignItems="center" sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
                        <Box>
                            {showFeatures &&
                                filter(masterRaffles, ({ raffleData }: any) => raffleData.featured && raffleData.end > new Date().getTime())
                                    .length > 2 && (
                                    <Button
                                        variant={tabIdx === 'featured' ? 'contained' : 'text'}
                                        color={tabIdx === 'featured' ? 'secondary' : 'primary'}
                                        sx={{ borderRadius: 2 }}
                                        onClick={() => setTabIdx('featured')}
                                    >
                                        <FormattedMessage id="featured" />
                                    </Button>
                                )}
                            <Button
                                variant={tabIdx === 'all' ? 'contained' : 'text'}
                                color={tabIdx === 'all' ? 'secondary' : 'primary'}
                                sx={{ borderRadius: 2, mb: { xs: 2, md: 0 } }}
                                onClick={() => setTabIdx('all')}
                            >
                                <FormattedMessage id="all-raffles" />
                            </Button>

                            <Button
                                variant={tabIdx === 'live' ? 'contained' : 'text'}
                                color={tabIdx === 'live' ? 'secondary' : 'primary'}
                                sx={{ ml: 2, borderRadius: 2, mb: { xs: 2, md: 0 } }}
                                onClick={() => setTabIdx('live')}
                            >
                                <FormattedMessage id="live-raffles" />
                            </Button>

                            <Button
                                variant={tabIdx === 'ended' ? 'contained' : 'text'}
                                color={tabIdx === 'ended' ? 'secondary' : 'primary'}
                                sx={{ ml: 2, borderRadius: 3, mb: { xs: 2, md: 0 } }}
                                onClick={() => setTabIdx('ended')}
                            >
                                <FormattedMessage id="concluded-raffles" />
                            </Button>
                        </Box>
                        <Box sx={{ display: 'block' }}>
                            {isAdmin && (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    sx={{ ml: 2, borderRadius: 3 }}
                                    onClick={() => navigate('/applications/raffles/create')}
                                >
                                    <FormattedMessage id="create-raffle" />
                                </Button>
                            )}

                            <OutlineInputStyle
                                id="input-search-header"
                                value={search}
                                onChange={(e) => handleSearch(e)}
                                placeholder="Search"
                                startAdornment={
                                    <InputAdornment position="start">
                                        <IconSearch stroke={1.5} size="1rem" color={theme.palette.grey[500]} />
                                    </InputAdornment>
                                }
                                sx={{ width: 250 }}
                                aria-describedby="search-helper-text"
                                inputProps={{ 'aria-label': 'weight' }}
                            />
                        </Box>
                    </Stack>
                </Grid>

                {/* Content */}
                {showFeatures && (
                    <TabPanel value="featured" sx={{ width: '100%' }}>
                        <Grid container spacing={3}>
                            {!loading ? (
                                <>
                                    {map(
                                        filter(
                                            searchResult,
                                            ({ raffleData }) => raffleData.featured && raffleData.end > new Date().getTime()
                                        ),
                                        (item: any, key: number) => (
                                            <Grid key={key} item xs={12} sm={6} md={4} lg={3}>
                                                <RaffleCard key={key} {...item} isAdmin={isAdmin} />
                                            </Grid>
                                        )
                                    )}
                                </>
                            ) : (
                                <>
                                    {map([1, 2, 3, 4], (key) => (
                                        <Grid key={key} item xs={12} sm={6} md={4} lg={3}>
                                            <RaffleCardSkeleton key={key} />
                                        </Grid>
                                    ))}
                                </>
                            )}
                        </Grid>
                    </TabPanel>
                )}
                <TabPanel value="all" sx={{ width: '100%' }}>
                    <Grid container spacing={3}>
                        {!loading ? (
                            map(searchResult, (item: any, key: number) => (
                                <Grid key={key} item xs={12} sm={6} md={4} lg={3}>
                                    <RaffleCard key={key} {...item} isAdmin={isAdmin} />
                                </Grid>
                            ))
                        ) : (
                            <>
                                {map([1, 2, 3, 4], (key) => (
                                    <Grid key={key} item xs={12} sm={6} md={4} lg={3}>
                                        <RaffleCardSkeleton key={key} />
                                    </Grid>
                                ))}
                            </>
                        )}
                    </Grid>
                </TabPanel>

                <TabPanel value="live" sx={{ width: '100%' }}>
                    <Grid container spacing={3}>
                        {!loading ? (
                            map(
                                filter(searchResult, ({ raffleData }) => raffleData.end > new Date().getTime()),
                                (item: any, key: number) => (
                                    <Grid key={key} item xs={12} sm={6} md={4} lg={3}>
                                        <RaffleCard key={key} {...item} isAdmin={isAdmin} />
                                    </Grid>
                                )
                            )
                        ) : (
                            <>
                                {map([1, 2, 3, 4], (key) => (
                                    <Grid key={key} item xs={12} sm={6} md={4} lg={3}>
                                        <RaffleCardSkeleton key={key} />
                                    </Grid>
                                ))}
                            </>
                        )}
                    </Grid>
                </TabPanel>

                <TabPanel value="ended" sx={{ width: '100%' }}>
                    <Grid container spacing={3}>
                        {!loading ? (
                            map(
                                filter(searchResult, ({ raffleData }) => raffleData.end <= new Date().getTime()),
                                (item: any, key: number) => (
                                    <Grid key={key} item xs={12} sm={6} md={4} lg={3}>
                                        <RaffleCard key={key} {...item} isAdmin={isAdmin} />
                                    </Grid>
                                )
                            )
                        ) : (
                            <>
                                {map([1, 2, 3, 4], (key) => (
                                    <Grid key={key} item xs={12} sm={6} md={4} lg={3}>
                                        <RaffleCardSkeleton key={key} />
                                    </Grid>
                                ))}
                            </>
                        )}
                    </Grid>
                </TabPanel>
            </Grid>
        </TabContext>
    );
};

export default Raffles;
