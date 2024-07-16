/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';

// material-ui
import { Box, Grid, Typography, Tooltip, Button } from '@mui/material';

// project imports
import { useToasts } from 'hooks/useToasts';
import { gridSpacing } from 'store/constant';

// gql
import { queries } from '../../graphql/graphql';

// assets
import ProjectCard from 'components/cards/ProjectCard';
import { map } from 'lodash';
import NFTPProjectMoverView from 'components/NFTProjectMoverView';
import NFTProjectVolumeView from 'components/NFTProjectVolumeView';
import NFTProjectPlaceholder from 'components/cards/Skeleton/NFTProjectPlaceholder';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'store';
import { activeItem } from 'store/slices/menu';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useSolPrice } from 'contexts/CoinGecko';
import { getTokenBalance, getUserPoolData } from 'views/yaku/staking/fetchData';
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { claimRewardAll, withdrawAllNft } from 'actions/stake';
import { PublicKey } from '@solana/web3.js';
import { loadYakuProgram, stakeNftV2Multiple } from 'actions/yakuStake';
import { getATokenAddrFungible } from 'actions/shared';
import { LoadingButton } from '@mui/lab';
import { COSMIC_TOKEN_MINT } from 'config';
import NFTProjectVolMoverView from 'components/NFTProjectVolMoverView';
import useConnections from 'hooks/useConnetions';
import { useQuery } from '@apollo/client';
import DetailView from './components/DetailView';
import TopAlert from './components/TopAlert';
import StatsGrid from './components/StatsGrid';
import StakedStatisticView from './components/StakedStatisticView';
import SiteStats from './components/SiteStats';

