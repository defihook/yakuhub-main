/* eslint-disable no-await-in-loop */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Promise } from 'bluebird';
import { map, cloneDeep, pull, isObject, uniqBy, filter, orderBy, get, isEmpty } from 'lodash';
import InfiniteScroll from 'react-infinite-scroller';
import { Fab, Grid, IconButton, LinearProgress, Tab, Typography, useTheme } from '@mui/material';
import { ChevronLeftOutlined, ChevronRightOutlined, FilterAltOutlined, RefreshOutlined } from '@mui/icons-material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useWallet } from '@solana/wallet-adapter-react';
import { Message, Transaction } from '@solana/web3.js';
import CollectionInfoView from './CollectionInfoView';
import CollectionInfoViewSkeleton from './CollectionInfoViewSkeleton';
import MPActivitiesView from './MPActivitiesView';
import MPAnalysticsView from './MPAnalysticsView';
import FilterDrawer from './components/FilterDrawer';
import FilterDrawerMobile from './components/FilterDrawerMobile';
import NFTCard from './components/NFTCard';
import NFTCardSkeleton from './components/NFTCardSkeleton';
import useAuthMutation from 'hooks/useAuthMutation';
import { useToasts } from 'hooks/useToasts';
import { useCartItems } from 'contexts/CartContext';
import { useMeta } from 'contexts/meta/meta';
import { useEthcontext } from 'contexts/EthWalletProvider';
import useAuth from 'hooks/useAuth';
import useAuthQuery from 'hooks/useAuthQuery';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import useConnections from 'hooks/useConnetions';
import { maxCartItems } from 'store/constant';
import { DEFAULT_BUYER_BROKER, USE_ME_API_FOR_COLLECTION_BUY } from 'config/config';
import { mutations, queries } from '../../../graphql/graphql';

export interface SelectedItemType {
    tokenAddress: string;
    metaDataImg: string;
    name: string;
    price: number;
    brokerReferralAddress: string;
    marketplaceProgramId: string;
    contractAddress: any;
    chain: string;
}

