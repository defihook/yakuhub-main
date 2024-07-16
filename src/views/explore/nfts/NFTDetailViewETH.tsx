import { Box, CardMedia, Grid, IconButton, Skeleton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import Loading from 'components/Loading';
import MainCard from 'components/MainCard';
import Image from 'mui-image';
import { useNavigate, useParams } from 'react-router-dom';
import ETHscanLogo from 'assets/images/icons/eth.png';
import ExplorerLogoWhite from 'assets/images/icons/eth-explorer-white.png';
import ExplorerLogoBlack from 'assets/images/icons/eth-explorer-black.png';
import { useEffect, useState } from 'react';
import useAuthQuery from 'hooks/useAuthQuery';
import { queries } from '../../../graphql/graphql';
import useAuth from 'hooks/useAuth';
import { filter, map, orderBy, round } from 'lodash';
import { shortenAddress } from 'utils/utils';
import { RefreshOutlined, SellOutlined } from '@mui/icons-material';
import TokenActivitiesList from './components/TokenActivitiesList';
import MPActionButton from 'views/profile/components/MPActionButton';
import TokenBidsList from './components/TokenBidsList';
import moment from 'moment';
import FsLightbox from 'fslightbox-react';
import { useEthcontext } from 'contexts/EthWalletProvider';

const NFTDetailViewETH = () => {
    const auth = useAuth();
    const { ethAddress, ethConnect } = useEthcontext();
    const navigate = useNavigate();
    const theme = useTheme();
    const { projectId, mint: tokenAddress } = useParams();
    const [loading, setLoading] = useState(true);
    const [toggler, setToggler] = useState(false);

    const [nftData, setNftData] = useState<any>({});
    const [nftOffers, setNftOffers] = useState<any>({});
    const [nftHistory, setNftHistory] = useState<any>({});

    const { data: projectData, refetch: refetchProjectData } = useAuthQuery(queries.GET_ETH_NFT, {
        skip: !projectId,
        variables: {
            projectIds: [projectId],
            tokenId: tokenAddress
        }
    });

    const updateView = async () => {
        console.log('tokenAddress', tokenAddress);

        if (!tokenAddress) {
            return;
        }

        setLoading(true);

        const { data: newProjectData } = await refetchProjectData();
        setNftData(newProjectData?.getNFTStats?.nft_stats[0]);
        setNftOffers(newProjectData?.getNFTStats?.nft_offers);
        setNftHistory(newProjectData?.getNFTStats?.nft_tx_history);

        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        if (auth.token) {
            updateView();
        }
    }, [auth.token]);

    useEffect(() => {
        if (!ethAddress) {
            ethConnect();
        }
    }, [ethAddress]);

    const handleExplore = (site: string, mint?: string) => {
        switch (site) {
            case 'etherscan':
                window.open(`https://etherscan.io/token/${mint || projectId}`, '_blank');
                break;
            case 'explorer':
                window.open(`https://etherscan.io/address/${mint || projectId}`, '_blank');
                break;
            default:
                window.open(`https://etherscan.io/token/${mint || projectId}`, '_blank');
                break;
        }
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
                                            src={`${nftData?.image}`}
                                            showLoading={<Loading />}
                                            alt=""
                                            style={{ aspectRatio: '1 / 1' }}
                                        />
                                    </Typography>
                                </CardMedia>
                            ) : (
                                <Skeleton variant="rounded" width="100%" height="100%" sx={{ aspectRatio: '1 / 1' }} />
                            )}
                        </MainCard>
                        <MainCard border={false} boxShadow sx={{ borderRadius: 3, mt: 4 }}>
                            {/* collection information */}
                            {/* {nftData?.description ? ( */}
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
                            {/* ) : (
                                <Skeleton variant="rounded" width="100%" height={110} />
                            )} */}
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
                                            onClick={() => navigate(`/explore/collection/ETH/${projectId}`)}
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
                                                title="View on Etherscan"
                                                placement="top"
                                                onClick={() => handleExplore('etherscan')}
                                                sx={{ cursor: 'pointer' }}
                                                arrow
                                            >
                                                <img
                                                    src={ETHscanLogo}
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
                                                    src={theme.palette.mode === 'dark' ? ExplorerLogoBlack : ExplorerLogoWhite}
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
                                            <SellOutlined color="secondary" /> {nftData?.price?.toLocaleString()} ETH
                                        </Typography>

                                        <MPActionButton
                                            {...{
                                                staked: false,
                                                listed: nftData?.owner !== ethAddress && nftData?.price > 0,
                                                myBid: nftData?.myBid,
                                                noListing: false,
                                                price: nftData?.price,
                                                owner: nftData?.owner,
                                                broker_referral_address: nftData?.broker_referral_address,
                                                marketplace_program_id: nftData?.marketplace_program_id,
                                                tokenMint: nftData?.mintAddress,
                                                name: nftData?.name,
                                                updateView,
                                                projectId,
                                                tokenAddress,
                                                chain: 'ETH'
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
                                                {map(nftData?.attributes, ({ key, value }) => (
                                                    <Grid key={key} item xs={12} md={6} lg={4}>
                                                        <Typography color="primary" fontWeight={700}>
                                                            {key}
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
                                                            title="View on Etherscan"
                                                            placement="top"
                                                            onClick={() => handleExplore('etherscan')}
                                                            sx={{ cursor: 'pointer' }}
                                                            arrow
                                                        >
                                                            <img
                                                                src={ETHscanLogo}
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
                                                                src={theme.palette.mode === 'dark' ? ExplorerLogoBlack : ExplorerLogoWhite}
                                                                alt=""
                                                                width={16}
                                                                height={16}
                                                                style={{ marginRight: 6, cursor: 'pointer' }}
                                                            />
                                                        </Tooltip>
                                                        {shortenAddress(nftData?.contract)}
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
                                                            title="View on Etherscan"
                                                            placement="top"
                                                            onClick={() => handleExplore('etherscan', nftData?.owner)}
                                                            sx={{ cursor: 'pointer' }}
                                                            arrow
                                                        >
                                                            <img
                                                                src={ETHscanLogo}
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
                                                                src={theme.palette.mode === 'dark' ? ExplorerLogoBlack : ExplorerLogoWhite}
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
                                                {false && (
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
                                                )}
                                                {false && (
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
                                                )}
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
                            {nftOffers ? (
                                <>
                                    <Typography component="h4" sx={{ fontSize: 18 }}>
                                        Offers
                                    </Typography>
                                    <TokenBidsList
                                        listData={filter(
                                            orderBy(nftOffers, 'price', 'desc'),
                                            ({ expiry }) => moment.unix(expiry).isAfter() || expiry === 0
                                        )}
                                        chain="ETH"
                                    />
                                </>
                            ) : (
                                <Skeleton variant="rounded" width="100%" height={600} />
                            )}
                        </MainCard>
                    </Grid>
                    <Grid item xs={12}>
                        <MainCard border={false} boxShadow sx={{ borderRadius: 3, mt: 2 }}>
                            {nftHistory ? (
                                <>
                                    <Typography component="h4" sx={{ fontSize: 18 }}>
                                        Activities
                                    </Typography>
                                    <TokenActivitiesList listData={nftHistory} supply={nftData?.supply} chain="ETH" />
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

export default NFTDetailViewETH;
