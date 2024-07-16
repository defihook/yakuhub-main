/* eslint-disable */
import { ReactElement, useState, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Grid, Button, Tooltip, Tab, Box, IconButton, Stack, styled, Paper, Skeleton } from '@mui/material';

// web3 imports
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { calculateAllRewards, claimRewardAll } from 'actions/stake';

// project imports
import RevenueCard from 'components/cards/RevenueCard';
import SkeletonProductPlaceholder from 'components/cards/Skeleton/CardPlaceholder';
import MainCard from 'components/cards/MainCard';
import StakeEmpty from './StakeEmpty';
import StakedNftCard from './StakedNftCard';
import NftCard from './StakeNftCard';
import { useSolPrice } from 'contexts/CoinGecko';
import { formatNumber, formatUSD } from 'utils/utils';
import { useMeta } from 'contexts/meta/meta';
import { useToasts } from 'hooks/useToasts';
import { gridSpacing } from 'store/constant';

// assets
import MonetizationOnTwoToneIcon from '@mui/icons-material/MonetizationOnTwoTone';
import AccountBalanceTwoToneIcon from '@mui/icons-material/AccountBalanceTwoTone';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import EqualizerTwoToneIcon from '@mui/icons-material/EqualizerTwoTone';

import { calculateAllYakuRewards } from './fetchData';
import YakuStakeNftCard from './YakuStakedNftCard';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { claimRewardV2Multiple, loadYakuProgram, stakeNftV2Multiple, unStakeNftV2Multiple } from 'actions/yakuStake';
import { map } from 'lodash';
import { PublicKey } from '@solana/web3.js';
import { RefreshOutlined } from '@mui/icons-material';
import { FormattedMessage } from 'react-intl';
import useConnections from 'hooks/useConnetions';
import useStaked from 'hooks/useStaked';

