import { Avatar, Box, CardMedia, Grid, IconButton, Skeleton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import Loading from 'components/Loading';
import MainCard from 'components/MainCard';
import Image from 'mui-image';
import { useNavigate, useParams } from 'react-router-dom';
import SolscanLogo from 'assets/images/icons/solscan.png';
import ExplorerLogo from 'assets/images/icons/explorer.png';
import { useEffect, useState } from 'react';
import useAuthQuery from 'hooks/useAuthQuery';
import { queries } from '../../../graphql/graphql';
import useAuth from 'hooks/useAuth';
import { filter, find, get, map, orderBy, round } from 'lodash';
import { getMarketplaceIcon, shortenAddress } from 'utils/utils';
import { RefreshOutlined, SellOutlined } from '@mui/icons-material';
import TokenActivitiesList from './components/TokenActivitiesList';
import { useWallet } from '@solana/wallet-adapter-react';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import { IMAGE_PROXY, MARKETPLACE_PROGRAM_ID } from 'config/config';
import MPActionButton from 'views/profile/components/MPActionButton';
import TokenBidsList from './components/TokenBidsList';
import moment from 'moment';
import FsLightbox from 'fslightbox-react';

const NFTDetailView = () => {
    const auth = useAuth();
    const wallet = useWallet();
    const navigate = useNavigate();
    const theme = useTheme();
    const { projectId, mint: tokenAddress } = useParams();
    const [loading, setLoading] = useState(true);
    const [toggler, setToggler] = useState(false);

    const [nftData, setNftData] = useState<any>({});

    const [getTokenByMint] = useAuthLazyQuery(queries.GET_TOKEN_BY_MINT, {
        variables: {
            mint: tokenAddress
        }
    });
    const { data: projectData, refetch: refetchProjectData } = useAuthQuery(queries.GET_PROJECT_NAME, {
        skip: !projectId,
        variables: {
            projectIds: [projectId],
            chain: 'SOL'
        }
    });
    const { data: tokenHistory, refetch: refetchTokenHistory } = useAuthQuery(queries.GET_TOKEN_HISTORY, {
        skip: !tokenAddress,
        variables: {
            condition: {
                tokenAddresses: [tokenAddress]
            }
        }
    });
    const { data: tokenState, refetch: refetchTokenState } = useAuthQuery(queries.GET_TOKEN_STATE, {
        skip: !tokenAddress,
        variables: {
            condition: {
                tokenAddresses: [tokenAddress]
            }
        }
    });
    const { data: tokenOffer, refetch: refetchTokenOffer } = useAuthQuery(queries.GET_ME_TOKEN_OFFER_RECEIVED, {
        skip: !tokenAddress,
        variables: {
            mint: tokenAddress
        }
    });
    const [getProject] = useAuthLazyQuery(queries.SEARCH_PROJECT_BY_NAME);
    const [fetchMetadatas] = useAuthLazyQuery(queries.GET_NFTS_BY_MINT, {
        fetchPolicy: 'network-only'
    });

    const updateView = async () => {
        if (!tokenAddress) {
            return;
        }
        setLoading(true);
        let metaData = {};
        const { data: newData } = await getTokenByMint();
        metaData = {
            ...newData?.getTokenByMint
        };
        setNftData(metaData);
        const { data: nftItem }: any = await fetchMetadatas({
            variables: {
                mint: tokenAddress
            }
        });
        const { mint, metadata } = nftItem?.fetch[0];
        metaData = {
            ...metaData,
            ...metadata,
            ...(metadata.json || {}),
            mint
        };
        setNftData(metaData);
        const { data: newProjectData } = await refetchProjectData();
        let project = get(newProjectData, 'getProjectStats.project_stats[0].project');
        let project_id = get(newProjectData, 'getProjectStats.project_stats[0].project_id');
        if (!project) {
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
            ({ project, project_id } = get(newSearchData, 'searchProjectByName.project_stats[0]') || {
                project,
                project_id
            });
        }
        metaData = {
            project_id,
            ...project,
            ...metaData
        };
        setNftData(metaData);
        const { data: newHistory } = await refetchTokenHistory();
        metaData = {
            ...metaData,
            history: newHistory?.getTokenHistory[0]?.market_place_actions
        };
        setNftData(metaData);
        const { data: newState } = await refetchTokenState();
        const states = newState?.getTokenState[0]?.market_place_states;
        const listing: any = find(states, (state) => state.market_place_state.type === 'LISTING');
        metaData = {
            ...metaData,
            states,
            price: listing?.market_place_state?.price,
            escrow_address: listing?.market_place_state?.escrow_address,
            marketplace_instance_id: listing?.market_place_state?.marketplace_instance_id,
            marketplace_program_id: listing?.market_place_state?.marketplace_program_id
        };
        setNftData(metaData);
        const { data: newTokenOffer } = await refetchTokenOffer();
        metaData = {
            ...newProjectData?.getProjectStats?.project_stats[0]?.project,
            ...newData?.getTokenByMint,
            ...metaData,
            offers: newTokenOffer?.getMETokenOfferReceived,
            myBid: find(newTokenOffer?.getMETokenOfferReceived, ({ buyer }: any) => buyer === wallet.publicKey?.toBase58()),
            history: newHistory?.getTokenHistory[0]?.market_place_actions,
            states,
            price: listing?.market_place_state?.price,
            escrow_address: listing?.market_place_state?.escrow_address,
            marketplace_instance_id: listing?.market_place_state?.marketplace_instance_id,
            marketplace_program_id: listing?.market_place_state?.marketplace_program_id
        };
        setNftData(metaData);
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        if (auth.token) {
            updateView();
        }
    }, [auth.token]);

    const handleExplore = (site: string, mint?: string) => {
        let url: string;
        switch (site) {
            case 'solscan':
                url = `https://solscan.io/token/${mint || tokenAddress}`;
                break;
            case 'explorer':
                url = `https://explorer.solana.com/address/${mint || tokenAddress}`;
                break;
            default:
                url = `https://solscan.io/token/${mint || tokenAddress}`;
                break;
        }

        window.open(url, '_blank');
    };
    return (
        <>
            <Grid container spacing={3}>
                <>
                    <Grid item xs={12} md={6} lg={4} xl={3}>
                        <MainCard
                            content={false}
                            boxShadow
                            sx={{
                                background: theme.palette.mode === 'dark' ? '#09080d' : theme.palette.primary.light,
                                borderRadius: '16px'
                            }}
                        >
                            {nftData?.image ? (
                                <CardMedia>
                                    <FsLightbox toggler={toggler} sources={[nftData?.image]} />
                                    <Typography component="a" onClick={() => setToggler(!toggler)}>
                                        <Image
                                            src={`${IMAGE_PROXY}${nftData?.image}`}
                                            showLoading={<Loading />}
                                            alt=""
                                            style={{ aspectRatio: '1 / 1' }}
                                        />
                                    </Typography>

                                    {nftData?.marketplace_program_id && (
                                        <Tooltip title={MARKETPLACE_PROGRAM_ID[nftData?.marketplace_program_id]}>
                                            <Avatar
                                                sx={{
                                                    objectFit: 'contain',
                                                    border: 'none',
                                                    width: 36,
                                                    height: 36,
                                                    position: 'absolute',
                                                    right: 16,
                                                    bottom: 16,
                                                    background: 'transparent'
                                                }}
                                                src={getMarketplaceIcon(nftData?.marketplace_program_id)}
                                            />
                                        </Tooltip>
                                    )}
                                </CardMedia>
                            ) : (
                                <Skeleton variant="rounded" width="100%" height="100%" sx={{ aspectRatio: '1 / 1' }} />
                            )}
                        </MainCard>
                        <MainCard border={false} boxShadow sx={{ borderRadius: 3, mt: 4 }}>
                            {/* collection information */}
                            {nftData?.description ? (
                                <Box display="flex" justifyContent="space-between">
                                    <Stack>
                                        <Typography component="h4" sx={{ fontSize: 18 }}>
                                            About {nftData?.display_name}
                                        </Typography>
                                        <Typography fontWeight="700" color="inherit" sx={{ pb: '4px' }}>
                                            {nftData?.description}
                                        </Typography>
                                    </Stack>
                                </Box>
                            ) : (
                                <Skeleton variant="rounded" width="100%" height={110} />
                            )}
                        </MainCard>
                    </Grid>

                    <Grid item xs={12} md={6} lg={8} xl={9}>
                        <MainCard border={false} boxShadow sx={{ borderRadius: 3 }}>
                            {/* collection information */}
                            {nftData?.name ? (
                                <Box display="flex" justifyContent="space-between">
                                    <Stack>
                                        <Typography
                                            fontWeight="700"
                                            color="secondary.dark"
                                            sx={{
                                                fontSize: '1rem',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    cursor: 'pointer',
                                                    color: '#ef4444',
                                                    transition: 'all .1s ease-in-out'
                                                }
                                            }}
                                            onClick={() => navigate(`/explore/collection/SOL/${nftData?.project_id || projectId}`)}
                                        >
                                            {nftData?.display_name}
                                        </Typography>
                                        <Typography
                                            fontWeight="700"
                                            color="inherit"
                                            sx={{ fontSize: '1.25rem', pb: '4px', display: 'flex', alignItems: 'center' }}
                                        >
                                            {nftData?.name}
                                            <Tooltip
                                                title="View on Solscan"
                                                placement="top"
                                                onClick={() => handleExplore('solscan')}
                                                sx={{ cursor: 'pointer' }}
                                                arrow
                                            >
                                                <img
                                                    src={SolscanLogo}
                                                    alt=""
                                                    width={20}
                                                    height={20}
                                                    style={{ marginLeft: 12, cursor: 'pointer' }}
                                                />
                                            </Tooltip>
                                            <Tooltip
                                                title="View on Explorer"
                                                placement="top"
                                                onClick={() => handleExplore('explorer')}
                                                sx={{ cursor: 'pointer' }}
                                                arrow
                                            >
                                                <img
                                                    src={ExplorerLogo}
                                                    alt=""
                                                    width={20}
                                                    height={20}
                                                    style={{ marginLeft: 6, cursor: 'pointer' }}
                                                />
                                            </Tooltip>
                                        </Typography>
                                    </Stack>
                                    {!loading && (
                                        <Stack>
                                            <IconButton onClick={() => updateView()}>
                                                <RefreshOutlined />
                                            </IconButton>
                                        </Stack>
                                    )}
                                </Box>
                            ) : (
                                <Skeleton variant="rounded" width="100%" height={216} />
                            )}
                            {nftData?.marketplace_program_id &&
                                (nftData?.price > 0 ? (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography component="p" color="primary">
                                            Current Price
                                        </Typography>
                                        <Typography
                                            component="h4"
                                            fontSize={20}
                                            fontWeight={700}
                                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                        >
                                            <SellOutlined color="secondary" /> {nftData?.price?.toLocaleString()} SOL
                                        </Typography>

                                        <MPActionButton
                                            {...{
                                                staked: false,
                                                listed: nftData?.owner !== wallet?.publicKey?.toBase58() && nftData?.price > 0,
                                                myBid: nftData?.myBid,
                                                noListing: false,
                                                price: nftData?.price,
                                                owner: nftData?.owner,
                                                broker_referral_address: nftData?.broker_referral_address,
                                                marketplace_program_id: nftData?.marketplace_program_id,
                                                tokenMint: nftData?.mint || nftData?.mintAddress,
                                                name: nftData?.name,
                                                updateView
                                            }}
                                        />
                                    </Box>
                                ) : (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography component="p" color="primary">
                                            Not Listed
                                        </Typography>
                                    </Box>
                                ))}
                        </MainCard>
                        <Grid container columnSpacing={2}>
                            <Grid item xs={12} lg={8}>
                                <MainCard border={false} boxShadow sx={{ borderRadius: 3, mt: 4, height: '100%' }}>
                                    {/* collection information */}
                                    {nftData?.name ? (
                                        <>
                                            <Box display="flex" justifyContent="space-between">
                                                <Stack>
                                                    <Typography component="h4" sx={{ fontSize: 18 }}>
                                                        Attributes
                                                    </Typography>
                                                </Stack>
                                            </Box>

                                            <Grid container sx={{ mt: 2 }} spacing={2}>
                                                {map(nftData?.attributes, ({ trait_type, value }) => (
                                                    <Grid key={trait_type} item xs={12} md={6} lg={4}>
                                                        <Typography color="primary" fontWeight={700}>
                                                            {trait_type}
                                                        </Typography>
                                                        <Typography fontWeight={700}>{value}</Typography>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </>
                                    ) : (
                                        <Skeleton variant="rounded" width="100%" height={248} />
                                    )}
                                </MainCard>
                            </Grid>
                            <Grid item xs={12} lg={4}>
                                <MainCard border={false} boxShadow sx={{ borderRadius: 3, mt: 4, height: '100%' }}>
                                    {/* collection information */}
                                    {nftData?.name ? (
                                        <>
                                            <Box display="flex" justifyContent="space-between">
                                                <Stack>
                                                    <Typography component="h4" sx={{ fontSize: 18 }}>
                                                        Details
                                                    </Typography>
                                                </Stack>
                                            </Box>

                                            <Stack>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        mt: 2
                                                    }}
                                                >
                                                    <Typography>Mint Address</Typography>
                                                    <Typography color="info" sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Tooltip
                                                            title="View on Solscan"
                                                            placement="top"
                                                            onClick={() => handleExplore('solscan')}
                                                            sx={{ cursor: 'pointer' }}
                                                            arrow
                                                        >
                                                            <img
                                                                src={SolscanLogo}
                                                                alt=""
                                                                width={16}
                                                                height={16}
                                                                style={{ marginRight: 6, cursor: 'pointer' }}
                                                            />
                                                        </Tooltip>
                                                        <Tooltip
                                                            title="View on Explorer"
                                                            placement="top"
                                                            onClick={() => handleExplore('explorer')}
                                                            sx={{ cursor: 'pointer' }}
                                                            arrow
                                                        >
                                                            <img
                                                                src={ExplorerLogo}
                                                                alt=""
                                                                width={16}
                                                                height={16}
                                                                style={{ marginRight: 6, cursor: 'pointer' }}
                                                            />
                                                        </Tooltip>
                                                        {shortenAddress(nftData?.mint || nftData?.mintAddress)}
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        mt: 2
                                                    }}
                                                >
                                                    <Typography>Owner</Typography>
                                                    <Typography color="info" sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Tooltip
                                                            title="View on Solscan"
                                                            placement="top"
                                                            onClick={() => handleExplore('solscan', nftData?.owner)}
                                                            sx={{ cursor: 'pointer' }}
                                                            arrow
                                                        >
                                                            <img
                                                                src={SolscanLogo}
                                                                alt=""
                                                                width={16}
                                                                height={16}
                                                                style={{ marginRight: 6, cursor: 'pointer' }}
                                                            />
                                                        </Tooltip>
                                                        <Tooltip
                                                            title="View on Explorer"
                                                            placement="top"
                                                            onClick={() => handleExplore('explorer', nftData?.owner)}
                                                            sx={{ cursor: 'pointer' }}
                                                            arrow
                                                        >
                                                            <img
                                                                src={ExplorerLogo}
                                                                alt=""
                                                                width={16}
                                                                height={16}
                                                                style={{ marginRight: 6, cursor: 'pointer' }}
                                                            />
                                                        </Tooltip>
                                                        <Typography
                                                            sx={{ cursor: 'pointer' }}
                                                            onClick={() => navigate(`/account/${nftData?.owner}`)}
                                                        >
                                                            {shortenAddress(nftData?.owner)}
                                                        </Typography>
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        mt: 2
                                                    }}
                                                >
                                                    <Typography>Royalties</Typography>
                                                    <Typography color="info">
                                                        {round((nftData?.seller_fee_basis_points || 0) / 100, 2)} %
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        mt: 2
                                                    }}
                                                >
                                                    <Typography>Transaction Fee</Typography>
                                                    <Typography color="info">2%</Typography>
                                                </Box>
                                            </Stack>
                                        </>
                                    ) : (
                                        <Skeleton variant="rounded" width="100%" height={248} />
                                    )}
                                </MainCard>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <MainCard border={false} boxShadow sx={{ borderRadius: 3, mt: 4 }}>
                            {nftData?.offers ? (
                                <>
                                    <Typography component="h4" sx={{ fontSize: 18 }}>
                                        Offers
                                    </Typography>
                                    <TokenBidsList
                                        listData={filter(
                                            orderBy(nftData?.offers, 'price', 'desc'),
                                            ({ expiry }) => moment.unix(expiry).isAfter() || expiry === 0
                                        )}
                                        chain="SOL"
                                    />
                                </>
                            ) : (
                                <Skeleton variant="rounded" width="100%" height={600} />
                            )}
                        </MainCard>
                    </Grid>
                    <Grid item xs={12}>
                        <MainCard border={false} boxShadow sx={{ borderRadius: 3, mt: 2 }}>
                            {nftData?.history ? (
                                <>
                                    <Typography component="h4" sx={{ fontSize: 18 }}>
                                        Activities
                                    </Typography>
                                    <TokenActivitiesList listData={nftData?.history} supply={nftData?.supply} chain="SOL" />
                                </>
                            ) : (
                                <Skeleton variant="rounded" width="100%" height={600} />
                            )}
                        </MainCard>
                    </Grid>
                </>
            </Grid>
        </>
    );
};

export default NFTDetailView;
