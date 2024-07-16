/* eslint-disable no-await-in-loop */
import { ChangeEvent, useEffect, useState } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Typography,
    Grid,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    OutlinedInput,
    Avatar,
    InputAdornment
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useConnections from 'hooks/useConnetions';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEthcontext } from 'contexts/EthWalletProvider';
import { PublicKey, Transaction, Message } from '@solana/web3.js';
import { Promise } from 'bluebird';
import { queries, mutations } from '../../../graphql/graphql';
import useAuth from 'hooks/useAuth';
import useAuthQuery from 'hooks/useAuthQuery';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import useAuthMutation from 'hooks/useAuthMutation';
import { useToasts } from 'hooks/useToasts';
import useStaked from 'hooks/useStaked';
import { flatten, groupBy, map, uniq, isObject } from 'lodash';
import SolanaLogo from 'assets/images/icons/solana-logo.png';
import EthLogo from 'assets/images/blockchains/ethereum-icon.png';
import NFTCard from './NFTCard';
import { useMeta } from 'contexts/meta/meta';

interface CollectionsList {
    collection: string;
    count: number;
    items: any;
    tokenAddresses: string[];
}

export default function Sell() {
    const { connection } = useConnections();
    const wallet = useWallet();
    const auth = useAuth();
    const { publicKey } = wallet;
    const { startLoading, stopLoading } = useMeta();
    const { ethAddress, ethConnect, ethConnected, ethBalance, sendTransaction } = useEthcontext();
    const { stakedYakuNfts, yakusFP, getStats, getStakedJSONs } = useStaked();
    const { showSuccessToast, showErrorToast } = useToasts();

    const [collectionsList, setCollectionsList] = useState<CollectionsList[]>();
    const [collectionId, setCollectionId] = useState('');
    const [allPrice, setAllPrice] = useState('');
    const [listedTokens, setListedToken] = useState<any[]>();
    const [unListedTokens, setUnListedToken] = useState<any[]>();
    const [listedExpand, setListedExpand] = useState(true);
    const [unListedExpand, setUnListedExpand] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);

    const [getUserProfile] = useAuthLazyQuery(queries.GET_CORAL_USER_PROFILE);
    const { refetch } = useAuthQuery(queries.GET_MARKETPLACE_SNAPSHOT);
    const [creatDelistTx] = useAuthMutation(mutations.CREATE_DELIST_TX);
    const [getMEListTransactionInstructions] = useAuthMutation(mutations.GET_ME_LIST_TRANSACTION_INSTRUCTIONS);
    const [getMEDelistTransactionInstructions] = useAuthMutation(mutations.GET_ME_DELIST_TRANSACTION_INSTRUCTIONS);

    const concatCollections = async (nfts: any[]) => {
        const collectionsGroup = groupBy(flatten(nfts), 'collection_name');

        // TODO: Yaku nfts
        // const stakedJSONList: any[] = await getStakedJSONs(stakedYakuNfts);
        // const yakuJSONList = map(stakedJSONList, (item: any) =>
        //     !item.collection
        //         ? { ...item, collection: { name: item.name.split(' #')[0] }, project_id: 'yakux', staked: true }
        //         : { ...item, staked: true, project_id: item.collection.name === 'Capsule X' ? 'capsulex' : 'yakucorp1' }
        // );
        // const groupedYaku = groupBy(yakuJSONList, 'collection.name');

        // let fps = yakusFP;
        // if (!fps || isEmpty(fps)) {
        //     ({ yakusFP: fps } = await getStats());
        // }

        // const collectionsByYaku = map(Object.keys(groupedYaku), (key) => ({
        //     collection: key,
        //     count: groupedYaku[key].length,
        //     items: map(groupedYaku[key], (itm) => ({
        //         ...itm,
        //         floor_price: fps[itm.project_id] / LAMPORTS_PER_SOL,
        //         listed: false,
        //         staked: true,
        //         owner: wallet.publicKey?.toBase58(),
        //         collection_symbol: itm.project_id
        //     }))
        // }));
        const otherNFTsCollection = map(Object.keys(collectionsGroup), (collection) => ({
            collection,
            count: collectionsGroup[collection].length,
            items: map(collectionsGroup[collection], (itm) => ({
                image: itm.original_image,
                rarity_rank: itm.rarity_rank,
                name: itm.name,
                symbol: itm.collection_symbol,
                mint: itm.mint
            })),
            tokenAddresses: map(collectionsGroup[collection], (itm) => {
                const mint_address = new PublicKey(itm.mint).toBase58();
                return mint_address;
            })
        }));
        // setCollectionsList([...collectionsByYaku, ...otherNFTsCollection]);
        setCollectionsList([...otherNFTsCollection]);
    };

    const getSolCollectionsByOwner = async () => {
        const wallets = uniq([publicKey?.toBase58(), ...(auth.user?.wallets || [])]);
        const nfts = await Promise.mapSeries(wallets, async (pubkey) => {
            const { data: profileData } = await getUserProfile({
                variables: {
                    pubkey
                }
            });
            return profileData.getUserProfile;
        });
        console.log('nfts', nfts);

        await concatCollections(nfts);
    };

    const getSolTokensByOwner = async (tokenAddresses: string[]) => {
        const { data: newData } = await refetch({
            tokenAddresses,
            has_metadata: true,
            onlyListings: true,
            field_name: 'lowest_listing_price',
            sort_order: 'ASC',
            page_number: 1,
            page_size: 30,
            progressive_load: true,
            chain: 'SOL'
        });

        const listed: any[] = [];
        const unListed: any[] = [];
        collectionsList &&
            map(collectionsList[Number(collectionId)].items, (tokens) => {
                const item: any = newData.getMarketplaceSnapshot.market_place_snapshots.find(
                    (itm: any) => itm.token_address === tokens?.mint
                );
                if (item && item.lowest_listing_mpa && item.lowest_listing_mpa.price) {
                    listed.push({
                        ...tokens,
                        price: item.lowest_listing_mpa.price,
                        newPrice: item.lowest_listing_mpa.price,
                        marketplace_program_id: item.lowest_listing_mpa.marketplace_program_id
                    });
                } else {
                    unListed.push({
                        ...tokens,
                        price: '',
                        newPrice: '',
                        marketplace_program_id: ''
                    });
                }
            });
        setListedToken(listed);
        setUnListedToken(unListed);
    };

    const setAllPrices = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const price = event.target.value;
        setAllPrice(price);
        const listed = listedTokens;
        map(listed, (token) => {
            token.newPrice = price;
        });
        const unListed = unListedTokens;
        map(unListed, (token) => {
            token.newPrice = price;
        });
        setListedToken(listed);
        setUnListedToken(unListed);
        changePendingCount(listed, unListed);
    };

    const handleRefresh = async () => {
        setCollectionsList([]);
        setCollectionId('');
        setListedToken([]);
        setUnListedToken([]);
        setAllPrice('');
        setPendingCount(0);
        await getSolCollectionsByOwner();
    };

    const changePrice = (mint: string, newPrice: number) => {
        const newListed =
            listedTokens &&
            listedTokens.map((token) => {
                if (token.mint === mint) {
                    return { ...token, newPrice };
                }
                return token;
            });
        const newUnListed =
            unListedTokens &&
            unListedTokens.map((token) => {
                if (token.mint === mint) {
                    return { ...token, newPrice };
                }
                return token;
            });
        setListedToken(newListed);
        setUnListedToken(newUnListed);
        changePendingCount(newListed, newUnListed);
    };

    const changePendingCount = (listed: any, unListed: any) => {
        let count = 0;
        map(listed, (token) => {
            if (Number(token.price) !== Number(token.newPrice)) {
                count += 1;
            }
        });
        map(unListed, (token) => {
            if (Number(token.price) !== Number(token.newPrice)) {
                count += 1;
            }
        });
        setPendingCount(count);
    };

    const updatePendingList = async () => {
        if (!wallet || !wallet.publicKey) {
            return;
        }

        try {
            startLoading();
            const transactions: Transaction[] = [];
            if (listedTokens && listedTokens.length !== 0) {
                for (const item of listedTokens) {
                    if (Number(item.price) !== Number(item.newPrice)) {
                        const transaction = await callListTx(item.mint, item.newPrice, item.marketplace_program_id);
                        if (transaction) {
                            transactions.push(transaction);
                        }
                    }
                }
            }
            if (unListedTokens && unListedTokens.length !== 0) {
                for (const item of unListedTokens) {
                    if (Number(item.price) !== Number(item.newPrice)) {
                        const transaction = await callListTx(item.mint, item.newPrice, item.marketplace_program_id);
                        if (transaction) {
                            transactions.push(transaction);
                        }
                    }
                }
            }
            // const { blockhash } = await connection.getLatestBlockhash('confirmed');

            // transactions.forEach((transaction) => {
            //     transaction.feePayer = wallet.publicKey as PublicKey;
            //     transaction.recentBlockhash = blockhash;
            // });

            // if (wallet.signAllTransactions !== undefined) {
            //     const signedTransactions = await wallet.signAllTransactions(transactions);

            //     const signatures = await Promise.all(
            //         signedTransactions.map((transaction) =>
            //             connection.sendRawTransaction(transaction.serialize(), {
            //                 skipPreflight: true,
            //                 maxRetries: 3,
            //                 preflightCommitment: 'processed'
            //             })
            //         )
            //     );

            //     await Promise.all(signatures.map((signature) => connection.confirmTransaction(signature, 'finalized')));
            //     showSuccessToast('Successfully update listings.');
            // }
            await Promise.all(
                transactions.map(async (transaction) => {
                    const res = await wallet.sendTransaction(transaction, connection);
                    await connection.confirmTransaction(res);
                })
            );
            showSuccessToast('Successfully update listings.');

            // const res = await wallet.sendTransaction(transactions[0], connection);
            // await connection.confirmTransaction(res);
            // showSuccessToast(
            //     <Typography
            //         component="a"
            //         sx={{ color: '#fff' }}
            //         href={`https://solscan.io/tx/${res}`}
            //         target="_blank"
            //         rel="noreferrer"
            //         className="m-auto"
            //     >
            //         Successfully update listings.
            //     </Typography>
            // );
        } catch (error: any) {
            console.error(error);
            if (error.message.includes('User rejected the request')) {
                showErrorToast('User denied transaction signature.');
            } else {
                showErrorToast('There are some errors, please try again later.');
            }
        } finally {
            stopLoading();
            await handleRefresh();
        }
    };

    const callListTx = async (mint: string, price: string, marketplace_program_id: string) => {
        if (!wallet || !wallet.publicKey) {
            return undefined;
        }
        let response;
        let isME = true;
        if (Number(price) === 0 || price === '') {
            if (marketplace_program_id === 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K') {
                const { data: instructions } = await getMEDelistTransactionInstructions({
                    variables: {
                        seller: wallet.publicKey.toBase58(),
                        tokenMint: mint
                    }
                });
                console.log('instructions', instructions);
                ({ getMEDelistTransactionInstructions: response } = instructions);
            } else {
                const { data: instructions } = await creatDelistTx({
                    variables: {
                        sellerAddress: wallet.publicKey.toBase58(),
                        tokenAddress: mint
                    }
                });
                console.log('instructions', instructions);
                isME = false;
                ({ createDelistTx: response } = instructions);
            }
        } else {
            const { data: instructions } = await getMEListTransactionInstructions({
                variables: {
                    seller: wallet.publicKey.toBase58(),
                    tokenMint: mint,
                    price: Number(price)
                }
            });
            console.log('instructions', instructions);
            ({ getMEListTransactionInstructions: response } = instructions);
        }

        let transaction;
        if ((response && response.data) || Object.keys(response).length > 0) {
            if (isME) {
                transaction = Transaction.from(Buffer.from(response.txSigned));
            } else {
                transaction = Transaction.populate(Message.from(Buffer.from(response.data)));
            }
        }

        return transaction;
    };

    useEffect(() => {
        if (publicKey) {
            getSolCollectionsByOwner();
        }
    }, [publicKey]);

    useEffect(() => {
        if (collectionId !== '' && collectionsList && collectionsList?.length > 0) {
            const tokenAddresses = collectionsList[Number(collectionId)].tokenAddresses;
            getSolTokensByOwner(tokenAddresses);
        }
    }, [collectionId, collectionsList]);

    return (
        <>
            <Grid
                container
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '4px',
                    paddingRight: '16px',
                    paddingBottom: '12px',
                    paddingLeft: '16px'
                }}
            >
                <Typography fontSize={18} fontWeight={600}>
                    My NFTs
                </Typography>
                <Button
                    variant="text"
                    size="small"
                    sx={{ padding: '0px', minWidth: '0', color: '#DDE7FE' }}
                    onClick={() => handleRefresh()}
                >
                    Refresh
                </Button>
            </Grid>
            <Divider />
            <div
                style={{
                    height: '100vh',
                    overflow: 'auto'
                }}
            >
                <FormControl size="small" sx={{ mt: 2, mb: 2, pr: 2, pl: 2, width: '100%' }}>
                    <InputLabel id="collectionSelectLabel" sx={{ paddingLeft: '22px' }}>
                        Select a Collection
                    </InputLabel>
                    <Select
                        labelId="collectionSelectLabel"
                        id="collectionSelect"
                        value={collectionId}
                        label="Select a Collection"
                        onChange={(e) => setCollectionId(e.target.value)}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 48 * 4.5 + 8
                                }
                            }
                        }}
                    >
                        {collectionsList &&
                            collectionsList.length > 0 &&
                            Object.keys(collectionsList[0]).length > 0 &&
                            collectionsList.map((collection: any, key: any) => (
                                <MenuItem key={key} value={key}>
                                    {collection.collection} ({collection.count})
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>
                {collectionId !== '' && collectionsList && (
                    <>
                        {pendingCount !== 0 && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    pr: 2,
                                    pl: 2,
                                    backgroundColor: '#171A27'
                                }}
                            >
                                <Typography
                                    component="h3"
                                    fontSize={14}
                                    fontWeight={600}
                                    sx={{ color: '#F5F8FF', width: '100%', pt: '8px', pb: '8px' }}
                                >
                                    Pending Updates ({pendingCount})
                                </Typography>
                                <FormControl variant="outlined" sx={{ maxWidth: '100px' }} />
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2, pl: 2 }}>
                            <Typography component="h3" fontSize={14} fontWeight={600} sx={{ color: '#F5F8FF', width: '100%' }}>
                                Set all prices
                            </Typography>
                            <FormControl variant="outlined" sx={{ maxWidth: '100px' }}>
                                <OutlinedInput
                                    id="outlined-adornment-weight"
                                    type="number"
                                    value={allPrice}
                                    onChange={(e) => setAllPrices(e)}
                                    endAdornment={
                                        <InputAdornment position="start">
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
                                        </InputAdornment>
                                    }
                                    aria-describedby="outlined-weight-helper-text"
                                    size="small"
                                    inputProps={{
                                        inputMode: 'numeric',
                                        pattern: '[0-9]*',
                                        step: '0.01'
                                    }}
                                    sx={{ padding: '0px', '& input': { padding: '10px 0px 10px 10px !important' } }}
                                />
                            </FormControl>
                        </Box>
                        {listedTokens && listedTokens.length > 0 && (
                            <Accordion
                                expanded={listedExpand}
                                onChange={() => setListedExpand(!listedExpand)}
                                sx={{
                                    margin: '0 !important',
                                    backgroundColor: 'transparent',
                                    ':before': {
                                        backgroundColor: 'transparent'
                                    }
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="listed-content"
                                    id="listed-header"
                                    sx={{ minHeight: '0px !important', maxHeight: '38px' }}
                                >
                                    <Typography>Listed</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0 }}>
                                    {listedTokens.map((token: any, key: any) => (
                                        <NFTCard key={key} token={token} changePrice={changePrice} />
                                    ))}
                                </AccordionDetails>
                            </Accordion>
                        )}
                        {unListedTokens && unListedTokens.length > 0 && (
                            <Accordion
                                expanded={unListedExpand}
                                onChange={() => setUnListedExpand(!unListedExpand)}
                                sx={{
                                    margin: '0 !important',
                                    backgroundColor: 'transparent',
                                    ':before': {
                                        backgroundColor: 'transparent'
                                    }
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="unlisted-content"
                                    id="unlisted-header"
                                    sx={{ minHeight: '0px !important', maxHeight: '38px' }}
                                >
                                    <Typography>Unlisted</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0 }}>
                                    {unListedTokens.map((token: any, key: any) => (
                                        <NFTCard key={key} token={token} changePrice={changePrice} />
                                    ))}
                                </AccordionDetails>
                            </Accordion>
                        )}
                    </>
                )}
            </div>
            <Divider />
            <Grid container className="selected-group-control">
                <Box className="total-values">
                    <Typography component="h2" fontSize={16} fontWeight={600}>
                        Listing Fee:
                    </Typography>
                    <span>Free</span>
                </Box>
                <Box className="total-values">
                    <Typography component="h2" fontSize={16} fontWeight={600}>
                        Marketplace Fee:
                    </Typography>
                    <span>1%</span>
                </Box>
                <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => updatePendingList()}
                    sx={{ width: '100%', gap: 1, mt: 1, borderRadius: '50px' }}
                    disabled={pendingCount === 0}
                >
                    <Typography variant="body1" noWrap fontSize="16px">
                        {pendingCount === 0 ? 'Set Prices to List' : `Update ${pendingCount} Listings`}
                    </Typography>
                </Button>
            </Grid>
        </>
    );
}
