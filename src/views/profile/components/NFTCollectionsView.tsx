/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Avatar, Box, Button, Grid, LinearProgress, List, ListItem, Skeleton, Tab, Tooltip, Typography, useTheme } from '@mui/material';
import { queries } from '../../../graphql/graphql';
import useAuth from 'hooks/useAuth';
import useAuthQuery from 'hooks/useAuthQuery';
import { useNavigate } from 'react-router-dom';
import SolanaLogo from 'assets/images/icons/solana-logo.png';
import EthLogo from 'assets/images/blockchains/ethereum-icon.png';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { cloneDeep, filter, find, first, get, groupBy, isEmpty, isNaN, isString, map, orderBy, round, slice, sum, uniqBy } from 'lodash';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import TitlebarImageList from './TitlebarImageList';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import TokenPortfolioItem from './TokenPortfolioItem';
import TokensView from './TokensView';
import MEActivitiesList from './MEActivitiesList';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useSolPrice } from 'contexts/CoinGecko';
import useStaked from 'hooks/useStaked';
import { DomainByWallet, retrieveBatch } from 'utils/bonfida';
import DomainItems from './DomainItems';

const NFTCollectionsView = ({
    wallet,
    nfts,
    ethNfts = [],
    setOwnedNftCount,
    setNetWorth,
    setOwnedCollections
}: {
    wallet: string;
    nfts: { staked: any[]; nftsList: any[] };
    ethNfts: any[];
    setOwnedNftCount: Dispatch<SetStateAction<number>>;
    setNetWorth: Dispatch<SetStateAction<number>>;
    setOwnedCollections?: Dispatch<SetStateAction<any[]>>;
}) => {
    const theme = useTheme();
    const solPrice = useSolPrice();
    const { yakusFP, getStats } = useStaked();
    const auth = useAuth();
    const navigate = useNavigate();
    const [walletStats, setWalletStats] = useState<any>({});
    const [nftList, setNftList] = useState<any>([]);
    const [collections, setCollections] = useState<any>([]);
    const [ethCollections, setEthCollections] = useState<any>([]);
    const [listings, setListings] = useState<any>([]);
    const [tokensHist, setTokensHist] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<any>(false);

    const [tabIdx, setTabIdx] = useState('Collections');

    const { data } = useAuthQuery(queries.GET_WALLET_STATS, {
        variables: {
            condition: {
                searchAddress: wallet,
                timePeriod: 'ALL',
                includeUserRank: false
            }
        }
    });
    const { data: listingData, refetch: refetchListing } = useAuthQuery(queries.GET_USER_LISTINGS, {
        variables: {
            condition: {
                userAddress: wallet
            }
        }
    });

    const [getUserProfile] = useAuthLazyQuery(queries.GET_CORAL_USER_PROFILE);
    const [getTokensHist] = useAuthLazyQuery(queries.GET_TOKEN_HISTORY);
    const [fetchMetadatas] = useAuthLazyQuery(queries.GET_NFTS_BY_MINT, {
        fetchPolicy: 'network-only'
    });

    const getUserProfileNFTs = async (pubkey: string) => {
        const { data: profileData } = await getUserProfile({
            variables: {
                pubkey
            }
        });
        return profileData.getUserProfile || [];
    };

    const concatCollections = async (nftsList: any[]) => {
        let fps = yakusFP;
        if (!fps || isEmpty(fps)) {
            ({ yakusFP: fps } = await getStats());
        }
        const collectionsGroup = groupBy(nftsList, 'collectionName');
        const nftsCollection = map(Object.keys(collectionsGroup), (collection: string) => {
            const list = collectionsGroup[collection];
            const items = map(list, (itm: any) => {
                const staked = !!find(nfts.staked, ({ mint }) => mint === itm.mint);
                const result: any = cloneDeep(itm);
                if (staked) {
                    if (!result.collection) {
                        result.collection = { name: itm?.name?.split(' #')[0] };
                        result.project_id = 'yakux';
                    } else {
                        result.project_id = result.collection?.name === 'Capsule X' ? 'capsulex' : 'yakucorp1';
                    }
                }
                return {
                    ...result,
                    floor_price: (fps[result.project_id] || result.floor_price) / LAMPORTS_PER_SOL,
                    price: result.price ? result.price / LAMPORTS_PER_SOL : undefined,
                    listed: !!result.price,
                    staked,
                    owner: wallet,
                    collection_symbol: result.project_id || result.collection_symbol
                };
            });
            const firstItem = first(items);
            return {
                collection: collection || firstItem.name,
                image: firstItem.image || firstItem.original_image,
                video: firstItem.animation_url,
                count: list.length,
                items,
                floor_price: firstItem.floor_price || 0
            };
        });
        return {
            collections: nftsCollection
        };
    };

    const getNFTMetas = async (tokens: any[]) => {
        if (!tokens || !tokens.length) {
            return [];
        }
        const { data: metadatas } = await fetchMetadatas({
            variables: {
                mint: map(tokens, ({ mint }) => mint)
            }
        });
        const processedList = map(metadatas?.fetch, (item) => {
            const { metadata, mint } = item;
            const collection = metadata.collection || (metadata.name.includes(' #') ? first(metadata.name.split(' #')) : metadata.symbol);
            const project = isString(collection)
                ? { name: collection }
                : { ...collection, name: get(collection, 'name', get(collection, 'family')) };

            return {
                ...metadata,
                ...(metadata.json || {}),
                mint,
                project
            };
        });
        return processedList;
    };

    const getNFTs = async () => {
        if (!wallet || !nfts || (!nfts.staked?.length && !nfts.nftsList?.length)) {
            return;
        }
        if (isLoading) {
            return;
        }
        try {
            setIsLoading(true);
            setNftList([]);
            setCollections([]);
            setTokensHist([]);
            refetchListing();
            const fetchList = [...nfts.nftsList, ...nfts?.staked];
            const itemsList: any = map(await getNFTMetas(fetchList), (i) => ({ ...i, collectionName: i.project?.name ?? 'No Collection' }));
            const walletItemList = filter(
                map(await getUserProfileNFTs(wallet), (item) => ({
                    ...item,
                    collectionName: item.collection_name
                })),
                ({ collectionName }) => !!collectionName
            );
            let fps = yakusFP;
            if (!fps || isEmpty(fps)) {
                ({ yakusFP: fps } = await getStats());
            }
            const mergedList = map(itemsList, (i) => {
                const found = find(walletItemList, (itm) => itm.mint === i.mint);
                const staked = !!find(nfts.staked, ({ mint: mintAddr }) => mintAddr === i.mint);
                let project_id = i.project_id;
                let collection = i.collection;
                if (staked) {
                    if (!i.collection) {
                        collection = { name: i.name?.split(' #')[0] };
                        project_id = 'yakux';
                    } else {
                        project_id = collection?.name === 'Capsule X' ? 'capsulex' : 'yakucorp1';
                    }
                }
                if (!found) {
                    return { ...i, staked, floor_price: (fps[project_id || ''] || 0) / LAMPORTS_PER_SOL };
                }
                return {
                    ...found,
                    ...i,
                    project_id,
                    collection,
                    staked,
                    floor_price: (fps[project_id || ''] || found.floor_price || 0) / LAMPORTS_PER_SOL
                };
            });
            const { collections: collectionsList } = await concatCollections(mergedList);
            const sorted = orderBy(collectionsList, 'floor_price', 'desc');
            setCollections(sorted);
            const sortedList = orderBy(mergedList, 'floor_price', 'desc');
            setNftList(sortedList);
            if (setOwnedCollections) {
                setOwnedCollections(sorted);
            }
            setOwnedNftCount(sortedList.length);
            setNetWorth(Number(sum(map(sortedList, ({ floor_price = 0 }: any) => floor_price) || 0)));

            await loadMoreTokensHist(sortedList, 0, 30);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMoreTokensHist = async (jsonNFTList: any[], start: number, end: number) => {
        setIsLoading(true);
        try {
            const tokenAddresses = map(slice(jsonNFTList, start, end), ({ mint }) => mint);
            if (!tokenAddresses.length) {
                return;
            }
            const { data: histData } = await getTokensHist({
                variables: {
                    condition: {
                        tokenAddresses,
                        actionType: 'TRANSACTION'
                    }
                }
            });
            if (histData?.getTokenHistory) {
                const histList = map(histData.getTokenHistory, ({ token_address, market_place_actions }) => {
                    const found = find(jsonNFTList, (item) => item.mint === token_address) || {};
                    const { block_timestamp, price, signature } = first<any>(market_place_actions);
                    return {
                        mint: token_address,
                        image: found.image,
                        name: found.name,
                        floor_price: found.floor_price,
                        collection:
                            found.collectionName ||
                            found.project?.display_name ||
                            found.project?.name ||
                            found.collection?.family ||
                            found.collection?.name ||
                            found.collection,
                        blockTime: block_timestamp,
                        buyIn: price,
                        txHash: signature
                    };
                });
                setTokensHist(uniqBy([...tokensHist, ...histList], 'mint'));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setTabIdx(newValue);
    };

    // get domain data
    const [domainList, setDomainLst] = useState<DomainByWallet[]>([]);
    const getDomainsData = async () => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const domainData: any = await retrieveBatch(wallet);
        if (domainData && domainData.length !== 0) {
            setDomainLst(domainData);
        }
    };

    const getEthNfts = () => {
        if (ethNfts && ethNfts.length > 0) {
            const grouped = groupBy(ethNfts, 'collection');
            const groupedCollections = map(grouped, (items, collection) => ({
                items,
                collection,
                count: items.length,
                image: first(items).image || ''
            }));
            console.log(groupedCollections);
            setEthCollections(groupedCollections);
        }
    };

    useEffect(() => {
        getDomainsData();
    }, [wallet]);
    useEffect(() => {
        if (auth.token) {
            getNFTs();
        }
    }, [nfts]);
    useEffect(() => {
        getEthNfts();
    }, [ethNfts]);

    useEffect(() => {
        if (listingData?.getUserListings) {
            setListings(listingData?.getUserListings?.market_place_snapshots);
        }
    }, [listingData]);
    useEffect(() => {
        if (data?.getWalletStats) {
            setWalletStats(data?.getWalletStats?.wallet_stats[0]);
        }
    }, [data]);
    return (
        <TabContext value={tabIdx}>
            <TabList
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    marginTop: 2,
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
                <Tab label="Collections" id="collectionsTab" value="Collections" />
                <Tab label="Items" id="itemsTab" value="Items" />
                <Tab label="Domains" id="domainsTab" value="Domains" />
                <Tab label="Listings" id="listingsTab" value="Listings" />
                <Tab label="Portfolio" id="portfolioTab" value="Portfolio" />
                <Tab label="Tokens" id="tokensTab" value="Tokens" />
                <Tab label="Activities" id="activitiesTab" value="Activities" />
            </TabList>
            <TabPanel value="Collections" sx={{ p: 0, mt: 2 }}>
                {!isLoading || (collections && collections.length > 0) ? (
                    <TitlebarImageList
                        items={map(collections, ({ collection, count, items, image, symbol, floor_price, staked }: any) => ({
                            title: collection,
                            img: image,
                            count,
                            items,
                            floor_price,
                            staked,
                            owner: wallet
                        }))}
                        icon={
                            <Avatar
                                src={SolanaLogo}
                                sx={{
                                    width: 24,
                                    height: 24,
                                    objectFit: 'contain',
                                    border: 'none',
                                    background: 'transparent'
                                }}
                                color="inherit"
                            />
                        }
                        title="Collections"
                        updateView={getNFTs}
                        showSubItems
                    />
                ) : (
                    <Grid container spacing={1}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((v) => (
                            <Grid key={v} item xs={3}>
                                <Skeleton variant="rounded" width="100%" height="100%" sx={{ aspectRatio: '1 / 1' }} />
                            </Grid>
                        ))}
                    </Grid>
                )}
                <Box sx={{ mt: 1 }}>
                    {!isLoading || (ethCollections && ethCollections.length > 0) ? (
                        <TitlebarImageList
                            items={map(ethCollections, ({ collection, count, items, image }: any) => ({
                                title: collection,
                                img: image,
                                count,
                                items,
                                chain: 'ETH'
                            }))}
                            icon={
                                <Avatar
                                    src={EthLogo}
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        objectFit: 'contain',
                                        border: 'none',
                                        background: 'transparent'
                                    }}
                                    color="inherit"
                                />
                            }
                            title="Collections"
                            showSubItems
                            chain="ETH"
                        />
                    ) : (
                        <Grid container spacing={1}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((v) => (
                                <Grid key={v} item xs={3}>
                                    <Skeleton variant="rounded" width="100%" height="100%" sx={{ aspectRatio: '1 / 1' }} />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </TabPanel>
            <TabPanel value="Items" sx={{ p: 0, mt: 2 }}>
                {!isLoading || (nftList && nftList.length > 0) ? (
                    <TitlebarImageList
                        items={map(nftList, ({ name, image, mint, project_id = 'project', floor_price = 0, staked, listStatus }: any) => ({
                            title: name,
                            name,
                            img: image,
                            mint,
                            project_id,
                            price: floor_price,
                            staked,
                            listed: listStatus === 'listed',
                            owner: wallet
                        }))}
                        title="NFT"
                        navigate={navigate}
                        updateView={getNFTs}
                        showActionButton
                        showSendAndBurnButton
                    />
                ) : (
                    <Grid container spacing={1} sx={{ mt: 2 }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((v) => (
                            <Grid key={v} item xs={3}>
                                <Skeleton variant="rounded" width="100%" height="100%" sx={{ aspectRatio: '1 / 1' }} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </TabPanel>
            <TabPanel value="Domains" sx={{ p: 0, mt: 2 }}>
                <DomainItems domains={domainList} isLoading={isLoading} />
            </TabPanel>
            <TabPanel value="Listings" sx={{ p: 0, mt: 2 }}>
                {!isLoading || (listings && listings.length > 0) ? (
                    <TitlebarImageList
                        items={map(listings, ({ meta_data_img, name, token_address, project_id = 'project', market_place_state }: any) => ({
                            title: name,
                            name,
                            img: get(find(nftList, ({ mint }) => token_address === mint) || {}, 'image', meta_data_img),
                            mint: token_address,
                            project_id,
                            price: market_place_state.price,
                            owner: wallet,
                            listed: true,
                            marketplace_program_id: market_place_state.marketplace_program_id
                        }))}
                        title="Listings"
                        navigate={navigate}
                        updateView={getNFTs}
                        showActionButton
                    />
                ) : (
                    <Grid container spacing={1} sx={{ mt: 2 }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((v) => (
                            <Grid key={v} item xs={3}>
                                <Skeleton variant="rounded" width="100%" height="100%" sx={{ aspectRatio: '1 / 1' }} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </TabPanel>
            <TabPanel value="Portfolio">
                <Grid container sx={{ justifyContent: 'space-between' }}>
                    <Tooltip title="Net Worth is based on FP calculation.">
                        <Grid
                            item
                            xs={12}
                            sm={5.75}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(36, 24, 47, 0.85)' : 'primary.light',
                                borderRadius: '.75rem',
                                p: 2
                            }}
                        >
                            <Typography>
                                Net Worth <InfoCircleOutlined />
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Avatar
                                    src={SolanaLogo}
                                    sx={{
                                        width: 18,
                                        height: 18,
                                        objectFit: 'contain',
                                        border: 'none',
                                        background: 'transparent'
                                    }}
                                    color="inherit"
                                />
                                <Typography noWrap>
                                    {!isLoading || !isEmpty(nftList) ? (
                                        `${round(
                                            Number(sum(map(nftList, ({ floor_price = 0 }: any) => floor_price) || 0)),
                                            2
                                        ).toLocaleString()}`
                                    ) : (
                                        <Skeleton width={50} height={16} variant="rounded" />
                                    )}
                                </Typography>
                            </Box>
                        </Grid>
                    </Tooltip>
                    <Grid
                        item
                        xs={12}
                        sm={5.75}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(36, 24, 47, 0.85)' : 'primary.light',
                            borderRadius: '.75rem',
                            p: 2
                        }}
                    >
                        <Typography>Est. Net Worth (USD)</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Typography noWrap>
                                {!isLoading || !isEmpty(nftList) ? (
                                    `$${round(
                                        Number(sum(map(nftList, ({ floor_price = 0 }: any) => floor_price) || 0)) * solPrice,
                                        2
                                    ).toLocaleString()}`
                                ) : (
                                    <Skeleton width={50} height={16} variant="rounded" />
                                )}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
                {!isLoading || (nftList && nftList.length > 0) ? (
                    <List>
                        <ListItem sx={{ gap: 1, justifyContent: 'space-between' }}>
                            <Box width={40} />
                            <Typography component="p" sx={{ width: '18%' }} noWrap>
                                Name
                            </Typography>
                            <Typography component="p" sx={{ width: '18%' }} noWrap>
                                Collection
                            </Typography>
                            <Typography component="p" sx={{ width: '12%', textAlign: 'end' }} noWrap>
                                Buy In
                            </Typography>
                            <Typography component="p" sx={{ width: '12%', textAlign: 'end' }} noWrap>
                                Buy In (USD)
                            </Typography>
                            <Typography component="p" sx={{ width: '12%', textAlign: 'center' }} noWrap>
                                IRR
                            </Typography>
                            <Typography component="p" sx={{ width: '14%' }}>
                                Purchase time
                            </Typography>

                            <Box width={20} />
                        </ListItem>
                        {map(tokensHist, (item: any, idx) => (
                            <TokenPortfolioItem key={idx} {...item} />
                        ))}
                        {isLoading && <LinearProgress color="secondary" />}
                        {tokensHist && nftList && tokensHist.length < nftList.length && (
                            <Button
                                fullWidth
                                variant="outlined"
                                color="secondary"
                                onClick={() => loadMoreTokensHist(nftList, tokensHist.length, tokensHist.length + 30)}
                            >
                                Load More
                            </Button>
                        )}
                    </List>
                ) : (
                    <LinearProgress color="secondary" />
                )}
            </TabPanel>
            <TabPanel value="Tokens">
                <TokensView wallet={wallet} tabIdx={tabIdx} />
            </TabPanel>
            <TabPanel value="Activities">
                <MEActivitiesList wallet={wallet} tabIdx={tabIdx} />
            </TabPanel>
        </TabContext>
    );
};

export default NFTCollectionsView;
