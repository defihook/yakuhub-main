/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import {
    Avatar,
    Box,
    Grid,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListSubheader,
    Skeleton,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { queries } from '../../graphql/graphql';
import useAuth from 'hooks/useAuth';
import useAuthQuery from 'hooks/useAuthQuery';
import useConnections from 'hooks/useConnetions';
import { useEffect, useState } from 'react';
import ProfileImage from '../../assets/images/profile-image.jpeg';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import { filter, find, first, flatten, get, groupBy, isEmpty, join, map, round, sum, toLower, uniq } from 'lodash';
// eslint-disable-next-line
import ProfileBanner from './components/ProfileBanner';
import AvatarSection from './components/AvatarSection';
import { IMAGE_PROXY, YAKU_TOKEN_ICON } from 'config/config';
import { shortenAddress } from 'utils/utils';
import MainCard from 'components/MainCard';
import SolanaLogo from 'assets/images/icons/solana-logo.png';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useMeta } from 'contexts/meta/meta';
import { Promise } from 'bluebird';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useYakuUSDCPrice } from 'contexts/JupitarContext';
import { useSolPrice } from 'contexts/CoinGecko';
import TitlebarImageList from './components/TitlebarImageList';
import TokenChart from 'components/TokenChart';
import { useBundleView } from 'contexts/BundleWalletContext';
import useStaked from 'hooks/useStaked';
import { useNavigate } from 'react-router-dom';
import { IconSettings } from '@tabler/icons';
import NFTsDialog from './components/NFTsDialog';
import { Metaplex } from '@metaplex-foundation/js';

interface NFT {
    metadata: {
        update_authority: String;
        mint: String;
        name: String;
        symbol: String;
        uri: String;
        seller_fee_basis_points: Number;
        creators: any[];
        is_mutable: Boolean;
        primary_sale_happened: Boolean;
        token_standard: any;
        uses: any;
        collection: any;
        pubkey: String;
    };
}

