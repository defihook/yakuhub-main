/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable react/button-has-type */
import { useWallet } from '@solana/wallet-adapter-react';
import { useRecoilState } from 'recoil';
import {
    filteredListingAtom,
    walletBalanceAtom,
    snipingCollectionAtom,
    showSearchAtom,
    searchResultAtom,
    localCollectionDataAtom,
    localCollectionDataPriceAtom,
    rarityDataAtom,
    fpAtom
} from 'views/yaku/sniping/recoil/atom/HaloLabsAtom';
import { useEffect, useState } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import solanaLogo from '../../../assets/images/icons/solana.png';
import MEMarketLogo from '../../../assets/images/icons/MEMarketLogo.png';
import FilterIcon from '../../../assets/images/icons/FilterIcon.png';
import FilteredListings from './FilteredListings';
import '../rainbow.css';
import SelectedCollection from './SelectedCollection';
import SearchResults from './SearchResults';
import useWebSocket from 'react-use-websocket';
import { cloneDeep, each, isEmpty } from 'lodash';
import { Box, Grid, OutlinedInput, InputAdornment, styled, Typography, useTheme, Button, IconButton, LinearProgress } from '@mui/material';
import { IconSearch } from '@tabler/icons';
import { shouldForwardProp } from '@mui/system';
import { DeleteOutline, RefreshOutlined } from '@mui/icons-material';
import { SNIPER_SOCKET } from 'config/config';
import { LoadingButton } from '@mui/lab';
import { FormattedMessage } from 'react-intl';
import useConnections from 'hooks/useConnetions';
import { useMECollections } from 'contexts/MECollectionsContext';
import TopAlert from 'views/dashboard/components/TopAlert';
import axios from 'axios';

const OutlineInputStyle = styled(OutlinedInput, { shouldForwardProp })(({ theme }) => ({
    width: '100%',
    marginLeft: 16,
    paddingLeft: 16,
    paddingRight: 16,
    marginBottom: 16,
    '& input': {
        background: 'transparent !important',
        paddingLeft: '4px !important'
    },
    [theme.breakpoints.down('lg')]: {
        width: '100%'
    },
    [theme.breakpoints.down('md')]: {
        width: '100%',
        background: theme.palette.mode === 'dark' ? theme.palette.dark[800] : '#fff'
    }
}));