const Dashboard = () => {
    const showCAConvert = true;
    const { connection } = useConnections();
    const mainWallet: any = useWallet();
    const wallet: any = useAnchorWallet();
    const solPrice = useSolPrice();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [oldStaked, setOldStaked] = useState<any>({});
    const [loading, setLoading] = useState<any>(false);
    const { showInfoToast, showSuccessToast } = useToasts();

    const [isLoading, setIsLoading] = useState(true);
    const type = 'SOL';
    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, []);
    const { data: leaderboards } = useQuery(queries.GET_LEADERBOARDS, {
        fetchPolicy: 'network-only'
    });
    const { data: yakuCollections } = useQuery(queries.GET_YAKU_STATS, {
        fetchPolicy: 'network-only'
    });

    const handleConvertStake = async () => {
        if (oldStaked && oldStaked.staked && oldStaked.staked.length > 0) {
            try {
                setLoading(true);
                await withdrawAllNft(
                    connection,
                    mainWallet,
                    map(oldStaked.staked, ({ mint }) => new PublicKey(mint))
                );
                const program = loadYakuProgram(connection, wallet);
                const mintList = map(oldStaked.staked, ({ mint }) => new PublicKey(mint));
                await stakeNftV2Multiple(connection, program, wallet, mintList);
                showSuccessToast('You have converted all of your NFTs to new staking contract.');
            } catch (error) {
                console.error(error);
                showInfoToast('There may be congestion in Solana Network, you may try again or check in Stake Page.');
            } finally {
                await getOldStaked();
                setLoading(false);
            }
        }
    };

    const handleClaimAll = async () => {
        try {
            await claimRewardAll(connection, mainWallet);
            showInfoToast('You have claimed all of your $COSMIC.');
        } catch (error) {
            console.error(error);
            showInfoToast('There may be congestion in Solana Network, you may try again or check in Stake Page.');
        } finally {
            await getOldStaked();
        }
    };

    const getOldStaked = async () => {
        const { staked = [], claimReward = 0 } = await getUserPoolData({ connection, wallet });

        const tokenAccountAddress = await getATokenAddrFungible(connection, wallet.publicKey, COSMIC_TOKEN_MINT);
        let cosmicBal = 0;
        if (tokenAccountAddress) {
            cosmicBal = (await getTokenBalance(connection, tokenAccountAddress, mainWallet, false)) || 0;
        }
        setOldStaked({ staked, claimReward, cosmicBal });
    };

    const handleNavigate = (projectId: string) => {
        navigate(`/explore/collection/${type}/${projectId}`);
        dispatch(activeItem(['collection']));
    };
    useEffect(() => {
        if (showCAConvert && mainWallet && mainWallet.publicKey) {
            getOldStaked();
        }
    }, [mainWallet.connected]);

    return (
        <Grid container rowSpacing={4.5} columnSpacing={2.75} sx={{ pt: 2 }}>
            {oldStaked && oldStaked.staked && oldStaked.staked.length > 0 && (
                <Grid item xs={12}>
                    <TopAlert
                        severity="warning"
                        description="Cosmic Astronauts original staking contract will be tapped out soon. Please click the button to convert them
                                to Yaku staking contract."
                        buttons={
                            <LoadingButton
                                loading={loading}
                                variant="contained"
                                color="warning"
                                sx={{ minWidth: 120 }}
                                onClick={handleConvertStake}
                            >
                                <Typography noWrap>Convert All</Typography>
                            </LoadingButton>
                        }
                    />
                </Grid>
            )}
            {oldStaked && (oldStaked.claimReward > 0 || oldStaked.cosmicBal > 0) && (
                <Grid item xs={12}>
                    <TopAlert
                        severity="warning"
                        description="$COSMIC will be tapped out soon. Please click the button to claim all $COSMIC and go to the conversion site
                                to exchange for $YAKU."
                        buttons={
                            <>
                                {oldStaked.claimReward > 0 && (
                                    <Button variant="contained" color="warning" sx={{ minWidth: 120 }} onClick={handleClaimAll}>
                                        <Typography noWrap>Claim All</Typography>
                                    </Button>
                                )}
                                {oldStaked.cosmicBal > 0 && (
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        sx={{ minWidth: 120 }}
                                        onClick={() => window.open('https://yaku-conversion-dapp.vercel.app/', '_blank')}
                                    >
                                        <Typography noWrap>Convert</Typography>
                                    </Button>
                                )}
                            </>
                        }
                    />
                </Grid>
            )}
            <StatsGrid
                title={
                    <>
                        Top Floor Movers{' '}
                        <Tooltip title="Top floor movers with more than $100 volume in 1hr and $1000 volume in 1D">
                            <InfoCircleOutlined />
                        </Tooltip>
                    </>
                }
                stats={leaderboards?.getLeaderboards?.topFloorMovers}
                count={3}
                component={(item: any, idx: number) => (
                    <NFTPProjectMoverView index={idx} key={idx} {...item} navigate={() => handleNavigate(item?.project_id)} />
                )}
                placeholder={<NFTProjectPlaceholder />}
            />

            <StatsGrid
                title="Top Volume (1D)"
                stats={leaderboards?.getLeaderboards?.topVolMovers}
                count={3}
                component={(item: any, idx: number) => (
                    <NFTProjectVolMoverView index={idx} key={idx} {...item} navigate={() => handleNavigate(item?.project_id)} />
                )}
                placeholder={<NFTProjectPlaceholder />}
            />

            <StatsGrid
                title="Top Volume (7D)"
                stats={leaderboards?.getLeaderboards?.topSales}
                count={3}
                component={(item: any, idx: number) => (
                    <NFTProjectVolumeView index={idx} key={idx} {...item} navigate={() => handleNavigate(item?.project_id)} />
                )}
                placeholder={<NFTProjectPlaceholder />}
            />

            {/* collection stats */}
            <Grid item xs={12} sx={{ mb: -2.25 }}>
                <Box display="flex" flexDirection="row" alignItems="center">
                    <Typography variant="h2">Yaku Collection Statistics</Typography>
                </Box>
            </Grid>

            {/* collection cards: TODO move into a 'slider' once we expand collections */}
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12} sm={6} lg={3}>
                        <ProjectCard
                            image="https://bafybeibkjcrnct6ihayjhk5567572a5ai2bhnwb7sk3mh4yhu7pa45al5e.ipfs.dweb.link"
                            name="Yaku Engineering ONI-S01"
                            description="YAKU Engineering ONI-S01 is the first playable customizable motorcycle in the Yakuverse..."
                            onClick={() => handleNavigate('yakucorp1')}
                        >
                            <DetailView
                                solPrice={solPrice}
                                projectStats={yakuCollections?.getYakuCollectionsStats?.stats}
                                projectId="yakucorp1"
                            />
                        </ProjectCard>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <ProjectCard
                            image="https://bafybeibzxwkiwhebjotva2duekzrnpnd7t3fp3tvz2hu5dbrl2qqaokvmm.ipfs.dweb.link/"
                            name="Yaku | Capsule X"
                            description="Hang out in your Yakuverse capsule apartment with friends, play games, customize your motorcycle..."
                            onClick={() => handleNavigate('capsulex')}
                        >
                            <DetailView
                                solPrice={solPrice}
                                projectStats={yakuCollections?.getYakuCollectionsStats?.stats}
                                projectId="capsulex"
                            />
                        </ProjectCard>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <ProjectCard
                            image="https://bafybeigaq3x3iz3v24qjnv26ql7c7fstll6reolqbxkpncpbpa23bovgva.ipfs.dweb.link/"
                            name="Yaku X"
                            description="YAKU X is the customizable playable avatar of the Yakuverse - Travel the Yakuverse, buy properties..."
                            onClick={() => handleNavigate('yakux')}
                        >
                            <DetailView
                                solPrice={solPrice}
                                projectStats={yakuCollections?.getYakuCollectionsStats?.stats}
                                projectId="yakux"
                            />
                        </ProjectCard>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <StakedStatisticView project_stats={yakuCollections?.getYakuCollectionsStats?.stats} />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12}>
                        <SiteStats />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Dashboard;