export default function BundledView() {
    const { connection } = useConnections();
    const theme = useTheme();
    const navigate = useNavigate();
    const auth = useAuth();
    const wallet = useWallet();
    const yakuUSDCPrice = useYakuUSDCPrice();
    const solPrice = useSolPrice();
    const { setShowBundleView } = useBundleView();
    const { stakedYakuNfts, yakusFP, getStats, getStakedJSONs } = useStaked();

    const [nftList, setNftList] = useState<NFT[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [tokenList, setTokenList] = useState<any[]>([]);
    const [priceList, setPriceList] = useState<any[]>([]);
    const [balance, setBalance] = useState<any>(0);
    const [tokenBalance, setTokenBalance] = useState<any>(0);
    const [profilePic, setProfilePic] = useState<any>(ProfileImage);
    const [displayName, setDisplayName] = useState<any>('');
    const [ownedNftCount, setOwnedNftCount] = useState<number>(0);
    const [netWorth, setNetWorth] = useState<number>(0);
    const [nftPercent, setNftPercent] = useState<number>(0);
    const [tokenPercent, setTokenPercent] = useState<number>(0);
    const [showAllAddr, setShowAllAddr] = useState(false);
    const [showSelectNft, setShowSelectNft] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { fetchBalance, fetchYakuBalance } = useMeta();

    const { publicKey } = wallet;
    const { data: walletAvatar } = useAuthQuery(queries.GET_WALLET_AVATAR, {
        variables: {
            wallet: publicKey?.toBase58() || ''
        }
    });
    const { data: followed } = useAuthQuery(queries.IS_FOLLOWED, {
        skip: !auth?.user?.id,
        variables: {
            user: auth?.user?.id,
            wallet: publicKey?.toBase58() || ''
        }
    });
    const { data: followers } = useAuthQuery(queries.GET_USER_FOLLOWERS, {
        variables: {
            wallet: publicKey?.toBase58() || ''
        }
    });
    const { data: followings } = useAuthQuery(queries.GET_USER_FOLLOWINGS, {
        variables: {
            wallet: publicKey?.toBase58() || ''
        }
    });
    const [getNFTsByOwner] = useAuthLazyQuery(queries.GET_NFTS_BY_OWNER);
    const [getUserProfile] = useAuthLazyQuery(queries.GET_CORAL_USER_PROFILE);
    const [getToken] = useAuthLazyQuery(queries.GET_TOKEN_BY_MINT);

    const coinIdSymbols: Record<string, string> = {
        usdc: 'usd-coin',
        usdt: 'tether',
        dust: 'dust-protocol'
    };
    const [getAccountTokens] = useAuthLazyQuery(queries.GET_ACCOUNT_TOKENS);
    const [getSimplePrice] = useAuthLazyQuery(queries.GET_SIMPLE_PRICE);

    const getCoinPrice = (pricesList: any[], coinId: string) => {
        if (coinId === 'yaku') {
            return yakuUSDCPrice;
        }
        return get(pricesList, [coinId, 'usd'], 0);
    };

    const concatCollections = async (nfts: any[], myNFTs: any[]) => {
        const collectionsGroup = groupBy(flatten(nfts), 'collection_name');

        const stakedJSONList: any[] = await getStakedJSONs(stakedYakuNfts);
        const yakuJSONList = map(stakedJSONList, (item: any) =>
            !item.collection
                ? { ...item, collection: { name: item.name.split(' #')[0] }, project_id: 'yakux', staked: true }
                : { ...item, staked: true, project_id: item.collection.name === 'Capsule X' ? 'capsulex' : 'yakucorp1' }
        );
        const groupedYaku = groupBy(yakuJSONList, 'collection.name');

        let fps = yakusFP;
        if (!fps || isEmpty(fps)) {
            ({ yakusFP: fps } = await getStats());
        }

        const collectionsByYaku = map(Object.keys(groupedYaku), (key) => ({
            image: first(groupedYaku[key]).image,
            collection: key,
            count: groupedYaku[key].length,
            items: map(groupedYaku[key], (itm) => ({
                ...itm,
                floor_price: fps[itm.project_id] / LAMPORTS_PER_SOL,
                listed: false,
                staked: true,
                owner: wallet.publicKey?.toBase58(),
                collection_symbol: itm.project_id
            })),
            floor_price: fps[first(groupedYaku[key]).project_id] / LAMPORTS_PER_SOL
        }));
        const otherNFTsCollection = map(Object.keys(collectionsGroup), (collection) => ({
            collection,
            image: collectionsGroup[collection][0].original_image,
            video: collectionsGroup[collection][0].animation_url,
            count: collectionsGroup[collection].length,
            items: map(collectionsGroup[collection], (itm) => ({
                ...itm,
                floor_price: itm.floor_price / LAMPORTS_PER_SOL,
                price: itm.price ? itm.price / LAMPORTS_PER_SOL : undefined,
                listed: !!itm.price,
                owner: !!find(myNFTs, ({ mint }) => mint === itm.mint)
            })),
            floor_price: collectionsGroup[collection][0].floor_price / LAMPORTS_PER_SOL
        }));
        setCollections([...collectionsByYaku, ...otherNFTsCollection]);
        return [...collectionsByYaku, ...otherNFTsCollection];
    };

    const updateView = async () => {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        try {
            const wallets = uniq([publicKey?.toBase58(), ...(auth.user?.wallets || [])]);
            const bal = sum(await Promise.mapSeries(wallets, (pubKey) => fetchBalance(new PublicKey(pubKey), connection)));
            const ybal = sum(await Promise.mapSeries(wallets, (pubKey) => fetchYakuBalance(new PublicKey(pubKey), connection, wallet)));
            setBalance(bal);
            setTokenBalance(ybal);
            const metaplex = new Metaplex(connection);
            const ownerList = await metaplex.nfts().findAllByOwner({ owner: wallet.publicKey! }).run();
            const myNFTs = map(ownerList, ({ mintAddress, ...others }: any) => ({
                mint: new PublicKey(mintAddress).toBase58(),
                metadata: { mintAddress, ...others }
            }));
            const { data } = await getNFTsByOwner({
                variables: {
                    wallets
                },
                fetchPolicy: 'network-only'
            });
            setOwnedNftCount((data.getNFTsByOwner?.length ?? 0) + (stakedYakuNfts?.length ?? 0));
            setNftList(data.getNFTsByOwner);

            const nfts = await Promise.mapSeries(wallets, async (pubkey) => {
                const { data: profileData } = await getUserProfile({
                    variables: {
                        pubkey
                    }
                });
                return profileData.getUserProfile;
            });

            const collectionsList = await concatCollections(nfts, myNFTs);
            const tokensBundled: any = groupBy(
                flatten(
                    await Promise.mapSeries(wallets, async (account: string) => {
                        const { data: tokenData } = await getAccountTokens({
                            variables: {
                                account
                            },
                            fetchPolicy: 'network-only'
                        });
                        return tokenData?.getAccountTokens ?? [];
                    })
                ),
                'tokenSymbol'
            );

            let tokensSum = 0;
            if (tokensBundled) {
                const { data: priceData } = await getSimplePrice({
                    variables: {
                        params: {
                            ids: map(
                                Object.keys(tokensBundled),
                                (tokenSymbol) => coinIdSymbols[toLower(tokenSymbol)] || toLower(tokenSymbol)
                            ),
                            vs_currencies: ['usd']
                        }
                    }
                });
                const pricesList = priceData?.simplePrice?.data;
                const tokensList = filter(
                    map(Object.keys(tokensBundled), (tokenSymbol) => {
                        const arr = tokensBundled[tokenSymbol];
                        if (!arr || arr.length === 0) {
                            return undefined;
                        }
                        if (arr && arr.length === 1) {
                            return arr[0];
                        }
                        const result = {
                            ...arr[0]
                        };
                        result.tokenAmount.amount = `${sum(map(arr, ({ tokenAmount }) => +tokenAmount.amount))}`;
                        result.tokenAmount.uiAmount = sum(map(arr, ({ tokenAmount }) => tokenAmount.uiAmount));
                        result.tokenAmount.uiAmountString = `${result.tokenAmount.uiAmount}`;
                        return result;
                    }),
                    (v) => !!v
                );
                setTokenList(tokensList);
                setPriceList(pricesList);
                const prices = map(
                    tokensList,
                    ({ tokenAmount, tokenSymbol }) =>
                        Number(tokenAmount?.uiAmount) *
                        +getCoinPrice(pricesList, coinIdSymbols[toLower(tokenSymbol)] || toLower(tokenSymbol))
                );
                tokensSum = sum(prices);
            }
            const nftNetWorth =
                sum(
                    map(
                        filter(collectionsList, ({ floor_price }: any) => floor_price && floor_price >= 0),
                        ({ floor_price, count }: any) => floor_price * count
                    )
                ) * solPrice;
            const tokenNetWorth = bal * solPrice + tokensSum;
            setNetWorth(nftNetWorth + tokenNetWorth);
            setNftPercent((nftNetWorth / (nftNetWorth + tokenNetWorth)) * 100);
            setTokenPercent((tokenNetWorth / (nftNetWorth + tokenNetWorth)) * 100);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleShowSelectNft = () => {
        setShowSelectNft(true);
        console.log(flatten(map(collections, ({ items }) => items)));
    };

    useEffect(() => {
        if (walletAvatar?.getWalletAvatar && walletAvatar?.getWalletAvatar.avatar) {
            getToken({
                variables: { mint: walletAvatar?.getWalletAvatar.avatar }
            }).then(({ data: tokenData }: any) => {
                if (tokenData?.getTokenByMint?.image) {
                    setProfilePic(tokenData?.getTokenByMint?.image);
                }
                setDisplayName(tokenData?.getTokenByMint?.name);
            });
        }
    }, [walletAvatar]);
    useEffect(() => {
        if (auth.user && publicKey) {
            updateView();
        }
    }, [auth.user, publicKey]);

    useEffect(() => {
        setOwnedNftCount((nftList?.length ?? 0) + (stakedYakuNfts?.length ?? 0));
    }, [stakedYakuNfts]);

    const getAvatar = (proxy = IMAGE_PROXY) => {
        if (auth.user?.avatar) {
            return `${proxy}${auth.user?.avatar}`;
        }
        if (auth.user?.discord?.avatar) {
            return `${proxy}https://cdn.discordapp.com/avatars/${auth.user?.discord?.id}/${auth.user?.discord?.avatar}.png`;
        }
        return profilePic;
    };
    return (
        <>
            <ProfileBanner />

            <AvatarSection
                src={getAvatar()}
                vanity={auth.user?.vanity || displayName || (publicKey && `Bundle ${shortenAddress(publicKey.toBase58())}`)}
                discord={auth.user?.discord}
                twitter={auth.user?.twitter}
                wallet={wallet?.publicKey?.toBase58()}
                mainWallet={wallet}
                stakedYakuNfts={stakedYakuNfts}
                isFollowed={followed && followed.isFollowed}
                followers={followers?.getUserFollowers?.length}
                followings={followings?.getUserFollowings?.length}
                handleFollow={() => {}}
                handleShowSelectNft={handleShowSelectNft}
            />

            <Grid container spacing={2} sx={{ mt: { xs: 1, md: '-80px' }, pb: { xs: 1 } }}>
                <Grid item xs={12} lg={7} xl={6}>
                    <MainCard sx={{ border: 'none', mt: 2 }} divider={false}>
                        <Typography
                            fontSize={18}
                            fontWeight={700}
                            sx={{ justifyContent: 'flex-end', alignItems: 'center', display: 'flex', gap: 1 }}
                        >
                            Bundle Overview{' '}
                            <IconButton onClick={() => setShowBundleView(true)}>
                                <IconSettings />
                            </IconButton>
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
                                <Typography>Addresses</Typography>
                                <Typography noWrap sx={{ display: 'flex', gap: 1, cursor: 'pointer' }}>
                                    <Typography onClick={() => navigate(`/account/${wallet.publicKey?.toBase58()}`)}>
                                        {wallet.publicKey?.toBase58() && shortenAddress(wallet.publicKey?.toBase58(), 4)}
                                    </Typography>
                                    {auth.user?.wallets?.length > 0 && !showAllAddr && (
                                        <Tooltip
                                            arrow
                                            title={join(auth.user?.wallets, ', ')}
                                            sx={{
                                                popper: {
                                                    fontSize: 10
                                                }
                                            }}
                                        >
                                            <Typography noWrap onClick={() => setShowAllAddr(true)}>
                                                (+ ${auth.user?.wallets?.length} addresses)
                                            </Typography>
                                        </Tooltip>
                                    )}
                                    {auth.user?.wallets?.length > 0 &&
                                        showAllAddr &&
                                        map(auth.user?.wallets, (w) => (
                                            <Typography key={w} noWrap onClick={() => navigate(`/account/${w}`)}>
                                                , {shortenAddress(w, 4)}
                                            </Typography>
                                        ))}
                                </Typography>
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
                                        Net Worth <InfoCircleOutlined />
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography noWrap>US$ {round(netWorth, 2).toLocaleString()}</Typography>
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
                        </Grid>
                    </MainCard>

                    <MainCard border={false} sx={{ mt: 2 }}>
                        <List>
                            <ListSubheader component="div" sx={{ borderRadius: '.75rem', px: 3, fontSize: 16, fontWeight: 700 }}>
                                {tokenList?.length} Tokens
                            </ListSubheader>
                            <ListItem
                                sx={{
                                    gap: 1,
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Box sx={{ width: 40 }} />
                                <Typography component="p" sx={{ width: '18%' }} fontWeight={700} noWrap>
                                    Name
                                </Typography>
                                <Typography component="p" sx={{ width: '40%', textAlign: 'end' }} fontWeight={700} noWrap />
                                <Typography component="p" sx={{ width: '18%', textAlign: 'end' }} fontWeight={700} noWrap>
                                    Amount
                                </Typography>
                                <Typography component="p" sx={{ width: '18%', textAlign: 'end' }} fontWeight={700} noWrap>
                                    Est. Value (USD)
                                </Typography>
                            </ListItem>
                            {!isLoading
                                ? map(tokenList, ({ tokenIcon, tokenName, tokenAmount, tokenSymbol }) => (
                                      <ListItem
                                          sx={{
                                              gap: 1,
                                              justifyContent: 'space-between',
                                              '&:hover': {
                                                  backgroundColor: '#d329ff15'
                                              }
                                              //   cursor: 'pointer'
                                          }}
                                          //   onClick={() =>
                                          //       navigate(`/explore/token/${coinIdSymbols[toLower(tokenSymbol)] || toLower(tokenSymbol)}`, {
                                          //           replace: true
                                          //       })
                                          //   }
                                      >
                                          <Avatar src={`${IMAGE_PROXY}${tokenIcon}`} />
                                          <Typography component="p" sx={{ width: '18%' }} noWrap>
                                              {tokenName}
                                          </Typography>
                                          <Box sx={{ width: '40%' }}>
                                              <TokenChart coinId={coinIdSymbols[toLower(tokenSymbol)] || toLower(tokenSymbol)} />
                                          </Box>
                                          <Typography component="p" sx={{ width: '18%', textAlign: 'end' }} noWrap>
                                              {round(Number(tokenAmount?.uiAmount), 4).toLocaleString()}
                                          </Typography>
                                          <Typography component="p" sx={{ width: '18%', textAlign: 'end' }} noWrap>
                                              $
                                              {round(
                                                  Number(tokenAmount?.uiAmount) *
                                                      +getCoinPrice(priceList, coinIdSymbols[toLower(tokenSymbol)] || toLower(tokenSymbol)),
                                                  4
                                              ).toLocaleString()}
                                          </Typography>
                                      </ListItem>
                                  ))
                                : map([1, 2, 3, 4, 5, 6, 7, 8], (idx) => (
                                      <ListItem
                                          sx={{
                                              gap: 1,
                                              justifyContent: 'space-between',
                                              '&:hover': {
                                                  backgroundColor: '#d329ff15'
                                              }
                                          }}
                                      >
                                          <Skeleton variant="circular" width={24} height={24} />
                                          <Skeleton variant="rounded" sx={{ width: '18%' }} />
                                          <Skeleton variant="rounded" sx={{ width: '40%' }} />
                                          <Skeleton variant="rounded" sx={{ width: '18%' }} />
                                          <Skeleton variant="rounded" sx={{ width: '18%' }} />
                                      </ListItem>
                                  ))}
                        </List>
                    </MainCard>
                </Grid>
                <Grid item xs={12} lg={5} xl={6}>
                    <MainCard sx={{ border: 'none', mt: 2, mb: 2 }} divider={false}>
                        <Typography
                            fontSize={16}
                            fontWeight={700}
                            sx={{ justifyContent: 'flex-start', alignItems: 'center', display: 'flex', gap: 1 }}
                        >
                            Portfolio Breakdown
                        </Typography>
                        <List>
                            <ListItem sx={{ display: 'flex', gap: 1 }}>
                                <Typography sx={{ flex: '1 0 50px' }}>NFTs</Typography>
                                <LinearProgress
                                    color="secondary"
                                    value={nftPercent}
                                    sx={{ width: '100%', borderRadius: '0.75rem', height: 18 }}
                                    variant="determinate"
                                />
                                <Typography sx={{ flex: '1 0 60px', textAlign: 'right' }}>{round(nftPercent, 2).toFixed(2)}%</Typography>
                            </ListItem>
                            <ListItem sx={{ display: 'flex', gap: 1 }}>
                                <Typography sx={{ flex: '1 0 50px' }}>Coins</Typography>
                                <LinearProgress
                                    color="warning"
                                    value={tokenPercent}
                                    sx={{ width: '100%', borderRadius: '0.75rem', height: 18 }}
                                    variant="determinate"
                                />
                                <Typography sx={{ flex: '1 0 60px', textAlign: 'right' }}>{round(tokenPercent, 2).toFixed(2)}%</Typography>
                            </ListItem>
                        </List>
                    </MainCard>
                    <Box>
                        {!isLoading || (collections && collections.length > 0) ? (
                            <TitlebarImageList
                                items={map(
                                    collections,
                                    ({ collection, count, items, image, collection_symbol, video, floor_price, staked }: any) => ({
                                        title: collection,
                                        img: image,
                                        video,
                                        count,
                                        items,
                                        floor_price,
                                        staked,
                                        owner: wallet.publicKey?.toBase58(),
                                        collection_symbol
                                    })
                                )}
                                title="Collections"
                                updateView={updateView}
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
                    </Box>
                </Grid>
            </Grid>

            <NFTsDialog
                showItems={showSelectNft}
                setShowItems={setShowSelectNft}
                cItem={{
                    items: filter(flatten(map(collections, ({ items }) => items)), ({ listed }) => !listed)
                }}
                isLoading={isLoading}
                canView={false}
                hideTitle
                noListing
                showSendAndBurnButton={false}
                updateView={updateView}
                cols={6}
            />
        </>
    );
}