const MIN_PRICE = 0.001;
const MAX_PRICE = 9999;
const NFTCollectionPage = () => {
    const { connection } = useConnections();
    const { chain, projectId } = useParams();
    const navigate = useNavigate();
    const auth = useAuth();
    const theme = useTheme();
    const wallet = useWallet();
    const { ethAddress, ethConnect, ethConnected, ethBalance, sendTransaction } = useEthcontext();
    const { cartItems, setCartItems, setOpen: setOpenCart, temp, setTemp, sweepValue, sweepCount, multiTabIdx } = useCartItems();
    const [tabIdx, setTabIdx] = useState('items');
    const [isLoading, setIsLoading] = useState(false);
    const [masterList, setMasterList] = useState<any[]>([]);
    const [meSlug, setMeSlug] = useState('');
    const [pid, setPID] = useState(projectId);
    const [meParams, setMeParams] = useState({
        offset: 0,
        limit: 20
    });
    const [meMasterList, setMeMasterList] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [filters, setFilters] = useState<any>({});
    const [refresh, setRefresh] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(true);

    const [priceRange, setPriceRange] = useState<number[]>([MIN_PRICE, MAX_PRICE]);
    const [supply, setSupply] = useState<number>(0);
    const [rankRange, setRankRange] = useState<number[]>([1, supply]);

    const [forceRender, setForceRender] = useState(false);

    const onSelect = (
        tokenAddress: string,
        metaDataImg: string,
        name: string,
        price: number,
        brokerReferralAddress: string,
        marketplaceProgramId: string,
        contractAddress: string
    ) => {
        const selected = cartItems;
        if (selected.length >= maxCartItems) {
            return;
        }
        if (selected && selected.length !== 0) {
            let index = -1;
            for (let i = 0; i < selected.length; i += 1) {
                if (selected[i].tokenAddress === tokenAddress && selected[i].contractAddress === contractAddress) {
                    index = i;
                }
            }
            if (index !== -1) {
                selected.splice(index, 1);
            } else {
                selected.push({
                    tokenAddress,
                    metaDataImg,
                    name,
                    price,
                    brokerReferralAddress,
                    marketplaceProgramId,
                    contractAddress,
                    chain
                });
            }
        } else {
            selected.push({
                tokenAddress,
                metaDataImg,
                name,
                price,
                brokerReferralAddress,
                marketplaceProgramId,
                contractAddress,
                chain
            });
        }

        // After calling setCartItems(), should call the setTemp(!temp)
        // to update the cart items immediately
        // It's because useContext, we will need to update it later in a better way
        setCartItems(selected);
        setTemp(!temp);
        setForceRender(!forceRender);
        setOpenCart(true);
    };

    const [forSale, setForSale] = useState(true);

    const { startLoading, stopLoading } = useMeta();
    const { showSuccessToast, showErrorToast } = useToasts();
    const defaultVariables = {
        has_metadata: true,
        projects: [
            {
                project_id: pid || projectId
            }
        ],
        onlyListings: true,
        field_name: 'lowest_listing_price',
        sort_order: 'ASC',
        page_number: 1,
        page_size: 30,
        progressive_load: true,
        chain
    };

    const { data: collectionInfo, refetch: refetchProjectStats } = useAuthQuery(queries.GET_PROJECTS_STATS, {
        skip: !pid,
        variables: {
            chain,
            projectIds: [pid || projectId],
            onlyListings: forSale
        }
    });

    const { data, refetch } = useAuthQuery(queries.GET_MARKETPLACE_SNAPSHOT, {
        skip: !pid,
        variables: {
            ...defaultVariables,
            chain,
            projectIds: [pid || projectId]
        }
    });
    const { data: meData, refetch: refetchME } = useAuthQuery(queries.GET_LISTING_BY_SYMBOL, {
        skip: !meSlug,
        variables: {
            symbol: meSlug,
            offset: meParams.offset,
            limit: meParams.limit
        }
    });
    const [getTokenByMint] = useAuthLazyQuery(queries.GET_TOKEN_BY_MINT);
    const [getMETransactionInstructions] = useAuthMutation(mutations.GET_ME_TRANSACTION_INSTRUCTIONS);
    const [createBuyTx] = useAuthMutation(mutations.CREATE_BUY_TX);
    const [getProject] = useAuthLazyQuery(queries.SEARCH_PROJECT_BY_NAME);

    const buyNowInSOL = async ({ name, token_address, lowest_listing_mpa, event }: any) => {
        // prevent any propagation of the NFT to the cart
        event.stopPropagation();

        if (!wallet || !wallet.publicKey) {
            return;
        }
        try {
            startLoading();
            let instructions;
            let response;
            const { price, broker_referral_address, marketplace_program_id } = lowest_listing_mpa;
            const isME = marketplace_program_id === 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K';
            if (isME && USE_ME_API_FOR_COLLECTION_BUY) {
                ({ data: instructions } = await getMETransactionInstructions({
                    variables: {
                        buyer: wallet.publicKey.toBase58(),
                        tokenMint: token_address
                    }
                }));
                ({ getMETransactionInstructions: response } = instructions);
            } else {
                ({ data: instructions } = await createBuyTx({
                    variables: {
                        buyerAddress: wallet.publicKey.toBase58(),
                        price,
                        tokenAddress: token_address,
                        buyerBroker: broker_referral_address || DEFAULT_BUYER_BROKER || process.env.SOLANA_FEE_ACCOUNT,
                        tokens: '',
                        chain
                    }
                }));
                ({ createBuyTx: response } = instructions);
            }

            if ((response && response.data) || Object.keys(response).length > 0) {
                let transaction;
                if (isME) {
                    transaction = Transaction.from(Buffer.from(response.data || response.txSigned));
                } else {
                    transaction = Transaction.populate(Message.from(Buffer.from(data)));
                }
                const res = await wallet.sendTransaction(transaction, connection);
                await connection.confirmTransaction(res);
                const getTransResp = await connection.getTransaction(res, {
                    commitment: 'confirmed'
                });
                if (isObject(getTransResp) && getTransResp?.meta?.err === null) {
                    showSuccessToast(
                        <Typography
                            component="a"
                            sx={{ color: '#fff' }}
                            href={`https://solscan.io/tx/${res}`}
                            target="_blank"
                            rel="noreferrer"
                            className="m-auto"
                        >
                            Successfully bought {name}.
                        </Typography>
                    );
                } else {
                    showErrorToast('Fail to purchase.');
                }
            }
        } catch (error) {
            console.error(error);
            showErrorToast('There are some errors, please try again later.');
        } finally {
            stopLoading();
        }
    };

    const buyNowInETH = async ({ name, token_address, project_id, attributes, lowest_listing_mpa, event }: any) => {
        // prevent any propagation of the NFT to the cart
        event.stopPropagation();

        if (!ethConnected || !ethAddress) {
            ethConnect();
        } else {
            try {
                startLoading();
                const { price } = lowest_listing_mpa;

                if (ethBalance < price) {
                    showErrorToast('You have insufficient funds to buy this token.');
                    return;
                }

                const { data: instructions } = await createBuyTx({
                    variables: {
                        buyerAddress: ethAddress, // required field
                        tokens: [`${project_id}:${token_address}`], // required field
                        chain, // required field
                        price,
                        tokenAddress: project_id,
                        buyerBroker: ''
                    }
                });

                const { createBuyTx: response } = instructions;

                if ((response && response.data) || Object.keys(response).length > 0) {
                    if (response.error) {
                        showErrorToast(response.error);
                        return;
                    }
                    const result = await sendTransaction(response?.txObj);
                    if (result.success) {
                        showSuccessToast(result.message);
                    } else {
                        showErrorToast(result.message);
                    }
                }
            } catch (error) {
                console.error(error);
                showErrorToast('There are some errors, please try again later.');
            } finally {
                stopLoading();
            }
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setTabIdx(newValue);
    };

    const handleRemoveFilter = (key: string, value: string) => {
        const newFilter = {
            ...filters,
            [key]: { ...filters[key], values: pull(filters[key].values, value) }
        };
        const attributes = map(Object.keys(newFilter), (name) => ({
            name,
            ...newFilter[name]
        }));
        setFilters(newFilter);
        forceReload({
            projects: [
                {
                    project_id: pid,
                    attributes
                }
            ],
            onlyListings: forSale
        });
    };

    const handleFilterChange = (event: any, name: string, type: String) => {
        const {
            target: { value }
        } = event;
        const newFilter = {
            ...filters,
            [name]: {
                type,
                values: typeof value === 'string' ? value.split(',') : value
            }
        };
        setFilters(newFilter);
        const attributes = map(Object.keys(newFilter), (n) => ({
            name: n,
            ...newFilter[n]
        }));
        forceReload({
            projects: [
                {
                    project_id: pid,
                    attributes
                }
            ],
            onlyListings: forSale
        });
    };

    const transformMEData = async (list: any[], omitList: string[] = []) => {
        const result = await Promise.mapSeries(
            filter(list, ({ tokenMint }: any) => !omitList.includes(tokenMint)),
            async ({ pdaAddress, auctionHouse, tokenAddress, tokenMint, seller, tokenSize, price, rarity }) => {
                const { data: tokenData } = await getTokenByMint({
                    variables: {
                        mint: tokenMint
                    }
                });
                const { name, image, attributes } = tokenData?.getTokenByMint ?? {};
                const formatted = {
                    token_address: tokenMint,
                    project_id: pid,
                    name,
                    rank_est: rarity?.moonrank?.rank || rarity?.howrare?.rank || rarity?.merarity?.rank,
                    supply,
                    attributes,
                    full_img: image,
                    meta_data_img: image,
                    price,
                    lowest_listing_mpa: {
                        user_address: seller,
                        price,
                        marketplace_program_id: 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K',
                        type: 'LISTING',
                        amount: price,
                        escrow_address: pdaAddress,
                        marketplace_instance_id: auctionHouse
                    }
                };
                return formatted;
            }
        );
        return result;
    };

    useEffect(() => {
        if (multiTabIdx === 'sweep') {
            forceReload();
        }
    }, [sweepValue, sweepCount]);

    const forceReload = async (params: any = {}, tab?: string) => {
        if (isLoading || (!tab && tabIdx !== 'items') || (tab && tab !== 'items')) {
            return;
        }
        let projId = projectId;
        if (chain === 'SOL') {
            projId = await getProjectId();
        }
        setMasterList([]);
        setHasNextPage(true);
        setIsLoading(true);
        try {
            const { data: newData } = await refetch({
                ...defaultVariables,
                projects: [
                    {
                        project_id: projId || pid || projectId
                    }
                ],
                ...params,
                chain,
                page_number: 1
            });
            setMasterList([...newData?.getMarketplaceSnapshot?.market_place_snapshots]);
            const newParams = {
                offset: 0,
                limit: 20
            };
            let digestedMEList: any[] = [];
            if (chain === 'SOL' && isEmpty(params) && (meSlug || collectionInfo?.getProjectStats?.project_stats[0]?.project?.me_slug)) {
                setMeParams(newParams);
                const { data: newMeData } = await refetchME({
                    ...newParams,
                    symbol: meSlug || collectionInfo?.getProjectStats?.project_stats[0]?.project?.me_slug
                });
                setMeMasterList(newMeData?.getListingBySymbol);
                digestedMEList = await transformMEData(
                    newMeData?.getListingBySymbol,
                    map(newData?.getMarketplaceSnapshot?.market_place_snapshots, ({ token_address }) => token_address)
                );
                console.log(digestedMEList);
            }
            const concatList = uniqBy([...newData?.getMarketplaceSnapshot?.market_place_snapshots, ...digestedMEList], 'token_address');
            const orderedList = orderBy(concatList, 'lowest_listing_mpa.price', 'asc');
            const selected = cartItems;

            for (let i = 0; i < orderedList.length; i += 1) {
                if ((orderedList[i].lowest_listing_mpa.price as number) <= sweepValue) {
                    if (i < sweepCount) {
                        selected.push({
                            tokenAddress: orderedList[i].token_address,
                            metaDataImg: orderedList[i].meta_data_img,
                            name: orderedList[i].name,
                            price: orderedList[i].lowest_listing_mpa.price,
                            brokerReferralAddress: orderedList[i].lowest_listing_mpa.broker_referral_address,
                            marketplaceProgramId: orderedList[i].lowest_listing_mpa.marketplace_program_id,
                            contractAddress: projId || pid || projectId,
                            chain: chain || 'SOL'
                        });
                    }
                }
            }

            // After calling setCartItems(), should call the setTemp(!temp)
            // to update the cart items immediately
            // It's because useContext, we will need to update it later in a better way
            setCartItems(selected);
            setTemp(!temp);
            setMasterList(orderedList);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMore = async () => {
        if (isLoading || tabIdx !== 'items' || !data?.getMarketplaceSnapshot?.market_place_snapshots || !data?.masterList) {
            return;
        }
        setIsLoading(true);
        try {
            if (masterList.length <= (data?.getMarketplaceSnapshot?.pagination_info?.current_page_number ?? 0)) {
                if (data?.getMarketplaceSnapshot?.market_place_snapshots) {
                    const exists = Object.keys(data.getMarketplaceSnapshot.market_place_snapshots).some(
                        (k) => data.getMarketplaceSnapshot.market_place_snapshots[k].project_id === masterList[0].project_id
                    );
                    if (!exists) {
                        setMasterList([...masterList, ...data?.getMarketplaceSnapshot?.market_place_snapshots]);
                    } else {
                        setMasterList([...data?.getMarketplaceSnapshot?.market_place_snapshots]);
                    }
                }
                setIsLoading(false);
                return;
            }
            if (!hasNextPage) {
                setIsLoading(false);
                return;
            }
            const oldMaster = cloneDeep(masterList);
            const { data: nextPageData } = await refetch({
                page_number: data?.getMarketplaceSnapshot?.pagination_info?.current_page_number + 1
            });

            const newParams = {
                offset: meParams.offset + meParams.limit,
                limit: 20
            };
            let digestedMEList: any[] = [];
            let newMeData: any = {};
            if (chain === 'SOL' && (meSlug || collectionInfo?.getProjectStats?.project_stats[0]?.project?.me_slug)) {
                setMeParams(newParams);
                ({ data: newMeData } = await refetchME({
                    ...newParams,
                    symbol: meSlug || collectionInfo?.getProjectStats?.project_stats[0]?.project?.me_slug
                }));
                setMeMasterList(newMeData?.getListingBySymbol);
                digestedMEList = await transformMEData(newMeData?.getListingBySymbol, [
                    ...map(oldMaster, ({ token_address }) => token_address),
                    ...map(nextPageData?.getMarketplaceSnapshot?.market_place_snapshots, ({ token_address }) => token_address)
                ]);
                console.log(digestedMEList);
            }
            const concatList = uniqBy(
                [...oldMaster, ...nextPageData?.getMarketplaceSnapshot?.market_place_snapshots, ...digestedMEList],
                'token_address'
            );
            if (concatList.length === oldMaster.length && newMeData?.getListingBySymbol?.length === 0) {
                setHasNextPage(false);
            }
            setMasterList(orderBy(concatList, 'lowest_listing_mpa.price', 'asc'));
        } finally {
            setIsLoading(false);
        }
    };

    const getProjectId = async () => {
        let project = get(collectionInfo, 'getProjectStats.project_stats[0].project');
        let project_id = get(collectionInfo, 'getProjectStats.project_stats[0].project_id') || pid;
        console.log('getProjectId', project_id);
        if (!project && projectId && chain === 'SOL') {
            setMeSlug(projectId);
            const { data: newSearchData } = await getProject({
                variables: {
                    condition: {
                        meSlug: {
                            operation: 'EXACT',
                            value: projectId
                        }
                    }
                }
            });
            if (newSearchData?.searchProjectByName?.project_stats) {
                ({ project, project_id } = get(newSearchData, 'searchProjectByName.project_stats[0]') || {
                    project,
                    project_id
                });
                await refetchProjectStats({
                    projectIds: [project_id],
                    onlyListings: true
                });
            }
        }
        setPID(project_id);
        return project_id;
    };

    useEffect(() => {
        setTabIdx('items');
        if (auth.token) {
            forceReload({}, 'items');
        }
    }, [chain, projectId]);

    useEffect(() => {
        if (auth.token) {
            forceReload();
        }
    }, [auth.token]);

    useEffect(() => {
        if (chain === 'ETH' && !ethAddress) {
            ethConnect();
        }
    }, [chain, ethAddress]);

    useEffect(() => {
        const sup =
            collectionInfo?.getProjectStats?.project_stats.length > 0
                ? collectionInfo?.getProjectStats?.project_stats[0].project?.supply
                : 10000;
        setSupply(sup);
        setRankRange([rankRange[0], sup]);
        if (chain === 'SOL') {
            setMeSlug(collectionInfo?.getProjectStats?.project_stats[0]?.project?.me_slug);
        }
    }, [collectionInfo]);

    return (
        <>
            <TabContext value={tabIdx}>
                <Grid container sx={{ my: 2 }} columnSpacing={2} alignItems="center">
                    <Grid item>
                        <IconButton onClick={() => navigate(`/explore/collection/${chain}`)}>
                            <ChevronLeftOutlined />
                        </IconButton>
                    </Grid>
                    <Grid item>
                        {collectionInfo?.getProjectStats?.project_stats.length > 0 ? (
                            <CollectionInfoView {...collectionInfo?.getProjectStats?.project_stats[0]} />
                        ) : (
                            <CollectionInfoViewSkeleton />
                        )}
                    </Grid>
                </Grid>
                <div className="flex gap-3">
                    <div className="max-sm:hidden">
                        <Fab
                            aria-label="Filters"
                            sx={{
                                cursor: 'pointer',
                                borderRadius: '0',
                                height: '48px',
                                width: '100%',
                                marginTop: '-12px',
                                backgroundColor: 'transparent',
                                justifyContent: 'space-between',
                                color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
                                '&:hover': {
                                    backgroundColor: 'transparent'
                                }
                            }}
                            onClick={() => setOpen(!open)}
                        >
                            <FilterAltOutlined />
                            {open ? <ChevronLeftOutlined /> : <ChevronRightOutlined />}
                        </Fab>
                        <FilterDrawer
                            data={collectionInfo?.getProjectStats?.project_stats}
                            {...{
                                open,
                                setOpen,
                                forceReload,
                                priceRange,
                                setPriceRange,
                                rankRange,
                                setRankRange,
                                forSale,
                                setForSale,
                                supply,
                                filters,
                                handleFilterChange,
                                handleRemoveFilter,
                                MIN_PRICE,
                                MAX_PRICE,
                                tabIdx,
                                chain
                            }}
                        />
                    </div>
                    <div style={{ width: '100%' }}>
                        <div className="flex items-center">
                            <IconButton className="sm:hidden" onClick={() => setOpen(true)}>
                                <FilterAltOutlined />
                            </IconButton>
                            <TabList
                                onChange={handleTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    marginTop: '-12px',
                                    width: '100%',
                                    '.MuiTabs-root': {
                                        width: '100%'
                                    },
                                    '.MuiTabs-flexContainer': { borderBottom: 'none' }
                                }}
                                textColor="secondary"
                                indicatorColor="secondary"
                            >
                                <Tab label="Items" id="itemsTab" value="items" />
                                <Tab label="Activities" id="activitiesTab" value="activities" />
                                <Tab label="Analytics" id="analyticsTab" value="analytics" />

                                <IconButton
                                    onClick={() => {
                                        if (tabIdx === 'items') {
                                            forceReload();
                                        } else if (tabIdx === 'activities') {
                                            setRefresh(!refresh);
                                        }
                                    }}
                                >
                                    <RefreshOutlined />
                                </IconButton>
                            </TabList>
                        </div>
                        <TabPanel value="items" className={open ? 'nft-tab-panel' : 'full-nft-tab-panel'}>
                            <div className="collection-page">
                                <div
                                    className="items-content"
                                    style={{
                                        width: '100%',
                                        marginRight: '0'
                                    }}
                                >
                                    <InfiniteScroll
                                        loadMore={loadMore}
                                        hasMore={data?.getMarketplaceSnapshot?.pagination_info?.has_next_page}
                                        loader={<LinearProgress key="loadMore" sx={{ mt: 4 }} color="secondary" />}
                                    >
                                        <Grid container spacing={2}>
                                            {map(masterList, (item: any, idx: number) => (
                                                <Grid key={idx} item xs={12} sm={6} md={4} lg={3} xl={2}>
                                                    <NFTCard
                                                        {...item}
                                                        buyNow={chain === 'SOL' ? buyNowInSOL : buyNowInETH}
                                                        onSelect={(
                                                            token_address: string,
                                                            metaDataImg: string,
                                                            name: string,
                                                            price: number,
                                                            brokerReferralAddress: string,
                                                            marketplaceProgramId: string,
                                                            project_id: string
                                                        ) =>
                                                            onSelect(
                                                                token_address,
                                                                metaDataImg,
                                                                name,
                                                                price,
                                                                brokerReferralAddress,
                                                                marketplaceProgramId,
                                                                project_id
                                                            )
                                                        }
                                                        selectedNfts={cartItems}
                                                        sweepValue={sweepValue}
                                                    />
                                                </Grid>
                                            ))}
                                            {isLoading &&
                                                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                                                    <Grid key={i} item xs={12} sm={6} md={4} lg={3} xl={2}>
                                                        <NFTCardSkeleton />
                                                    </Grid>
                                                ))}
                                        </Grid>
                                    </InfiniteScroll>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel value="activities" className={open ? 'nft-tab-panel' : 'full-nft-tab-panel'}>
                            <MPActivitiesView
                                project_id={pid}
                                me_slug={
                                    collectionInfo?.getProjectStats?.project_stats.length > 0 &&
                                    collectionInfo?.getProjectStats?.project_stats[0].project?.me_slug
                                }
                                supply={
                                    collectionInfo?.getProjectStats?.project_stats.length > 0 &&
                                    collectionInfo?.getProjectStats?.project_stats[0].project?.supply
                                }
                                filters={filters}
                                refresh={refresh}
                            />
                        </TabPanel>
                        <TabPanel value="analytics" className={open ? 'nft-tab-panel' : 'full-nft-tab-panel'}>
                            <MPAnalysticsView project_id={pid} refresh={refresh} />
                        </TabPanel>
                    </div>
                </div>
            </TabContext>
            <FilterDrawerMobile
                data={collectionInfo?.getProjectStats?.project_stats}
                {...{
                    open,
                    setOpen,
                    forceReload,
                    priceRange,
                    setPriceRange,
                    rankRange,
                    setRankRange,
                    forSale,
                    setForSale,
                    supply,
                    filters,
                    handleFilterChange,
                    handleRemoveFilter,
                    MIN_PRICE,
                    MAX_PRICE,
                    chain
                }}
            />
        </>
    );
};

export default NFTCollectionPage;