const Sniper = ({ buyNow }: any) => {
    const UI_LIMITED_SIZE = 50;
    const { connection } = useConnections();
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useRecoilState(showSearchAtom);
    const [searchResult, setSearchResult] = useRecoilState<any[]>(searchResultAtom);
    const [snipingCollection, setSnipingCollection] = useRecoilState<any[]>(snipingCollectionAtom);
    const [localCollectionData, setLocalCollectionData] = useRecoilState<any>(localCollectionDataAtom);
    const [localCollectionDataPrice, setLocalCollectionDataPrice] = useRecoilState<any>(localCollectionDataPriceAtom);
    const [rarityData, setRarityData] = useRecoilState<any>(rarityDataAtom);
    const [fp, setFp] = useRecoilState(fpAtom);
    const [walletBalance, setWalletBalance] = useRecoilState(walletBalanceAtom);
    const [filteredListing, setFilteredListings] = useRecoilState<any[]>(filteredListingAtom);
    const [isLoading, setIsLoading] = useState(false);
    const wallet = useWallet();
    const theme = useTheme();
    const { MECollections, fetchCollections } = useMECollections();
    const showFilter = false;

    const ws = useWebSocket(`${SNIPER_SOCKET}`, {
        onOpen: () => console.log('opened'),
        shouldReconnect: () => true,
        reconnectAttempts: 10000,
        share: true,
        onMessage: ({ data }: any) => {
            processNewListings(JSON.parse(data.toString()));
        }
    });

    const processNewListings = async (newListing: any) => {
        let matches = false;
        let autobuy = false;
        if (isEmpty(localCollectionData)) {
            const newFilterListings = [newListing].concat(cloneDeep(filteredListing));
            setFilteredListings(newFilterListings.slice(0, UI_LIMITED_SIZE));
            return;
        }
        // GOES THROUGH ALL THE TRACKED COLLECTIONS
        each(Object.keys(localCollectionData), (key) => {
            if (!localCollectionData[key]) {
                return true;
            }
            if (newListing.listingInfo.collection === localCollectionData[key].collectionSymbol) {
                console.log('Found a collection match. NFT Data:', newListing, ' Tracked Listings: ', localCollectionData);
                console.log('Key:', key);

                if (newListing.listingInfo !== -1) {
                    console.log(
                        'Incoming feed',
                        newListing.listingInfo.collection,
                        newListing.MEData.price,
                        'Max Cap:',
                        localCollectionDataPrice[key].price
                    );
                }
            }
            // IF STATEMENT CHECKS ->
            // MATCHES = HAVE THIS NFT ALREADY MATCHED CRITERIAS FROM ANOTHER SELECTED COLLECTION
            // IF THE PRICE OF THIS NFT IS LESS THAN THE SET COLLECTION PRICE
            // IF THE LISTING INFORMATION HAS BEEN PROVIDED BY THE WEBSOCKET
            // IF THE NFT'S COLLECTION SYMBOL MATCHES THE TRACKED COLLECTION
            if (
                !matches &&
                Number(newListing.MEData.price) <= Number(localCollectionDataPrice[key].price) &&
                newListing.listingInfo !== -1 &&
                newListing.listingInfo.collection === localCollectionData[key].collectionSymbol
            ) {
                console.log(newListing.listingInfo.collection, newListing.MEData.price, localCollectionDataPrice[key].price);
                console.log('NFT matches price.');
                console.log(
                    `Double checking: is listing price (${newListing.MEData.price}) LESS THAN/EQUAL TO set price of (${localCollectionData[key].price})? `,
                    Number(newListing.MEData.price) <= Number(localCollectionData[key].price)
                );
                // checks if rarity data is available - rarity can be selected only if hasRarityData is true
                // also checks if the rarity data is actually available to use - it should be, but better safe than sorry
                if (localCollectionData[key].hasRarityData && localCollectionData[key].collectionSymbol in rarityData) {
                    // checks if the mintToken is in our rarity data
                    if (newListing.MEData.tokenMint in rarityData[localCollectionData[key].collectionSymbol].rankings) {
                        // goes through each ranking toggles
                        each(Object.keys(localCollectionData[key].rarity), (rankingKey) => {
                            // if the current rank is enabled by the user, and the rarity of the received NFT is within this rarity category,
                            // then we make matches = true (signals that this NFT is to be bought)
                            // we also check if autobuy is enabled
                            if (
                                localCollectionData[key].rarity[rankingKey] &&
                                Number(
                                    rarityData[localCollectionData[key].collectionSymbol].rankings[newListing.MEData.tokenMint].item.rank
                                ) >= Number(rarityData[localCollectionData[key].collectionSymbol].division[rankingKey].Rarest) &&
                                Number(
                                    rarityData[localCollectionData[key].collectionSymbol].rankings[newListing.MEData.tokenMint].item.rank
                                ) <= Number(rarityData[localCollectionData[key].collectionSymbol].division[rankingKey].Unique)
                            ) {
                                console.log(
                                    `NFT matches rarity data. NFT Rarity: ${
                                        rarityData[localCollectionData[key].collectionSymbol].rankings[newListing.MEData.tokenMint].item
                                            .rank
                                    }. Matched at rarity ${rankingKey}. Ranking division:`,
                                    rarityData[localCollectionData[key].collectionSymbol].division
                                );
                                autobuy = localCollectionData[key].autoSnipe;
                                matches = true;
                            }
                        });
                    }
                    // if rarity daya isn't available, user couldn't set a rarity choice, so the user chose to buy ANY rarity NFT at this price
                    // so we set matches = true, and check if autobuy is enabled
                } else if (!localCollectionData[key].hasRarityData) {
                    console.log(`NFT HAS NO rarity data. Matched due to price.`);
                    autobuy = localCollectionData[key].autoSnipe;
                    matches = true;
                }
            }

            return true;
        });
        // if matches, we proceed with the buying procedure
        if (matches) {
            // before buying, we get the actual rarity category of the NFT (for visual purpose in the NFt listing)
            if (newListing.listingInfo.collection in rarityData) {
                each(Object.keys(rarityData[newListing.listingInfo.collection].division), (rarityKey) => {
                    if (
                        Number(rarityData[newListing.listingInfo.collection].rankings[newListing.MEData.tokenMint].item.rank) >=
                            Number(rarityData[newListing.listingInfo.collection].division[rarityKey].Rarest) &&
                        Number(rarityData[newListing.listingInfo.collection].rankings[newListing.MEData.tokenMint].item.rank) <=
                            Number(rarityData[newListing.listingInfo.collection].division[rarityKey].Unique)
                    ) {
                        newListing.rankingInfo = {
                            rankingCategory: rarityKey,
                            rarity: Number(rarityData[newListing.listingInfo.collection].rankings[newListing.MEData.tokenMint].item.rank),
                            totalSeen: Number(rarityData[newListing.listingInfo.collection].division.C.Unique)
                        };
                    }
                });
            }
            // we add this NFt to the listings so that users can see
            const newFilterListings = [newListing].concat(cloneDeep(filteredListing));
            setFilteredListings(newFilterListings.slice(0, UI_LIMITED_SIZE));
            console.log('NFT matches criteria.');
            console.log('Listings:', newFilterListings);
            // if autobuy is on, we proceed to buy it.
            if (autobuy) {
                console.log('Autobuy turned on.');
                await buyNow(newListing.MEData, newListing.timeListed + newListing.MEData.tokenMint + String(newListing.MEData.price));
                await getBalance();
            }
        }
    };

    const collectionSearch = async (searchStr: string) => {
        setSearch(searchStr);
        if (!MECollections.length && !isLoading) {
            await initializeData();
        }
        if (searchStr.length > 1) {
            const searchRes = MECollections.filter((obj: any) =>
                String(obj.name).toLowerCase().replace(/\s/g, '').includes(searchStr.toLowerCase().replace(/\s/g, ''))
            );

            setSearchResult(searchRes);
            if (!showSearch) {
                setShowSearch(true);
            }
        } else {
            setSearchResult([]);
            setShowSearch(false);
        }
    };

    const closeSearch = () => {
        setShowSearch(false);
    };

    const getBalance = async () => {
        if (wallet.publicKey === null) {
            return -1;
        }
        try {
            const balance = (await connection.getBalance(wallet.publicKey)) / LAMPORTS_PER_SOL;
            setWalletBalance(String(balance));
            return 1;
        } catch (err) {
            return -1;
        }
    };

    const clearListings = () => {
        setFilteredListings([]);
    };

    function randomString() {
        const mask = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        // eslint-disable-next-line no-plusplus
        for (let i = 16; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
        return result;
    }

    const calcRarest = (size: number, factor: number) => {
        const ceil = Math.ceil(size * factor);
        return ceil === Math.floor(size * factor) ? ceil + 1 : ceil;
    };

    const addCollection = async (collectionData: any) => {
        const collectionToAdd = cloneDeep(collectionData);
        const idVal = collectionData.symbol + String(Date.now()) + randomString();
        collectionToAdd.id = idVal;
        const allSnipingCollections = cloneDeep(snipingCollection);
        allSnipingCollections.push(collectionToAdd);
        let allLocalData = cloneDeep(localCollectionData);
        const allLocalDataPrice = cloneDeep(localCollectionDataPrice);
        allLocalDataPrice[idVal] = { price: 500 };

        allLocalData[idVal] = {
            collectionSymbol: collectionData.symbol,
            hasRarityData: false,
            rarity: {
                C: true,
                U: true,
                R: true,
                E: true,
                L: true,
                M: true
            },
            autoSnipe: false,
            price: 500
        };

        if (isEmpty(localCollectionData)) {
            clearListings();
        }

        setLocalCollectionDataPrice(allLocalDataPrice);
        setLocalCollectionData(allLocalData);
        setSnipingCollection(allSnipingCollections);

        let statsAndRank: any = {};

        // get fp
        if (!(collectionData.symbol in fp)) {
            let fpData = { lastUpdate: Date.now(), fp: 0 };
            try {
                ({ data: statsAndRank } = await axios.post('https://proxy.yaku.ai/api/me/collections/rank', {
                    symbol: collectionData.symbol
                }));
                if (statsAndRank) {
                    fpData = { lastUpdate: Date.now(), fp: statsAndRank.floorPrice / LAMPORTS_PER_SOL };
                }
            } catch (error) {
                console.error(error);
            }
            const allFp: any = cloneDeep(fp);
            allFp[collectionData.symbol] = fpData;
            setFp(allFp);
        }

        // gets ranking
        if (!(collectionData.symbol in rarityData)) {
            let rankingResp: any = { status: 'Unsuccessful', data: [] };
            try {
                if (!statsAndRank) {
                    ({ data: statsAndRank } = await axios.post('https://proxy.yaku.ai/api/me/collections/rank', {
                        symbol: collectionData.symbol
                    }));
                }
                if (statsAndRank?.ranking && statsAndRank?.ranking.length > 0) {
                    rankingResp = { status: 'Successful', data: statsAndRank.ranking };
                }
            } catch (error) {
                console.error(error);
            }
            if (rankingResp.status === 'Successful' && rankingResp.data) {
                allLocalData = cloneDeep(localCollectionData);
                const newRarityData = cloneDeep(rarityData);
                const collectionSize = rankingResp.data.length;

                const rarityDiv = {
                    C: {
                        Rarest: calcRarest(collectionSize, 0.6),
                        Unique: collectionSize
                    },
                    U: {
                        Rarest: calcRarest(collectionSize, 0.35),
                        Unique: Math.floor(collectionSize * 0.6)
                    },
                    R: {
                        Rarest: calcRarest(collectionSize, 0.15),
                        Unique: Math.floor(collectionSize * 0.35)
                    },
                    E: {
                        Rarest: calcRarest(collectionSize, 0.05),
                        Unique: Math.floor(collectionSize * 0.15)
                    },
                    L: {
                        Rarest: calcRarest(collectionSize, 0.01),
                        Unique: Math.floor(collectionSize * 0.05)
                    },
                    M: { Rarest: 0, Unique: Math.floor(collectionSize * 0.01) }
                };

                console.log('Rarity division:', rarityDiv);
                const filteredRankData = Object.assign(
                    {},
                    ...rankingResp.data.map((item: any) => ({
                        [item.mint]: { item }
                    }))
                );

                newRarityData[collectionData.symbol] = {
                    division: rarityDiv,
                    rankings: filteredRankData
                };
                allLocalData[idVal] = {
                    collectionSymbol: collectionData.symbol,
                    hasRarityData: true,
                    rarity: {
                        C: true,
                        U: true,
                        R: true,
                        E: true,
                        L: true,
                        M: true
                    },
                    autoSnipe: false,
                    price: 500
                };

                setRarityData(newRarityData);
                setLocalCollectionData(allLocalData);
            }
        } else {
            console.log(`Rarity for ${collectionData.symbol} is already loaded.`);
            allLocalData = cloneDeep(localCollectionData);
            allLocalData[idVal] = {
                collectionSymbol: collectionData.symbol,
                hasRarityData: true,
                rarity: {
                    C: true,
                    U: true,
                    R: true,
                    E: true,
                    L: true,
                    M: true
                },
                autoSnipe: false,
                price: 500
            };
            setLocalCollectionData(allLocalData);
        }
    };

    const removeCollection = (collectionToRemove: any) => {
        const stringifyCollection = JSON.stringify(collectionToRemove);
        let filtered = cloneDeep(snipingCollection);
        const oldLocalData = cloneDeep(localCollectionData);
        console.log('OldLocalData:', oldLocalData);
        console.log('OldSnipingCollection:', filtered);
        filtered = snipingCollection.filter((currCollection) => JSON.stringify(currCollection) != stringifyCollection);
        const newLocalData = oldLocalData;
        delete newLocalData[collectionToRemove.id];
        console.log('NewLocalData:', newLocalData);
        console.log('newSnipingCollection:', filtered);
        setLocalCollectionData(newLocalData);
        setSnipingCollection(filtered);
    };

    const initializeData = async (forceReload = false) => {
        try {
            setIsLoading(true);
            if (!MECollections || !MECollections?.length || forceReload) {
                await fetchCollections();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const dataGetter = async () => {
        const newFpData: any = cloneDeep(fp);
        const addedCollections: any[] = [];

        if (Object.keys(snipingCollection).length > 0) {
            each(snipingCollection, async (snipingCollectionKey) => {
                if (!snipingCollection[snipingCollectionKey]) {
                    return true;
                }
                if (!addedCollections.includes(snipingCollection[snipingCollectionKey].collectionSymbol)) {
                    addedCollections.push(snipingCollection[snipingCollectionKey].collectionSymbol);

                    let fpData = { lastUpdate: Date.now(), fp: 0 };
                    try {
                        const { data: statsAndRank } = await axios.post('https://proxy.yaku.ai/api/me/collections/stats', {
                            symbol: snipingCollection[snipingCollectionKey].symbol
                        });
                        if (statsAndRank) {
                            fpData = { lastUpdate: Date.now(), fp: statsAndRank.floorPrice / LAMPORTS_PER_SOL };
                        }
                    } catch (error) {
                        console.error(error);
                    }

                    newFpData[snipingCollection[snipingCollectionKey].collectionSymbol] = fpData;
                }

                return true;
            });
        }

        setFp(newFpData);
    };

    const handleBuyNow = async (MEData: any, identifier: never) => {
        await buyNow(MEData, identifier, false);
        await getBalance();
    };

    useEffect(() => {
        const collectionInterval = setInterval(() => {
            dataGetter();
        }, 20000);

        return () => clearInterval(collectionInterval);
    }, [fp]);

    useEffect(() => {
        if (!wallet.publicKey) {
            setWalletBalance('N/A');
        } else {
            getBalance();
        }
    }, [wallet.publicKey]);

    useEffect(() => {
        initializeData();
    }, []);

    return (
        <Box
            sx={{
                height: 'calc(100vh - 215px)',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main
            }}
        >
            {/* <TopAlert
                description="Due to recent changes in the MagicEden contracts, the sniper tool will be taken down till the codebase is adjusted
                accordingly."
            /> */}
            {/** SLOPE WARNING START */}
            <Box sx={{ width: '100%', display: 'flex', fontSize: '10px', gap: '5px', alignItems: 'center', paddingTop: '60px' }}>
                <FormattedMessage id="need-auto-approve" />
            </Box>
            {/** SLOPE WARNING ENNDS */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row-reverse',
                    marginBottom: '1rem',
                    marginTop: { xs: '0.875rem', md: '-44px' },
                    width: '100%',
                    minHeight: '44px',
                    maxHeight: '44px',
                    alignItems: 'center'
                }}
            >
                <Box
                    sx={{
                        minHeight: '100%',
                        maxHeight: '100%',
                        borderRadius: '10px',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary[200] + 75,
                        backgroundColor: theme.palette.background.default,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '14px 13px',
                        gap: '5px'
                    }}
                >
                    <Typography
                        component="div"
                        sx={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main
                        }}
                    >
                        {(+walletBalance || 0).toFixed(3)}
                    </Typography>
                    <img
                        src={solanaLogo}
                        alt="SOL"
                        style={{
                            height: 15,
                            width: 15,
                            padding: 0,
                            margin: 0
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        minHeight: '100%',
                        maxHeight: '100%',
                        borderRadius: '10px',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary[200] + 75,
                        backgroundColor: theme.palette.background.default,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '14px 13px',
                        marginRight: '0.875rem'
                    }}
                >
                    <Typography
                        component="div"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 14,
                            color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main
                        }}
                        noWrap
                    >
                        <img
                            src={MEMarketLogo}
                            alt="ME"
                            style={{
                                height: 20,
                                width: 20,
                                padding: 0,
                                margin: 0,
                                marginRight: '5px'
                            }}
                        />
                        {MECollections.length}
                        <Typography component="span" sx={{ ml: '2px' }} display={{ xs: 'none', md: 'block' }}>
                            <FormattedMessage id="collections-loaded" />
                        </Typography>
                    </Typography>
                </Box>
                <Box
                    sx={{
                        minHeight: '100%',
                        maxHeight: '100%',
                        borderRadius: '10px',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary[200] + 75,
                        backgroundColor: theme.palette.background.default,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '14px 13px',
                        marginRight: '0.875rem'
                    }}
                >
                    <LoadingButton
                        loadingPosition="start"
                        startIcon={<RefreshOutlined />}
                        onClick={() => initializeData(true)}
                        loading={isLoading}
                    >
                        <Typography component="p" display={{ xs: 'none', md: 'block' }}>
                            <FormattedMessage id="reload-me-collection" />
                        </Typography>
                        <Typography component="p" display={{ xs: 'block', md: 'none' }}>
                            <FormattedMessage id="reload" />
                        </Typography>
                    </LoadingButton>
                </Box>
            </Box>
            <Grid
                container
                spacing={4}
                sx={{
                    overflowY: 'auto',
                    width: '100%',
                    height: '100%',
                    marginLeft: 0,
                    marginTop: 0,
                    '.MuiGrid-item': {
                        paddingTop: 0,
                        paddingLeft: '1rem'
                    }
                }}
            >
                {/** COLLECTION SELECTION START */}
                <Grid
                    item
                    xs={12}
                    md={5}
                    lg={4}
                    xl={3}
                    sx={{
                        position: 'relative',
                        backgroundColor: theme.palette.background.default,
                        borderRadius: '10px',
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                        borderColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary[200] + 75,
                        borderStyle: 'solid',
                        borderWidth: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        height: { xs: 240, md: '100%' },
                        width: '100%'
                    }}
                >
                    <FormattedMessage id="collection-here">
                        {(msg) => (
                            <OutlineInputStyle
                                id="input-search-header"
                                value={search}
                                fullWidth
                                onChange={(e) => collectionSearch(e.target.value)}
                                placeholder={`${msg}`}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <IconSearch stroke={1.5} size="1rem" color={theme.palette.grey[500]} />
                                    </InputAdornment>
                                }
                                sx={{ marginTop: '24px', marginLeft: 0 }}
                                aria-describedby="search-helper-text"
                                inputProps={{ 'aria-label': 'weight' }}
                            />
                        )}
                    </FormattedMessage>

                    <Box
                        sx={{
                            minWidth: '100%',
                            minHeight: 0,
                            maxHeight: '100%',
                            overflowY: 'auto',
                            scrollbarWidth: 0,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {!isLoading &&
                            snipingCollection.map((curr: any) => (
                                <SelectedCollection key={curr.id} collectionData={curr} removeCollection={removeCollection} />
                            ))}
                        {isLoading && <LinearProgress color="secondary" />}
                        {!isLoading && MECollections.length === 0 && (
                            <Button variant="outlined" sx={{ width: '100%' }} onClick={() => initializeData(true)}>
                                <FormattedMessage id="refresh-collections-data" />
                            </Button>
                        )}
                    </Box>
                    {/** SEARCH RESULT START */}
                    {showSearch && (
                        <Box
                            sx={{
                                position: 'absolute',
                                zIndex: 30,
                                width: '100%',
                                inset: 0,
                                top: '87.59px',
                                background: theme.palette.mode === 'dark' ? theme.palette.dark[800] : '#fff'
                            }}
                        >
                            <SearchResults closeSearch={closeSearch} addCollection={addCollection} />
                        </Box>
                    )}
                    {/** SEARCH RESULT END */}
                </Grid>
                {/** COLLECTION SELECTION END */}
                {/** LIVE LISTINGS START */}
                <Grid
                    item
                    xs={12}
                    md={7}
                    lg={8}
                    xl={9}
                    sx={{
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'hidden',
                        height: '100%',
                        width: '100%',
                        paddingTop: { xs: 2, md: 0 },
                        paddingLeft: { xs: 0, md: 2 },
                        '&.MuiGrid-item': {
                            paddingLeft: { xs: 0, md: 2 },
                            paddingTop: { xs: 2, md: 0 }
                        }
                    }}
                >
                    {/** FILTER AND LIVE DIV START */}
                    <Grid
                        container
                        sx={{
                            width: '100%',
                            maxWidth: '100%',
                            minHeight: '53px',
                            height: '53px',
                            backgroundColor: theme.palette.background.default,
                            borderTopLeftRadius: '10px',
                            borderTopRightRadius: '10px',
                            padding: '1rem',
                            borderColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary[200] + 75,
                            borderStyle: 'solid',
                            borderWidth: 1,
                            borderBottom: 0,
                            alignContent: 'center',
                            justifyItems: 'center',
                            overflowY: 'hidden',
                            '.MuiGrid-item': {
                                paddingLeft: 0
                            }
                        }}
                    >
                        {showFilter && (
                            <Grid
                                item
                                xs={4}
                                sx={{
                                    justifyContent: 'flex-start',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <Button
                                    sx={{
                                        padding: '5px 11px',
                                        borderRadius: '5px',
                                        gap: '10px'
                                    }}
                                    variant="outlined"
                                    color="secondary"
                                    disabled
                                >
                                    <img src={FilterIcon} alt={FilterIcon} style={{ height: 10, width: 8.4 }} />
                                    <Typography
                                        component="div"
                                        sx={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main
                                        }}
                                    >
                                        <FormattedMessage id="filters" />
                                    </Typography>
                                </Button>
                            </Grid>
                        )}
                        <Grid
                            item
                            xs={showFilter ? 4 : 6}
                            sx={{
                                display: 'flex',
                                gap: '6.5px',
                                justifyContent: showFilter ? 'center' : 'flex-start',
                                alignItems: 'center',
                                color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
                                fontWeight: 700,
                                fontSize: 12,
                                position: 'relative'
                            }}
                        >
                            {ws?.readyState !== 1 ? (
                                <Typography
                                    component="span"
                                    sx={{
                                        display: 'flex',
                                        height: 9,
                                        width: 9
                                    }}
                                >
                                    <span
                                        style={{
                                            position: 'absolute',
                                            display: 'inline-flex',
                                            height: 9,
                                            width: 9,
                                            borderRadius: 5000,
                                            backgroundColor: '#FF0000',
                                            opacity: 0.75
                                        }}
                                        className="animate-ping"
                                    />
                                    <span
                                        style={{
                                            position: 'relative',
                                            display: 'inline-flex',
                                            borderRadius: 5000,
                                            height: 9,
                                            width: 9,
                                            backgroundColor: '#FF0000'
                                        }}
                                    />
                                </Typography>
                            ) : (
                                <Typography component="div" className="blink" />
                            )}
                            <div>
                                <FormattedMessage id={ws?.readyState === 1 ? 'live' : 'stop'} />
                            </div>
                        </Grid>
                        <Grid
                            item
                            xs={showFilter ? 4 : 6}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end'
                            }}
                        >
                            <IconButton
                                sx={{
                                    padding: '5px 3px',
                                    borderRadius: '5px',
                                    color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main
                                }}
                                color="error"
                                onClick={() => clearListings()}
                            >
                                <DeleteOutline />
                            </IconButton>
                        </Grid>
                    </Grid>
                    {/** FILTER AND LIVE DIV END */}
                    {/** LISTINGS START */}
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: '100%',
                            height: '100%',
                            maxHeight: '100%',
                            backgroundColor: theme.palette.background.default,
                            padding: '0 0.875rem 0.875rem',
                            borderBottomLeftRadius: '10px',
                            borderBottomRightRadius: '10px',
                            overflowY: 'hidden',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            borderColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary[200] + 75
                        }}
                    >
                        <FilteredListings buyNow={handleBuyNow} />
                    </Box>
                    {/** LISTINGS END */}
                </Grid>
                {/** LIVE LISTINGS END */}
            </Grid>
        </Box>
    );
};

export default Sniper;
