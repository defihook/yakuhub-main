import { useState, useEffect, Key, ReactChild, ReactFragment, ReactPortal } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
import { Box, Grid, Stack, Divider, Button, Typography, Tooltip, CardMedia, CardContent, CardActions } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// web3
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

// project imports
import { getStateByKey, buyTicket, claimReward, revealWinner, withdrawNft, closeRaffle } from 'actions/raffle';
import { useMeta } from 'contexts/meta/meta';
import MainCard from 'components/MainCard';

// third-party
import moment from 'moment';

// assets
import { CheckCircleOutlined } from '@ant-design/icons';
import SolscanLogo from 'assets/images/icons/solscan.png';
import ExplorerLogo from 'assets/images/icons/explorer.png';
import Image from 'mui-image';
import Loading from 'components/Loading';
import { IMAGE_PROXY, MAX_BUYING_TICKET, RAFFLE_REWARD_TYPES } from 'config/config';
import { TabContext, TabPanel } from '@mui/lab';

import { find, get, groupBy, map, min } from 'lodash';
import { NumberInput } from 'components/NumberInput';
import { FormattedMessage } from 'react-intl';
import Countdown from 'components/Countdown';
import { TermsAndConditionsForBuy } from './TermsAndConditionsForBuy';
import WalletConnectButton from 'components/@extended/WalletConnectButton';
import { MenuButton } from 'components/MenuButton';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { adminValidation } from 'actions/shared';
import { useToasts } from 'hooks/useToasts';
import useConnections from 'hooks/useConnetions';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import { queries } from '../../../graphql/graphql';
import { getRaffleData } from './fetchData';
import axios from 'axios';
import { shortenAddress } from 'utils/utils';