function Staking() {
    const { connection } = useConnections();
    const theme = useTheme();

    const {
        totalStaked,
        setTotalStaked,
        valueLocked,
        setValueLocked,
        tokenDistributed,
        dailyYield,
        nftList,
        stakedNfts,
        stakedYakuNfts,
        rewardAmount,
        setRewardAmount,
        yakuRewardAmount,
        setYakuRewardAmount,
        totalCount,
        assetsCount,
        updateContext
    } = useStaked();

    const { showInfoToast, showErrorToast } = useToasts();
    const { startLoading, stopLoading } = useMeta();
    const wallet: any = useAnchorWallet();
    const mainWallet = useWallet();

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingJson, setIsLoadingJson] = useState(false);

    const [tabIdx, setTabIdx] = useState(nftList.length > 0 ? '1' : '2');
    const solPrice = useSolPrice();

    let timer: any;

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setTabIdx(newValue);
    };

    // Claim all COSMIC
    const claimAll = async () => {
        try {
            startLoading();
            await claimRewardAll(connection, mainWallet);
            showInfoToast('You have claimed all of your $COSMIC.');
            updatePage();
        } catch (error) {
            showErrorToast('An error has occured while claiming your rewards, please try again.');
            console.error(error);
        } finally {
            stopLoading();
        }
    };

    const claimAllYaku = async () => {
        try {
            startLoading();
            const program = loadYakuProgram(connection, wallet);
            const mintList = map(stakedYakuNfts, ({ mint }) => new PublicKey(mint));
            await claimRewardV2Multiple(connection, program, wallet, mintList);
            showInfoToast('You have claimed all of your $YAKU.');
            updatePage();
        } catch (error) {
            showErrorToast('An error has occured while claiming your rewards, please try again.');
            console.error(error);
        } finally {
            stopLoading();
        }
    };

    const stakeAll = async () => {
        try {
            startLoading();
            const program = loadYakuProgram(connection, wallet);
            const mintList = map(nftList, ({ mint, mintAddress }) => new PublicKey(mint || mintAddress));
            await stakeNftV2Multiple(connection, program, wallet, mintList);
            showInfoToast('You have staked all of your NFTs.');
            updatePage();
        } catch (error) {
            showErrorToast('An error has occured while staking your nfts, please try again.');
            console.error(error);
        } finally {
            stopLoading();
        }
    };

    const unstakeAll = async () => {
        try {
            startLoading();
            const program = loadYakuProgram(connection, wallet);
            const mintList = map(stakedYakuNfts, ({ mint, mintAddress }) => new PublicKey(mint || mintAddress));
            await unStakeNftV2Multiple(connection, program, wallet, mintList);
            showInfoToast('You have unstaked all of your NFTs.');
            updatePage();
        } catch (error) {
            showErrorToast('An error has occured while unstaking your nfts, please try again.');
            console.error(error);
        } finally {
            stopLoading();
        }
    };

    const refreshYakuReward = () => {
        timer = setInterval(() => {
            const rewardAmount = calculateAllYakuRewards(stakedYakuNfts);
            if (rewardAmount) {
                setYakuRewardAmount(rewardAmount);
            }
        }, 1000);
    };

    const updatePage = () => {
        updateContext();
    };

    useEffect(() => {
        if (!wallet || wallet.publicKey === null) {
            return;
        }
        updatePage();

        let timerId = 0;
        const queryClaimAmount = async () => {
            const claimReward = await calculateAllRewards(connection, wallet);
            setRewardAmount(claimReward);

            startTimer();
        };

        const startTimer = () => {
            timerId = window.setTimeout(async () => {
                await queryClaimAmount();
            }, 35000);
        };

        queryClaimAmount();
        return () => {
            clearTimeout(timerId);
        };
    }, []);

    useEffect(() => {
        refreshYakuReward();
        return () => clearInterval(timer);
    }, [stakedYakuNfts]);

    let stakedNftResult: ReactElement | ReactElement[] = <></>;
    if (stakedNfts && stakedNfts.length !== 0) {
        stakedNftResult = stakedNfts.map((nft: any, index: number) => (
            <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
                <StakedNftCard
                    mint={nft.mint}
                    name={nft.name}
                    image={nft.image}
                    role={nft.role}
                    lockTime={nft.lockTime}
                    rate={nft.rate}
                    rewardTime={nft.rewardTime}
                    stakedTime={nft.stakedTime}
                    startLoading={() => startLoading()}
                    stopLoading={() => stopLoading()}
                    updatePage={() => updatePage()}
                    loading={isLoading}
                />
            </Grid>
        ));
    } else {
        stakedNftResult = <></>;
    }

    let stakedYakuNftResult: ReactElement | ReactElement[] = <></>;
    if (stakedYakuNfts && stakedYakuNfts.length !== 0) {
        stakedYakuNftResult = stakedYakuNfts.map((nft: any, index: number) => (
            <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
                <YakuStakeNftCard
                    mint={nft.mint || nft.mintAddress}
                    name={nft.name}
                    image={nft.image}
                    reward={nft.reward}
                    traits={nft.traits}
                    interval={nft.interval}
                    lastClaim={nft.lastClaim}
                    amount={nft.amount}
                    startLoading={() => startLoading()}
                    stopLoading={() => stopLoading()}
                    updatePage={() => updatePage()}
                    loading={isLoading}
                />
            </Grid>
        ));
    } else {
        stakedYakuNftResult = <></>;
    }

    let nftResult: ReactElement | ReactElement[] = <></>;
    if (nftList && nftList.length !== 0) {
        nftResult = nftList.map((nft: any, index: number) => (
            <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
                <NftCard
                    mint={nft.mint || nft.mintAddress}
                    reward={nft.reward}
                    name={nft.name}
                    image={nft.image}
                    traits={nft.traits}
                    startLoading={() => startLoading()}
                    stopLoading={() => stopLoading()}
                    updatePage={() => updatePage()}
                    loading={isLoading}
                />
            </Grid>
        ));
    } else if (nftList && nftList.length === 0) {
        nftResult = (
            <Grid item xs={12}>
                <StakeEmpty />
            </Grid>
        );
    }

    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary
    }));

    return (
        <>
            <Grid container spacing={gridSpacing} sx={{ pb: 2 }}>
                <Grid item xs={12} lg={3} sm={6}>
                    <RevenueCard
                        primary={<FormattedMessage id="total-staked" />}
                        secondary={formatNumber.format(totalStaked)}
                        content={<FormattedMessage id="vault-holdings" />}
                        iconPrimary={AccountBalanceTwoToneIcon}
                        iconSx={{
                            top: 'calc((100% - 48px)/2)',
                            '&> svg': { width: 48, height: 48, opacity: '0.5' },
                            [theme.breakpoints.down('sm')]: {
                                top: 'calc((100% - 32px)/2)',
                                '&> svg': { width: 32, height: 32 }
                            }
                        }}
                        color={theme.palette.secondary.dark}
                    />
                </Grid>

                <Grid item xs={12} lg={3} sm={6}>
                    <RevenueCard
                        primary={<FormattedMessage id="tvl" />}
                        secondary={formatUSD.format(valueLocked)}
                        content={<FormattedMessage id="tvl-desc" />}
                        iconPrimary={MonetizationOnTwoToneIcon}
                        iconSx={{
                            top: 'calc((100% - 48px)/2)',
                            '&> svg': { width: 48, height: 48, opacity: '0.5' },
                            [theme.breakpoints.down('sm')]: {
                                top: 'calc((100% - 32px)/2)',
                                '&> svg': { width: 32, height: 32 }
                            }
                        }}
                        color={theme.palette.primary.dark}
                    />
                </Grid>

                <Grid item xs={12} lg={3} sm={6}>
                    <RevenueCard
                        primary={<FormattedMessage id="distributed" />}
                        secondary={formatNumber.format(tokenDistributed)}
                        content={<FormattedMessage id="est-circular-supply" />}
                        iconPrimary={EqualizerTwoToneIcon}
                        iconSx={{
                            top: 'calc((100% - 48px)/2)',
                            '&> svg': { width: 48, height: 48, opacity: '0.5' },
                            [theme.breakpoints.down('sm')]: {
                                top: 'calc((100% - 32px)/2)',
                                '&> svg': { width: 32, height: 32 }
                            }
                        }}
                        color={theme.palette.warning.main}
                    />
                </Grid>

                <Grid item xs={12} lg={3} sm={6}>
                    <RevenueCard
                        primary={<FormattedMessage id="daily-yield" />}
                        secondary={formatNumber.format(dailyYield)}
                        content={<FormattedMessage id="daily-yield-desc" />}
                        iconPrimary={FormatListBulletedTwoToneIcon}
                        iconSx={{
                            top: 'calc((100% - 48px)/2)',
                            '&> svg': { width: 48, height: 48, opacity: '0.5' },
                            [theme.breakpoints.down('sm')]: {
                                top: 'calc((100% - 32px)/2)',
                                '&> svg': { width: 32, height: 32 }
                            }
                        }}
                        color={theme.palette.info.dark}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={gridSpacing} sx={{ pb: 2 }}>
                <Grid item xs={6} lg={2} md={3} sm={4}>
                    <Stack>
                        <Item>
                            Your Assets
                            <br />
                            {totalCount}
                        </Item>
                    </Stack>
                </Grid>
                <Grid item xs={6} lg={2} md={3} sm={4}>
                    <Stack>
                        <Item>
                            Yaku X
                            <br />
                            {isLoadingJson ? (
                                <Skeleton variant="rounded" sx={{ mx: 'auto' }} width={60} height={16} />
                            ) : (
                                assetsCount?.yakuXCnt ?? 0
                            )}
                        </Item>
                    </Stack>
                </Grid>
                <Grid item xs={6} lg={2} md={3} sm={4}>
                    <Stack>
                        <Item>
                            Capsule X
                            <br />
                            {isLoadingJson ? (
                                <Skeleton variant="rounded" sx={{ mx: 'auto' }} width={60} height={16} />
                            ) : (
                                assetsCount?.capsuleCnt ?? 0
                            )}
                        </Item>
                    </Stack>
                </Grid>
                <Grid item xs={6} lg={2} md={3} sm={4}>
                    <Stack>
                        <Item>
                            ONI S-01
                            <br />
                            {isLoadingJson ? (
                                <Skeleton variant="rounded" sx={{ mx: 'auto' }} width={60} height={16} />
                            ) : (
                                assetsCount?.bikeCnt ?? 0
                            )}
                        </Item>
                    </Stack>
                </Grid>
                <Grid item xs={6} lg={2} md={3} sm={4}>
                    <Stack>
                        <Item>
                            Mansion
                            <br />
                            {isLoadingJson ? (
                                <Skeleton variant="rounded" sx={{ mx: 'auto' }} width={60} height={16} />
                            ) : (
                                assetsCount?.mansionCnt ?? 0
                            )}
                        </Item>
                    </Stack>
                </Grid>
                <Grid item xs={6} lg={2} md={3} sm={4}>
                    <Stack>
                        <Item>
                            Sets
                            <br />
                            {isLoadingJson ? (
                                <Skeleton variant="rounded" sx={{ mx: 'auto' }} width={60} height={16} />
                            ) : (
                                assetsCount?.setCnt ?? 0
                            )}
                        </Item>
                    </Stack>
                </Grid>
            </Grid>

            <TabContext value={tabIdx}>
                <MainCard
                    sx={{
                        '.MuiCardHeader-root': {
                            overflowX: 'auto'
                        }
                    }}
                    title={
                        <Box
                            sx={{
                                display: 'flex'
                            }}
                        >
                            <TabList
                                onChange={handleTabChange}
                                sx={{
                                    marginTop: '-12px',
                                    '.MuiTabs-flexContainer': { borderBottom: 'none' }
                                }}
                                textColor="secondary"
                                indicatorColor="secondary"
                            >
                                <Tab label={<FormattedMessage id="unstaked" />} id="unstakedTab" value="1" />
                                <Tab label={<FormattedMessage id="staked" />} id="stakedTab" value="2" />
                            </TabList>
                        </Box>
                    }
                    secondary={
                        <>
                            {tabIdx === '1' && (
                                <>
                                    <Button
                                        color="secondary"
                                        variant="contained"
                                        disabled={nftList && !nftList.length}
                                        onClick={() => stakeAll()}
                                        sx={{ ml: 2 }}
                                    >
                                        <FormattedMessage id="stake-all" />
                                    </Button>
                                </>
                            )}
                            {tabIdx === '2' && (
                                <>
                                    <Button color="error" variant="contained" onClick={() => unstakeAll()} sx={{ ml: 2 }}>
                                        <FormattedMessage id="unstake-all" />
                                    </Button>
                                    {rewardAmount > 0 && (
                                        <Tooltip
                                            title="You may lose 25% of accumlated rewards if claiming within 15 days of the original staking date."
                                            arrow
                                        >
                                            <Button color="secondary" variant="contained" onClick={() => claimAll()} sx={{ ml: 2 }}>
                                                <FormattedMessage id="claim-all" /> ({rewardAmount.toLocaleString()} $COSMIC)
                                            </Button>
                                        </Tooltip>
                                    )}
                                    <Button color="warning" variant="contained" onClick={() => claimAllYaku()} sx={{ ml: 2 }}>
                                        <FormattedMessage id="claim-all" /> ({yakuRewardAmount.toFixed(3).toLocaleString()} $YAKU)
                                    </Button>
                                </>
                            )}
                            <IconButton sx={{ ml: 2 }} onClick={() => updatePage()}>
                                <RefreshOutlined />
                            </IconButton>
                        </>
                    }
                >
                    {/* Content */}
                    <TabPanel value="1">
                        <Grid container spacing={gridSpacing}>
                            {isLoading ? (
                                [1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                                    <Grid key={item} item xs={12} sm={6} md={4} lg={3}>
                                        <SkeletonProductPlaceholder />
                                    </Grid>
                                ))
                            ) : (
                                <>{nftResult}</>
                            )}
                        </Grid>
                    </TabPanel>

                    <TabPanel value="2">
                        <Grid container spacing={gridSpacing}>
                            {isLoading ? (
                                [1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                                    <Grid key={item} item xs={12} sm={6} md={4} lg={3}>
                                        <SkeletonProductPlaceholder />
                                    </Grid>
                                ))
                            ) : (
                                <>
                                    {stakedNftResult}
                                    {stakedYakuNftResult}
                                </>
                            )}
                        </Grid>
                    </TabPanel>
                </MainCard>
            </TabContext>
        </>
    );
}

export default Staking;
