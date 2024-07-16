/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
import { Avatar, Box, Grid, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { IMAGE_PROXY, YAKU_TOKEN_ICON } from 'config/config';
import { mutations, queries } from '../../graphql/graphql';
import useAuth from 'hooks/useAuth';
import useAuthQuery from 'hooks/useAuthQuery';
import { useParams } from 'react-router-dom';
import { shortenAddress } from 'utils/utils';

import ProfileImage from '../../assets/images/profile-image.jpeg';
import { useEffect, useState } from 'react';
import { filter, flatten, isEmpty, isFunction, map, round } from 'lodash';
import MainCard from 'components/MainCard';
import { IconWallet } from '@tabler/icons';
import { PublicKey } from '@solana/web3.js';
import SolanaLogo from 'assets/images/icons/solana-logo.png';
import EthLogo from 'assets/images/blockchains/ethereum-icon.png';
import PortfolioChart from './components/PortfolioChart';
import NFTCollectionsView from './components/NFTCollectionsView';
import { InfoCircleOutlined } from '@ant-design/icons';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import useAuthMutation from 'hooks/useAuthMutation';
import useConnections from 'hooks/useConnetions';
// eslint-disable-next-line
import ProfileBanner from './components/ProfileBanner';
import AvatarSection from './components/AvatarSection';
import { useMeta } from 'contexts/meta/meta';
import useStaked from 'hooks/useStaked';
import { ChatMainRouteName, ChatRouteName, useDialectUi } from '@dialectlabs/react-ui';
import NFTsDialog from './components/NFTsDialog';
import { ETH_WEI, useEthcontext } from 'contexts/EthWalletProvider';
import Web3 from 'web3';

const Profile = () => {
    const { connection } = useConnections();
    const { getWalletNfts, ethConnected, ethConnect, ethAddress } = useEthcontext();
    const theme = useTheme();
    const auth = useAuth();
    const { open, navigation } = useDialectUi();

    const { getStakedList, stakedYakuNfts: hookedYakuNfts } = useStaked();

    const mainWallet = useWallet();
    const { wallet = mainWallet.publicKey?.toBase58() } = useParams();
    const [nfts, setNfts] = useState<{ staked: any[]; nftsList: any[] }>({ staked: [], nftsList: [] });
    const [ethNfts, setEthNfts] = useState<any[]>([]);
    const [walletStats, setWalletStats] = useState<any>({});
    const [balance, setBalance] = useState<any>(0);
    const [ethBalance, setEthBalance] = useState('0');
    const [tokenBalance, setTokenBalance] = useState<any>(0);
    const [profilePic, setProfilePic] = useState<any>();
    const [displayName, setDisplayName] = useState<any>('');
    const [ownedNftCount, setOwnedNftCount] = useState<number>(0);
    const [collections, setCollections] = useState<any[]>([]);
    const [netWorth, setNetWorth] = useState<number>(0);
    const { fetchBalance, fetchYakuBalance } = useMeta();
    const [showSelectNft, setShowSelectNft] = useState(false);
    const { data: walletUser } = useAuthQuery(queries.USER, {
        variables: {
            wallet
        }
    });
    const { data: followed, refetch: fetchIsFollowed } = useAuthQuery(queries.IS_FOLLOWED, {
        skip: !auth?.user?.id,
        variables: {
            user: auth?.user?.id,
            wallet
        }
    });
    const { data: followers, refetch: fetchFollowers } = useAuthQuery(queries.GET_USER_FOLLOWERS, {
        variables: {
            wallet
        }
    });
    const { data: followings, refetch: fetchFollowings } = useAuthQuery(queries.GET_USER_FOLLOWINGS, {
        variables: {
            wallet
        }
    });
    const { data: walletAvatar } = useAuthQuery(queries.GET_WALLET_AVATAR, {
        variables: {
            wallet
        }
    });
    const { data } = useAuthQuery(queries.GET_WALLET_STATS, {
        variables: {
            condition: {
                searchAddress: wallet,
                timePeriod: 'ALL',
                includeUserRank: false
            }
        }
    });
    const [getNFTsByOwner] = useAuthLazyQuery(queries.GET_NFTS_BY_WALLET, {
        skip: !wallet,
        variables: {
            wallet
        },
        fetchPolicy: 'network-only'
    });
    const [getToken] = useAuthLazyQuery(queries.GET_TOKEN_BY_MINT);
    const [toggleFollow] = useAuthMutation(mutations.FOLLOW_WALLET_TOGGLE);

    const handleChat = () => {
        open('dialect-bottom-chat');
        if (navigation && navigation['dialect-bottom-chat'] && isFunction(navigation['dialect-bottom-chat'].navigate)) {
            navigation['dialect-bottom-chat'].navigate(ChatRouteName.Main, {
                sub: {
                    name: ChatMainRouteName.CreateThread,
                    params: { receiver: wallet }
                }
            });
        }
    };

    const handleShowSelectNft = () => {
        setShowSelectNft(true);
        console.log(flatten(map(collections, ({ items }) => items)));
    };

    const handleFollow = async () => {
        await toggleFollow({
            variables: {
                user: auth?.user?.id,
                wallet
            }
        });
        await fetchIsFollowed();
        await fetchFollowers();
        await fetchFollowings();
    };

    const fetchNFTs = async () => {
        if (!wallet) {
            return;
        }
        const { data: nftData } = await getNFTsByOwner({
            variables: {
                wallet
            }
        });

        const nftsList = map(nftData?.getWallet ?? [], ({ mint, metadata }) => ({ ...metadata, ...(metadata.json || {}), mint }));

        setOwnedNftCount(nftData?.getWallet?.length ?? 0);

        if (mainWallet.publicKey?.toBase58() !== wallet) {
            const staked = await getStakedList(false, wallet);
            setNfts({
                staked,
                nftsList
            });
        } else {
            setNfts({ staked: hookedYakuNfts, nftsList });
        }
    };

    const getAvatar = (userProfile: any, proxy = IMAGE_PROXY) => {
        if (userProfile?.avatar) {
            setProfilePic(`${proxy}${userProfile?.avatar}`);
            return;
        }
        if (userProfile?.discord?.avatar) {
            setProfilePic(`${proxy}https://cdn.discordapp.com/avatars/${userProfile?.discord?.id}/${userProfile?.discord?.avatar}.png`);
            return;
        }
        setProfilePic(ProfileImage);
    };

    const fetchEth = async () => {
        const ethAddr = wallet !== mainWallet.publicKey?.toBase58() ? walletUser?.user?.ethAddress : auth.user?.ethAddress;
        console.log(ethAddr);
        if (ethAddr) {
            const web3 = new Web3('https://mainnet.infura.io/v3/c28fffee6c304d49b717b001d24e795d');
            const ethbal = await web3.eth.getBalance(ethAddr);
            setEthBalance(ethbal);
            const { data: ethNftData } = await getWalletNfts(ethAddr);
            const { result } = ethNftData;
            setEthNfts(
                map(result, ({ token_address, token_id, token_uri, symbol, name: collection, metadata, contract_type }: any) => {
                    // eslint-disable-next-line prefer-const
                    let { image, name } = JSON.parse(metadata) || {};
                    if (image && image.includes('ipfs://')) {
                        image = image.replace('ipfs://', 'https://ipfs.io/ipfs/');
                    }
                    if (image && image.includes('ipfs.infura.io')) {
                        image = image.replace('ipfs.infura.io', 'infura-ipfs.io');
                    }
                    return {
                        mint: token_id,
                        image,
                        name,
                        collection,
                        collectionKey: token_address,
                        contractType: contract_type,
                        symbol,
                        uri: token_uri
                    };
                })
            );
        }
    };

    useEffect(() => {
        if (auth.token && wallet) {
            getAvatar(wallet !== mainWallet.publicKey?.toBase58() ? walletUser?.user : auth.user);
            fetchNFTs();
            fetchBalance(new PublicKey(wallet), connection).then((bal: number) => setBalance(bal));
            fetchYakuBalance(new PublicKey(wallet), connection, mainWallet).then((yBal: number) => setTokenBalance(yBal));
            fetchIsFollowed();
            fetchFollowers();
        }
    }, [wallet, mainWallet.publicKey, auth.token]);
    useEffect(() => {
        fetchEth();
    }, [auth.user, walletUser?.user]);
    useEffect(() => {
        if (data?.getWalletStats) {
            setWalletStats(data?.getWalletStats?.wallet_stats[0]);
        }
    }, [data]);

    useEffect(() => {
        if (walletUser?.user) {
            if (
                !walletUser?.user?.avatar &&
                !walletUser?.user?.discord?.avatar &&
                walletAvatar?.getWalletAvatar &&
                walletAvatar?.getWalletAvatar.avatar
            ) {
                getToken({
                    variables: { mint: walletAvatar?.getWalletAvatar.avatar }
                }).then(({ data: tokenData }: any) => {
                    if (tokenData?.getTokenByMint?.image) {
                        setProfilePic(tokenData?.getTokenByMint?.image);
                    }
                    setDisplayName(tokenData?.getTokenByMint?.name);
                });
            } else if (walletUser?.user?.avatar || walletUser?.user?.discord?.avatar) {
                getAvatar(walletUser?.user);
            }
        } else if (wallet === mainWallet.publicKey?.toBase58()) {
            getAvatar(auth.user);
        }
    }, [walletUser, walletAvatar]);
    return (
        <>
            <ProfileBanner />

            <AvatarSection
                src={profilePic}
                vanity={walletUser?.user?.vanity || displayName || (wallet && shortenAddress(wallet))}
                sol_name={walletStats?.sol_name}
                discord={walletUser?.user?.discord}
                twitter={walletUser?.user?.twitter}
                stakedYakuNfts={nfts?.staked}
                wallet={wallet}
                mainWallet={mainWallet}
                handleFollow={handleFollow}
                isFollowed={followed && followed.isFollowed}
                followers={followers?.getUserFollowers?.length}
                followings={followings?.getUserFollowings?.length}
                handleChat={handleChat}
                handleShowSelectNft={handleShowSelectNft}
            />

            <Grid container spacing={2} sx={{ mt: { xs: 1, md: '-80px' } }}>
                <Grid item xs={12} lg={7} xl={6}>
                    <MainCard sx={{ border: 'none', mt: 2 }} divider={false}>
                        <Typography
                            fontSize={18}
                            fontWeight={700}
                            sx={{ justifyContent: 'flex-end', alignItems: 'center', display: 'flex', gap: 1 }}
                        >
                            <IconWallet /> Wallet Overview
                        </Typography>
                        <Grid container sx={{ mt: 2, justifyContent: 'space-between' }}>
                            <Grid
                                item
                                xs={12}
                                sx={{
                                    mb: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: theme.palette.mode === 'dark' ? '#09080d' : 'primary.light',
                                    borderRadius: '.75rem',
                                    p: 2
                                }}
                            >
                                <Typography>Wallet</Typography>
                                <Typography noWrap>{wallet && shortenAddress(wallet, 7)}</Typography>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                sm={5.75}
                                sx={{
                                    mb: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: theme.palette.mode === 'dark' ? '#09080d' : 'primary.light',
                                    borderRadius: '.75rem',
                                    p: 2
                                }}
                            >
                                <Typography>Balance</Typography>
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
                                    <Typography noWrap>{round(Number(balance || 0), 2).toLocaleString()}</Typography>
                                </Box>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                sm={5.75}
                                sx={{
                                    mb: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: theme.palette.mode === 'dark' ? '#09080d' : 'primary.light',
                                    borderRadius: '.75rem',
                                    p: 2
                                }}
                            >
                                <Typography>$YAKU Balance</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Avatar
                                        src={YAKU_TOKEN_ICON}
                                        sx={{
                                            width: 18,
                                            height: 18,
                                            objectFit: 'contain',
                                            border: 'none',
                                            background: 'transparent'
                                        }}
                                        color="inherit"
                                    />
                                    <Typography noWrap>{round(Number(tokenBalance || 0), 2).toLocaleString()}</Typography>
                                </Box>
                            </Grid>
                            <Tooltip title="NFT Portfolio Value is based on FP calculation.">
                                <Grid
                                    item
                                    xs={12}
                                    sm={5.75}
                                    sx={{
                                        mb: 2,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: theme.palette.mode === 'dark' ? '#09080d' : 'primary.light',
                                        borderRadius: '.75rem',
                                        p: 2
                                    }}
                                >
                                    <Typography>
                                        NFT Portfolio Value <InfoCircleOutlined />
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
                                        <Typography noWrap>{round(netWorth, 2).toLocaleString()}</Typography>
                                    </Box>
                                </Grid>
                            </Tooltip>
                            <Grid
                                item
                                xs={12}
                                sm={5.75}
                                sx={{
                                    mb: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: theme.palette.mode === 'dark' ? '#09080d' : 'primary.light',
                                    borderRadius: '.75rem',
                                    p: 2
                                }}
                            >
                                <Typography>Owned NFT</Typography>
                                <Typography noWrap>{Number(ownedNftCount).toLocaleString()}</Typography>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                sm={5.75}
                                sx={{
                                    mb: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: theme.palette.mode === 'dark' ? '#09080d' : 'primary.light',
                                    borderRadius: '.75rem',
                                    p: 2
                                }}
                            >
                                <Typography>Total Volume Bought</Typography>
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
                                        {!isEmpty(walletStats) ? (
                                            `${round(Number(walletStats?.volume_bought || 0), 2).toLocaleString()}`
                                        ) : (
                                            <Skeleton width={50} height={16} variant="rounded" />
                                        )}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                sm={5.75}
                                sx={{
                                    mb: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: theme.palette.mode === 'dark' ? '#09080d' : 'primary.light',
                                    borderRadius: '.75rem',
                                    p: 2
                                }}
                            >
                                <Typography>Total Volume Sold</Typography>
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
                                        {!isEmpty(walletStats) ? (
                                            `${round(Number(walletStats?.volume_sold || 0), 2).toLocaleString()}`
                                        ) : (
                                            <Skeleton width={50} height={16} variant="rounded" />
                                        )}
                                    </Typography>
                                </Box>
                            </Grid>
                            {(wallet !== mainWallet.publicKey?.toBase58() ? walletUser?.user?.ethAddress : auth?.user?.ethAddress) && (
                                <>
                                    <Grid
                                        item
                                        xs={12}
                                        sx={{
                                            mb: 2,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            backgroundColor: theme.palette.mode === 'dark' ? '#09080d' : 'primary.light',
                                            borderRadius: '.75rem',
                                            p: 2
                                        }}
                                    >
                                        <Typography>ETH Wallet</Typography>
                                        <Typography noWrap>
                                            {shortenAddress(
                                                wallet !== mainWallet.publicKey?.toBase58()
                                                    ? walletUser?.user?.ethAddress
                                                    : auth?.user?.ethAddress,
                                                7
                                            )}
                                        </Typography>
                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                        sx={{
                                            mb: 2,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            backgroundColor: theme.palette.mode === 'dark' ? '#09080d' : 'primary.light',
                                            borderRadius: '.75rem',
                                            p: 2
                                        }}
                                    >
                                        <Typography>Balance</Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Avatar
                                                src={EthLogo}
                                                sx={{
                                                    width: 18,
                                                    height: 18,
                                                    objectFit: 'contain',
                                                    border: 'none',
                                                    background: 'transparent'
                                                }}
                                                color="inherit"
                                            />
                                            <Typography noWrap>{round(Number(ethBalance || 0) / ETH_WEI, 4).toLocaleString()}</Typography>
                                        </Box>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </MainCard>
                    <Box>
                        <MainCard sx={{ border: 'none', mt: 2 }} divider={false}>
                            <PortfolioChart wallet={wallet || ''} />
                        </MainCard>
                    </Box>
                </Grid>
                <Grid item xs={12} lg={5} xl={6}>
                    <NFTCollectionsView
                        wallet={wallet || ''}
                        nfts={nfts}
                        ethNfts={ethNfts}
                        setOwnedNftCount={setOwnedNftCount}
                        setNetWorth={setNetWorth}
                        setOwnedCollections={setCollections}
                    />
                </Grid>
            </Grid>

            <NFTsDialog
                showItems={showSelectNft}
                setShowItems={setShowSelectNft}
                cItem={{
                    items:
                        collections && collections.length > 0
                            ? filter(flatten(map(collections, ({ items }) => items)), ({ listed }) => !listed)
                            : []
                }}
                canView={false}
                hideTitle
                noListing
                showSendAndBurnButton={false}
                cols={6}
            />
        </>
    );
};
export default Profile;