const RafflePage = () => {
    const { connection } = useConnections();
    const theme = useTheme();
    const wallet = useWallet();
    const navigate = useNavigate();
    const { raffleKey } = useParams();
    const { startLoading, stopLoading } = useMeta();

    const [tab, setTab] = useState('details');

    const [mint, setMint] = useState('');
    const [image, setImage] = useState('');
    const [name, setName] = useState('');
    const [family, setFamily] = useState('Not Specified');
    const [description, setDescription] = useState('');
    const [attributes, setAttributes] = useState<any>([]);
    const [myTickets, setMyTickets] = useState<any>([]);
    const [isAdmin, setIsAdmin] = useState(false);

    const [price, setPrice] = useState(0);
    const [payType, setPayType] = useState('SOL');
    const [endsAt, setEndsAt] = useState(0);
    const [count, setCount] = useState(0);
    const [maxEntrants, setMaxEntrants] = useState(0);

    const [tickets, setTickets] = useState(1);
    const [ticketsTotal, setTicketsTotal] = useState(price);

    const [isRevealed, setIsRevealed] = useState(false);
    const [isWinner, setIsWinner] = useState(false);
    const [winners, setWinners] = useState<Array<any>>([]);
    const [winnerCount, setWinnerCount] = useState<number>(0);
    const [isClaimed, setIsClaimed] = useState(false);
    const [participants, setParticipants] = useState<any>({});
    const [users, setUsers] = useState<any[]>([]);
    const [transactions, setTransactions] = useState([]);
    const [creator, setCreator] = useState('');
    const [whitelisted, setWhitelisted] = useState(0);
    const [allClaimed, setAllClaimed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [canClose, setCanClose] = useState(true);
    const { showInfoToast, showErrorToast } = useToasts();
    const [fetchMetadatas] = useAuthLazyQuery(queries.GET_NFTS_BY_MINT, {
        fetchPolicy: 'cache-and-network'
    });
    const [getUsers] = useAuthLazyQuery(queries.USERS, {
        fetchPolicy: 'cache-and-network'
    });

    const getRaffleByService = async () => {
        try {
            startLoading();
            setLoading(true);
            const { data: res } = await axios.post('https://nft.yaku.ai/api/raffle', {
                wallet: wallet.publicKey?.toBase58(),
                raffleKeys: [raffleKey]
            });

            if (res !== undefined && res !== null && res?.length !== 0) {
                setMint(res[0].raffleData?.nftMint);
                const { data: nftData } = await fetchMetadatas({
                    variables: {
                        mint: [res[0]?.raffleData?.nftMint]
                    }
                });
                const { raffleData } = res[0];
                if (raffleData !== null && nftData?.fetch?.length > 0) {
                    const nftMint = raffleData.nftMint;

                    const nftItem = nftData?.fetch[0];
                    let { metadata } = nftItem;
                    if (!get(metadata, 'json.image', '')) {
                        const { data: itemData } = await fetchMetadatas({
                            variables: {
                                mint: nftMint
                            }
                        });
                        ({ metadata } = itemData.fetch[0]);
                    }
                    const item = { ...metadata, ...(metadata.json || {}), mint: nftMint, raffleKey, raffleData };

                    setImage(item.image);
                    setName(item.name);
                    setFamily(item.family);
                    setDescription(item.description);
                    setAttributes(item.attributes);
                    setData(raffleData);
                    setCanClose(false);
                }
            }
        } catch (error) {
            console.log(error);
            showErrorToast('Fail to get raffle details, please try again.');
        } finally {
            stopLoading();
            setLoading(false);
        }
    };

    const getRaffle = async () => {
        if (raffleKey === undefined) return;
        try {
            const raffle: any = await getStateByKey(connection, new PublicKey(raffleKey));
            const nftMint = raffle.nftMint.toBase58();
            if (raffle !== null) {
                setMint(nftMint);
                getData(nftMint);
            }
        } catch (error) {
            console.log(error);
            await getRaffleByService();
        }
    };

    const setData = (raffleData: any) => {
        console.log('SEETDATA');
        const {
            tickets: currentTickets,
            end,
            wl,
            price: ticketPrice,
            payType: ticketPayType,
            myTickets: mine,
            maxTickets,
            winnerCnt,
            isRevealed: revealed,
            winners: raffleWinners,
            isClaimed: claimed,
            isWinner: isWon,
            allClaimed: isAllClaimed,
            participants: entrants,
            creator: raffleCreator
        } = raffleData;
        console.log(raffleData);
        setCount(currentTickets);
        setMaxEntrants(maxTickets);
        setEndsAt(end);

        setPrice(ticketPrice);
        setPayType(ticketPayType);
        setMyTickets(mine);

        setIsRevealed(revealed);
        setIsWinner(isWon);
        setIsClaimed(claimed);
        setParticipants(groupBy(entrants, 'address'));
        setWinners(raffleWinners);
        setWinnerCount(winnerCnt);
        setCreator(raffleCreator);
        setWhitelisted(wl);
        setAllClaimed(isAllClaimed);
    };

    const getData = async (nftMint: string) => {
        try {
            startLoading();
            setLoading(true);
            let item;
            const raffleData = await getRaffleData({ connection, wallet, raffleKey });
            if (!image) {
                const { data: nftData } = await fetchMetadatas({
                    variables: {
                        mint: nftMint
                    }
                });
                const { metadata } = nftData?.fetch[0];
                item = { ...metadata, ...(metadata.json || {}), mint: nftMint, raffleData };

                setImage(item.image);
                setName(item.name);
                setFamily(item.family);
                setDescription(item.description);
                setAttributes(item.attributes);
            }

            if (!raffleData) {
                return;
            }
            const { participants: entrants = [] } = raffleData;
            const { data } = await getUsers({
                variables: {
                    wallets: map(Object.keys(groupBy(entrants, 'address')), (address) => address)
                }
            });
            setUsers(data.users);
            // Assigning Variables
            setData(raffleData);
        } catch (error) {
            console.error(error);
            showErrorToast('Fail to get raffle data, please try again.');
        } finally {
            stopLoading();
            setLoading(false);
        }
    };

    const trimAddress = (address: string = '', len = 4) => `${address.slice(0, len)}...${address.slice(address.length - len)}`;

    const handleClose = async () => {
        if (!raffleKey) {
            return;
        }
        try {
            startLoading();
            await closeRaffle(connection, wallet, new PublicKey(raffleKey));
            navigate('/applications/raffles/create');
        } catch (error) {
            showInfoToast('Transaction may delay due to Solana congestion. Please wait for a moment.');
            console.error(error);
        } finally {
            stopLoading();
        }
    };

    const handleReClaim = async () => {
        if (mint === '') {
            return;
        }
        try {
            startLoading();
            await withdrawNft(connection, wallet, new PublicKey(mint));
            navigate('/applications/raffles/create');
        } catch (error) {
            showInfoToast('Transaction may delay due to Solana congestion. Please wait for a moment.');
            console.error(error);
        } finally {
            stopLoading();
        }
    };

    const handlePurchase = async () => {
        if (mint === '') {
            return;
        }
        try {
            startLoading();
            await buyTicket(connection, wallet, new PublicKey(mint), tickets);
        } catch (error) {
            showInfoToast('Transaction may delay due to Solana congestion. Please wait for a moment.');
            console.error(error);
        } finally {
            await getData(mint);
            stopLoading();
        }
    };

    const handleRevealWinner = async () => {
        if (!raffleKey) {
            return;
        }
        try {
            startLoading();
            await revealWinner(connection, wallet, new PublicKey(raffleKey));
        } catch (error) {
            showInfoToast('Transaction may delay due to Solana congestion. Please wait for a moment.');
            console.error(error);
        } finally {
            await getData(mint);
            stopLoading();
        }
    };

    const handleClaim = async () => {
        if (mint === '') {
            return;
        }
        try {
            startLoading();
            await claimReward(connection, wallet, new PublicKey(mint));
        } catch (error) {
            showInfoToast('Transaction may delay due to Solana congestion. Please wait for a moment.');
            console.error(error);
        } finally {
            await getData(mint);
            stopLoading();
        }
    };

    const getParticipateSocial = (address: string) => {
        const found = find(users, ({ wallet: w }: any) => w === address);
        if (found) {
            const twitterName = get(found, 'twitter.username');
            const { name: discordName = '', discriminator = '' } = get(found, 'discord') || {};
            if (twitterName) {
                return `@${twitterName}`;
            }
            if (discordName && discriminator) {
                return `${discordName}#${discriminator}`;
            }
        }
        return shortenAddress(address, 10);
    };

    useEffect(() => {
        const admin = adminValidation(wallet.publicKey);
        setIsAdmin(admin);
        if (raffleKey !== undefined) getRaffle();
    }, [wallet.connected]);

    // Helper Functions
    const handleExplore = (site: string) => {
        switch (site) {
            case 'solscan':
                window.open(`https://solscan.io/token/${mint}`, '_blank');
                break;
            case 'explorer':
                window.open(`https://explorer.solana.com/address/${mint}`, '_blank');
                break;
            default:
                window.open(`https://solscan.io/token/${mint}`, '_blank');
                break;
        }
    };

    return (
        <Grid container spacing={3}>
            {!loading && (
                <>
                    <Grid item xs={12} md={6} lg={5} xl={4}>
                        <MainCard
                            content={false}
                            boxShadow
                            sx={{
                                background: theme.palette.mode === 'dark' ? '#09080d' : theme.palette.primary.light,
                                borderRadius: '16px'
                            }}
                        >
                            <CardMedia>
                                <Image src={`${IMAGE_PROXY}${image}`} showLoading={<Loading />} alt="" style={{ aspectRatio: '1 / 1' }} />
                            </CardMedia>
                            <CardContent sx={{ p: 1 }}>
                                <Box sx={{ display: 'flex', py: 1 }}>
                                    <Typography component="p" color="primary">
                                        {description}
                                    </Typography>
                                </Box>

                                <Grid container spacing={1} sx={{ mb: 2 }}>
                                    {attributes.map(
                                        (
                                            attribute: {
                                                trait_type: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined;
                                                value: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined;
                                            },
                                            index: Key | null | undefined
                                        ) => (
                                            <Grid item xs={12} md={6} lg={4} xl={3} key={index}>
                                                <MainCard
                                                    content={false}
                                                    boxShadow
                                                    sx={{
                                                        background: theme.palette.mode === 'dark' ? '#1c1929' : theme.palette.primary.light,
                                                        borderRadius: '16px',
                                                        p: 2
                                                    }}
                                                >
                                                    <Typography component="p" sx={{ color: '#b4abba', pb: 1 }} noWrap>
                                                        {attribute.trait_type}
                                                    </Typography>
                                                    <Typography component="p" sx={{ color: 'white' }} noWrap>
                                                        {attribute.value}
                                                    </Typography>
                                                </MainCard>
                                            </Grid>
                                        )
                                    )}
                                </Grid>

                                {moment() <= moment(endsAt) && maxEntrants - count > 0 ? (
                                    <Box display="flex" justifyContent="space-between">
                                        <Grid container columnSpacing={2} sx={{ alignItems: 'center' }}>
                                            <Grid item xs={6}>
                                                <FormattedMessage id="tickets-to-buy-placeholder">
                                                    {(msg) => (
                                                        <NumberInput
                                                            fullWidth
                                                            className="number-control"
                                                            name="tickets-to-buy"
                                                            value={tickets}
                                                            min={1}
                                                            max={min([maxEntrants - count, MAX_BUYING_TICKET * maxEntrants])}
                                                            step={1}
                                                            precision={0}
                                                            onChange={(value?: number) => {
                                                                if (!value) return;
                                                                if (value < maxEntrants - count) {
                                                                    setTickets(value);
                                                                    setTicketsTotal(value * price);
                                                                } else {
                                                                    setTicketsTotal(tickets * price);
                                                                }
                                                            }}
                                                            placeholder={`${msg}`}
                                                        />
                                                    )}
                                                </FormattedMessage>
                                            </Grid>

                                            <Grid item xs={6}>
                                                <Button
                                                    variant="contained"
                                                    color="secondary"
                                                    sx={{ borderRadius: 3 }}
                                                    fullWidth
                                                    onClick={() => handlePurchase()}
                                                >
                                                    <FormattedMessage id="purchase-ticket" />
                                                </Button>
                                            </Grid>
                                            <Grid
                                                item
                                                xs={12}
                                                sx={{ display: 'flex', justifyContent: 'flex-end', mr: 1, alignItems: 'flex-end' }}
                                            >
                                                <FormattedMessage id="total" />
                                                <Typography
                                                    fontWeight="700"
                                                    noWrap
                                                    color="inherit"
                                                    sx={{ fontSize: '1.25rem', pt: '4px', ml: 1, lineHeight: 1 }}
                                                >
                                                    {ticketsTotal.toFixed(2)} {payType}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ) : (
                                    <>
                                        {isRevealed && winnerCount > 0 ? (
                                            <Box
                                                sx={{
                                                    borderWidth: '4px',
                                                    borderStyle: 'solid',
                                                    borderColor: 'rgba(245,158,11,1)',
                                                    py: 3,
                                                    borderRadius: '16px',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <Typography component="div" fontWeight={700} sx={{ mb: 1, color: 'rgba(245,158,11,1)' }}>
                                                    <FormattedMessage id={winnerCount === 1 ? 'raffle-winner' : 'raffle-winners'} />
                                                </Typography>
                                                {map(winners, (winner) => (
                                                    <>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                my: 2
                                                            }}
                                                        >
                                                            <EmojiEventsIcon
                                                                sx={{
                                                                    color: 'rgba(245,158,11,1)',
                                                                    marginRight: '0.75rem'
                                                                }}
                                                            />{' '}
                                                            <Typography
                                                                component="div"
                                                                sx={{
                                                                    fontSize: '1.5rem',
                                                                    fontWeight: 700,
                                                                    color: 'inherit',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(winner?.address);
                                                                    showInfoToast(
                                                                        `Copied winner address: ${winner?.address} to clipboard.`
                                                                    );
                                                                }}
                                                            >
                                                                {trimAddress(winner?.address ?? '')}
                                                            </Typography>
                                                        </Box>
                                                        <Typography
                                                            component="strong"
                                                            fontWeight={500}
                                                            sx={{ color: 'rgba(245,158,11,1)' }}
                                                        >
                                                            <FormattedMessage id="won-with" />
                                                            {participants[winners[0]?.address ?? '']?.length ?? 0}{' '}
                                                            <FormattedMessage id="ticket-s" />
                                                        </Typography>
                                                    </>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Typography
                                                fontWeight="700"
                                                color="success.dark"
                                                sx={{ fontSize: '1.25rem', pt: '4px', textAlign: 'center' }}
                                            >
                                                <FormattedMessage id="sold-out" />
                                            </Typography>
                                        )}
                                    </>
                                )}
                                {isAdmin && (
                                    <Box display="flex" justifyContent="space-between" sx={{ my: 2 }}>
                                        {/* Admin can only reclaim the NFT if no one buy and is not revealed and has ended */}
                                        {new Date(endsAt || 0) < new Date() && whitelisted !== 3 && count === 0 && !isRevealed && (
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                color="error"
                                                sx={{ borderRadius: 2, mx: 2 }}
                                                onClick={() => handleReClaim()}
                                            >
                                                <FormattedMessage id="reclaim" />
                                            </Button>
                                        )}
                                        {/* Only can close a raffle after all winners claimed */}
                                        {allClaimed && canClose && (
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                color="primary"
                                                sx={{ borderRadius: 2, mx: 2 }}
                                                onClick={() => handleClose()}
                                            >
                                                <FormattedMessage id="close" />
                                            </Button>
                                        )}
                                        {/* Only admin can reveal and the raffle has ended */}
                                        {!isRevealed && count > 0 && new Date(endsAt || 0) < new Date() && (
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                color="success"
                                                sx={{ borderRadius: 2, mx: 2 }}
                                                onClick={() => handleRevealWinner()}
                                            >
                                                <FormattedMessage id="reveal" />
                                            </Button>
                                        )}
                                    </Box>
                                )}
                                {/* Only revealed and connected wallet is in the winner list and is not claimed which the raffle type is NFT */}
                                {isRevealed && isWinner && whitelisted === RAFFLE_REWARD_TYPES.nft && !isClaimed && (
                                    <Box display="flex" justifyContent="space-between">
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            color="success"
                                            sx={{ borderRadius: 2 }}
                                            onClick={() => handleClaim()}
                                        >
                                            <FormattedMessage id="claim" />
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                            {!wallet.connected && (
                                <CardActions>
                                    <WalletConnectButton />
                                </CardActions>
                            )}
                        </MainCard>
                    </Grid>

                    <Grid item xs={12} md={6} lg={7} xl={8}>
                        <MainCard border={false} boxShadow sx={{ borderRadius: 3 }}>
                            {/* collection information */}
                            <Box display="flex" justifyContent="space-between">
                                <Stack>
                                    <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '.875rem' }}>
                                        {family} <CheckCircleOutlined />
                                    </Typography>
                                    <Typography
                                        fontWeight="700"
                                        color="inherit"
                                        sx={{ fontSize: '2.25rem', pb: '4px', display: 'flex', alignItems: 'center' }}
                                    >
                                        {name}
                                        <Tooltip
                                            title="View on Solscan"
                                            placement="top"
                                            onClick={() => handleExplore('solscan')}
                                            sx={{ cursor: 'pointer' }}
                                            arrow
                                        >
                                            <img src={SolscanLogo} alt="" width={24} height={24} style={{ marginLeft: 12 }} />
                                        </Tooltip>
                                        <Tooltip
                                            title="View on Explorer"
                                            placement="top"
                                            onClick={() => handleExplore('explorer')}
                                            sx={{ cursor: 'pointer' }}
                                            arrow
                                        >
                                            <img src={ExplorerLogo} alt="" width={24} height={24} style={{ marginLeft: 6 }} />
                                        </Tooltip>
                                    </Typography>
                                </Stack>
                                <Stack>
                                    <Typography
                                        fontWeight="700"
                                        color="secondary.dark"
                                        onClick={() => navigate('/applications/raffles')}
                                        sx={{
                                            fontSize: '.875rem',
                                            pb: '4px',
                                            '&:hover': {
                                                cursor: 'pointer',
                                                color: '#ef4444',
                                                transition: 'all .1s ease-in-out'
                                            }
                                        }}
                                    >
                                        <FormattedMessage id="back" />
                                    </Typography>
                                </Stack>
                            </Box>

                            <Stack flexDirection="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Box>
                                    <Button
                                        variant={tab === 'details' ? 'contained' : 'text'}
                                        color={tab === 'details' ? 'secondary' : 'primary'}
                                        size="large"
                                        sx={{ borderRadius: 2 }}
                                        onClick={() => setTab('details')}
                                    >
                                        <FormattedMessage id="details" />
                                    </Button>
                                    <Button
                                        variant={tab === 'participants' ? 'contained' : 'text'}
                                        color={tab === 'participants' ? 'secondary' : 'primary'}
                                        size="large"
                                        sx={{ borderRadius: 2 }}
                                        onClick={() => setTab('participants')}
                                    >
                                        <FormattedMessage id="participants" />
                                    </Button>
                                    {/* <Button
                                        variant={tab === 'transactions' ? 'contained' : 'text'}
                                        color={tab === 'transactions' ? 'secondary' : 'primary'}
                                        size="large"
                                        sx={{ borderRadius: 2 }}
                                        onClick={() => setTab('transactions')}
                                    >
                                        <FormattedMessage id="transactions" />
                                    </Button> */}
                                </Box>
                                {/* <Box>
                            <Button variant="text" color="secondary" sx={{ borderRadius: 2 }}>
                                <FormattedMessage id="report" />
                            </Button>
                        </Box> */}
                            </Stack>

                            <Divider />

                            {/* tabs */}
                            <TabContext value={tab}>
                                <TabPanel value="details" sx={{ py: 2, px: 0 }}>
                                    <Box display="flex" flexDirection="column" sx={{ py: 1 }}>
                                        {/* raffle end countdown */}
                                        <Grid container>
                                            {moment() > moment(endsAt) ? (
                                                <Grid item xs={12} md={6}>
                                                    <Stack>
                                                        <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '.875rem' }}>
                                                            <FormattedMessage id="raffle-ended-on" />
                                                        </Typography>
                                                        <Typography
                                                            fontWeight="700"
                                                            color="inherit"
                                                            sx={{ fontSize: '1.25rem', pb: '4px' }}
                                                        >
                                                            {moment(endsAt).format('MMMM DD, yyyy')}
                                                        </Typography>
                                                    </Stack>
                                                </Grid>
                                            ) : (
                                                <Grid item xs={12} md={6}>
                                                    <Stack>
                                                        <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '.875rem' }}>
                                                            <FormattedMessage id="raffle-ends-in" />
                                                        </Typography>
                                                        <Typography
                                                            fontWeight="700"
                                                            color="inherit"
                                                            sx={{ fontSize: '1.25rem', pb: '4px' }}
                                                        >
                                                            <Countdown
                                                                endDateTime={new Date(endsAt)}
                                                                renderer={({ days, hours, minutes, seconds, completed }: any) => {
                                                                    if (completed) {
                                                                        // Render a completed state
                                                                        return <FormattedMessage id="closed" />;
                                                                    }
                                                                    // Render a countdown
                                                                    return (
                                                                        <span>
                                                                            {days} <FormattedMessage id="days" /> {hours}{' '}
                                                                            <FormattedMessage id="hrs" /> {minutes}{' '}
                                                                            <FormattedMessage id="mins" /> {seconds}{' '}
                                                                            <FormattedMessage id="secs" />
                                                                        </span>
                                                                    );
                                                                }}
                                                            />
                                                        </Typography>
                                                    </Stack>
                                                </Grid>
                                            )}
                                            <Grid item xs={12} md={6}>
                                                <Stack>
                                                    <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '.875rem' }}>
                                                        <FormattedMessage id="ticket-cost" />
                                                    </Typography>
                                                    <Typography fontWeight="700" color="inherit" sx={{ fontSize: '1.25rem', pb: '4px' }}>
                                                        {price} {payType}
                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                        </Grid>

                                        <Grid container sx={{ mt: 3 }}>
                                            {/* start date */}
                                            {/* <Grid item xs={12} md={6}>
                                        <Stack>
                                            <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '.875rem' }}>
                                                Raffle Creation Date:
                                            </Typography>
                                            <Typography fontWeight="700" color="inherit" sx={{ fontSize: '1.25rem', pb: '4px' }}>
                                                test
                                            </Typography>
                                        </Stack>
                                    </Grid> */}

                                            <Grid item xs={12} md={6}>
                                                {/* ticket remaining */}
                                                <Stack>
                                                    {moment() > moment(endsAt) ? (
                                                        <>
                                                            <Typography
                                                                fontWeight="700"
                                                                color="secondary.dark"
                                                                sx={{ fontSize: '.875rem' }}
                                                            >
                                                                <FormattedMessage id="tickets-sold" />
                                                            </Typography>
                                                            <Typography
                                                                fontWeight="700"
                                                                color={maxEntrants - count < maxEntrants * 0.2 ? 'error.dark' : 'inherit'}
                                                                sx={{ fontSize: '1.25rem', pb: '4px' }}
                                                            >
                                                                {count} / {maxEntrants}
                                                            </Typography>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Typography
                                                                fontWeight="700"
                                                                color="secondary.dark"
                                                                sx={{ fontSize: '.875rem' }}
                                                            >
                                                                <FormattedMessage id="tickets-remaining" />
                                                            </Typography>
                                                            <Typography
                                                                fontWeight="700"
                                                                color="inherit"
                                                                sx={{ fontSize: '1.25rem', pb: '4px' }}
                                                            >
                                                                {maxEntrants - count} / {maxEntrants}
                                                            </Typography>
                                                        </>
                                                    )}
                                                </Stack>
                                            </Grid>

                                            {myTickets.length > 0 && (
                                                <Grid item xs={12} md={6}>
                                                    <Stack>
                                                        <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '.875rem' }}>
                                                            <FormattedMessage id="raffle-my-tickets" />
                                                        </Typography>
                                                        <Box
                                                            sx={{
                                                                display: 'flex'
                                                            }}
                                                        >
                                                            <Typography
                                                                fontWeight="700"
                                                                color="inherit"
                                                                sx={{ fontSize: '1.25rem', pb: '4px' }}
                                                            >
                                                                {myTickets.length}
                                                            </Typography>
                                                            <MenuButton
                                                                variant="text"
                                                                sx={{
                                                                    textTransform: 'none',
                                                                    color: 'text.primary',
                                                                    p: 0,
                                                                    fontWeight: 400,
                                                                    fontSize: '0.875rem',
                                                                    lineHeight: 1.25,
                                                                    letterSpacing: '0.00938em',
                                                                    alignItems: 'center',
                                                                    paddingBottom: '4px'
                                                                }}
                                                                label={<FormattedMessage id="view" />}
                                                                items={map(myTickets, ({ index }) => ({ label: `# ${index}` }))}
                                                            />
                                                        </Box>
                                                    </Stack>
                                                </Grid>
                                            )}
                                        </Grid>

                                        <Grid container sx={{ mt: 3 }}>
                                            <Grid item xs={12} md={6}>
                                                {/* raffler */}
                                                <Stack>
                                                    <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '.875rem' }}>
                                                        <FormattedMessage id="raffle-creator" />
                                                    </Typography>
                                                    <Typography fontWeight="700" color="inherit" sx={{ fontSize: '1.25rem', pb: '4px' }}>
                                                        {trimAddress(creator)}
                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                {whitelisted !== RAFFLE_REWARD_TYPES.nft && winnerCount > 1 && (
                                                    <Stack>
                                                        <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '.875rem' }}>
                                                            <FormattedMessage id="whitelist-spots" />
                                                        </Typography>
                                                        <Typography
                                                            fontWeight="700"
                                                            color="inherit"
                                                            sx={{ fontSize: '1.25rem', pb: '4px' }}
                                                        >
                                                            {winnerCount}
                                                        </Typography>
                                                    </Stack>
                                                )}
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </TabPanel>
                                <TabPanel value="participants" sx={{ py: 2, px: 0 }}>
                                    <Box sx={{ py: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '1rem' }}>
                                                <FormattedMessage id="wallet" />
                                            </Typography>
                                            <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '1rem' }}>
                                                <FormattedMessage id="tickets-bought" />
                                            </Typography>
                                        </Box>
                                        {map(participants, (indexes: Array<any>, address) => (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                                <Typography fontWeight="400" color="inherit" sx={{ fontSize: '.875rem' }}>
                                                    {getParticipateSocial(address)}
                                                </Typography>
                                                <Typography fontWeight="400" color="inherit" sx={{ fontSize: '.875rem' }}>
                                                    {indexes.length}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </TabPanel>
                                <TabPanel value="transactions" sx={{ py: 2, px: 0 }}>
                                    <Box sx={{ py: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '1rem' }}>
                                                <FormattedMessage id="txn" />
                                            </Typography>
                                            <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '1rem' }}>
                                                <FormattedMessage id="buyer" />
                                            </Typography>
                                            <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '1rem' }}>
                                                <FormattedMessage id="date" />
                                            </Typography>
                                            <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '1rem' }}>
                                                <FormattedMessage id="tickets" />
                                            </Typography>
                                        </Box>
                                        {map(transactions, ({ txn, buyer, date, num }: any) => (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography fontWeight="400" color="inherit" sx={{ fontSize: '.875rem' }}>
                                                    {txn}
                                                </Typography>
                                                <Typography fontWeight="400" color="inherit" sx={{ fontSize: '.875rem' }}>
                                                    {buyer}
                                                </Typography>
                                                <Typography fontWeight="400" color="inherit" sx={{ fontSize: '.875rem' }}>
                                                    {moment(date).format('dd MMM HH:mm')}
                                                </Typography>
                                                <Typography fontWeight="400" color="inherit" sx={{ fontSize: '.875rem' }}>
                                                    {num}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </TabPanel>
                            </TabContext>
                            <Divider />

                            {/* terms and conditions */}
                            <TermsAndConditionsForBuy />
                        </MainCard>
                    </Grid>
                </>
            )}
        </Grid>
    );
};

export default RafflePage;
