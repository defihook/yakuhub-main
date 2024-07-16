/* eslint-disable no-await-in-loop */
import { useEffect, useState } from 'react';
import { Button, IconButton, Typography, Box, Grid, TextField } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { DEFAULT_BUYER_BROKER } from 'config/config';
import useAuthMutation from 'hooks/useAuthMutation';
import { useToasts } from 'hooks/useToasts';
import useConnections from 'hooks/useConnetions';
import { maxCartItems } from 'store/constant';
import { useCartItems } from 'contexts/CartContext';
import { useEthcontext } from 'contexts/EthWalletProvider';
import { useMeta } from 'contexts/meta/meta';
import { mutations } from '../../../graphql/graphql';
import MainCard from 'components/cards/MainCard';
import { useParams } from 'react-router-dom';
import SelectedTab from './SelectedTab';
import Sell from './Sell';

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

export default function Cart() {
    const { connection } = useConnections();
    const wallet = useWallet();
    const { publicKey } = wallet;
    const { ethAddress, ethConnect, ethConnected, ethBalance, sendTransaction } = useEthcontext();
    const { chain, projectId, mint } = useParams();

    const [getMETransactionInstructions] = useAuthMutation(mutations.GET_ME_TRANSACTION_INSTRUCTIONS);
    const [createBuyTx] = useAuthMutation(mutations.CREATE_BUY_TX);
    const {
        cartItems,
        setCartItems,
        setOpen,
        temp,
        setTemp,
        sweepCount,
        setSweepCount,
        sweepValue,
        setSweepValue,
        multiTabIdx,
        setMultiTabIdx
    } = useCartItems();

    const { fetchBalance, startLoading, stopLoading } = useMeta();
    const { showSuccessToast, showErrorToast } = useToasts();

    const [solBalance, setSolBalance] = useState(0);
    const [collectionPage, setCollectionPage] = useState(false);

    const buyNowMulti = async (tokens: SelectedItemType[]) => {
        if (tokens && tokens.length > 0) {
            const [solTokens, ethTokens] = tokens.reduce(
                (result: any, item: SelectedItemType) => {
                    result[item.chain === 'SOL' ? 0 : 1].push(item);
                    return result;
                },
                [[], []]
            );

            if (solTokens && solTokens.length > 0) {
                await buyNowMultiInSOL(solTokens);
            }
            if (ethTokens && ethTokens.length > 0) {
                await buyNowMultiInETH(ethTokens);
            }
            updateView();
        }
    };

    const buyNowMultiInSOL = async (tokens: SelectedItemType[]) => {
        if (!wallet || !wallet.publicKey) {
            return;
        }
        try {
            startLoading();

            const transactions: Transaction[] = [];
            if (tokens && tokens.length !== 0) {
                for (const item of tokens) {
                    const transaction = await getBuyNowTx(
                        item.name,
                        item.tokenAddress,
                        item.price,
                        item.brokerReferralAddress,
                        item.marketplaceProgramId
                    );
                    if (transaction) {
                        transactions.push(transaction);
                    }
                }
            }
            const { blockhash } = await connection.getLatestBlockhash('confirmed');

            transactions.forEach((transaction) => {
                transaction.feePayer = wallet.publicKey as PublicKey;
                transaction.recentBlockhash = blockhash;
            });

            if (wallet.signAllTransactions !== undefined) {
                const signedTransactions = await wallet.signAllTransactions(transactions);

                const signatures = await Promise.all(
                    signedTransactions.map((transaction) =>
                        connection.sendRawTransaction(transaction.serialize(), {
                            skipPreflight: true,
                            maxRetries: 3,
                            preflightCommitment: 'confirmed'
                        })
                    )
                );

                await Promise.all(signatures.map((signature) => connection.confirmTransaction(signature, 'finalized')));
            }
        } catch (error: any) {
            console.error(error);
            if (error.message.includes('User rejected the request')) {
                showErrorToast('User denied transaction signature.');
            } else {
                showErrorToast('There are some errors, please try again later.');
            }
        } finally {
            stopLoading();
        }
    };

    const getBuyNowTx = async (
        name: string,
        token_address: string,
        price: number,
        broker_referral_address: string,
        marketplace_program_id: string
    ) => {
        if (!wallet || !wallet.publicKey) {
            return undefined;
        }
        let instructions;
        let response;
        let isME = false;
        if (marketplace_program_id === 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K') {
            ({ data: instructions } = await getMETransactionInstructions({
                variables: {
                    buyer: wallet.publicKey.toBase58(),
                    tokenMint: token_address
                }
            }));
            isME = true;
            ({ getMETransactionInstructions: response } = instructions);
        } else {
            ({ data: instructions } = await createBuyTx({
                variables: {
                    buyerAddress: wallet.publicKey.toBase58(),
                    price,
                    tokenAddress: token_address,
                    buyerBroker: broker_referral_address || DEFAULT_BUYER_BROKER || process.env.SOLANA_FEE_ACCOUNT
                }
            }));
            ({ createBuyTx: response } = instructions);
        }

        let transaction;
        if ((response && response.data) || Object.keys(response).length > 0) {
            // if (isME) {
            transaction = Transaction.from(Buffer.from(response.data || response.txSigned));
            // } else {
            //     transaction = Transaction.populate(Message.from(Buffer.from(data)));
            // }
        }
        return transaction;
    };

    const buyNowMultiInETH = async (tokensInfo: SelectedItemType[]) => {
        if (!ethConnected || !ethAddress) {
            ethConnect();
        } else {
            try {
                startLoading();
                const tokens = tokensInfo.map((token) => `${token.contractAddress}:${token.tokenAddress}`);

                let totalPrice = 0;
                for (let i = 0; i < tokensInfo.length; i += 1) {
                    totalPrice += tokensInfo[i].price;
                }

                if (ethBalance < totalPrice) {
                    showErrorToast('You have insufficient funds to buy this token.');
                    return;
                }

                const { data: instructions } = await createBuyTx({
                    variables: {
                        buyerAddress: ethAddress, // required field
                        tokens, // required field
                        chain: 'ETH', // required field
                        price: totalPrice,
                        tokenAddress: '',
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

    const onDeSelect = (tokenAddress: string, contractAddress: string) => {
        const selected = cartItems;
        if (selected && selected.length !== 0) {
            let index = -1;
            for (let i = 0; i < selected.length; i += 1) {
                if (selected[i].tokenAddress === tokenAddress && selected[i].contractAddress === contractAddress) {
                    index = i;
                }
            }
            if (index !== -1) {
                selected.splice(index, 1);
            }
        }

        // After calling setCartItems(), should call the setTemp(!temp)
        // to update the cart items immediately
        // It's because useContext, we will need to update it later in a better way
        setCartItems(selected);
        setTemp(!temp);
    };

    const updateView = async () => {
        if (publicKey) {
            const bal = await fetchBalance(new PublicKey(publicKey?.toBase58()), connection);
            setSolBalance(bal);
        }
    };

    const handleMultiTabChange = (newValue: string) => {
        setMultiTabIdx(newValue);
        if (newValue === 'sweep') {
            setCartItems([]);
        }
    };

    const handleItemsChange = (value: any) => {
        setSweepCount(value as number);
        setCartItems([]);
    };

    const handleSweepPriceChange = (value: any) => {
        setSweepValue(parseFloat(value));
        setCartItems([]);
    };

    useEffect(() => {
        updateView();
    }, [wallet, publicKey]);

    useEffect(() => {
        if (chain && projectId && !mint) {
            setCollectionPage(true);
        } else {
            setCollectionPage(false);
        }
    }, [chain, projectId, mint]);

    return (
        <MainCard
            border={false}
            content={false}
            sx={{
                backgroundColor: 'transparent',
                width: '352px',
                right: '0px',
                zIndex: '9997',
                position: 'fixed',
                top: '120px',
                height: 'calc(100vh - 130px)'
            }}
        >
            <Box
                sx={{
                    backgroundColor: '#10121B',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '35px',
                    border: '1px solid rgb(43, 49, 79)',
                    width: '100%',
                    height: '100%'
                }}
            >
                <Grid container sx={{ display: 'flex', justifyContent: 'space-between', padding: '16px 16px 16px' }}>
                    <Grid
                        item
                        sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.16)',
                            borderRadius: '35px',
                            display: 'flex',
                            height: '26px'
                        }}
                    >
                        <Button
                            color="secondary"
                            variant={multiTabIdx === 'buy' ? 'contained' : 'text'}
                            key="buy"
                            onClick={() => handleMultiTabChange('buy')}
                            sx={{ borderRadius: '35px', minWidth: '0', padding: '4px 12px' }}
                        >
                            Buy
                        </Button>
                        <Button
                            color="secondary"
                            variant={multiTabIdx === 'sell' ? 'contained' : 'text'}
                            key="sell"
                            onClick={() => handleMultiTabChange('sell')}
                            sx={{ borderRadius: '35px', minWidth: '0', padding: '4px 12px' }}
                        >
                            Sell
                        </Button>
                        {/* <Button
                            color="secondary"
                            variant={multiTabIdx === 'bid' ? 'contained' : 'text'}
                            key="sell"
                            onClick={() => handleMultiTabChange('bid')}
                            sx={{ borderRadius: '35px', minWidth: '0', padding: '4px 12px' }}
                            disabled
                            aria-label="Coming soon"
                            aria-required="true"
                        >
                            Bid
                        </Button> */}
                        <Button
                            color="secondary"
                            variant={multiTabIdx === 'sweep' ? 'contained' : 'text'}
                            key="sweep"
                            onClick={() => handleMultiTabChange('sweep')}
                            sx={{ borderRadius: '35px', minWidth: '0', padding: '4px 12px' }}
                            disabled={!collectionPage}
                            aria-label={!collectionPage ? 'Go to collection page' : ''}
                            aria-required="true"
                        >
                            Sweep
                        </Button>
                    </Grid>
                    <IconButton onClick={() => setOpen(false)} sx={{ padding: '0px' }}>
                        <Close />
                    </IconButton>
                </Grid>
                {multiTabIdx === 'buy' && (
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
                            <Grid item sx={{ alignItems: 'center', display: 'flex' }}>
                                <Typography fontSize={18} fontWeight={600}>
                                    My Cart
                                </Typography>
                                <Typography
                                    fontSize={14}
                                    fontWeight={500}
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.16)',
                                        borderRadius: '32px',
                                        padding: '4px 8px',
                                        marginLeft: '12px'
                                    }}
                                >
                                    {cartItems.length}/{maxCartItems}
                                </Typography>
                            </Grid>
                            <Button
                                variant="text"
                                size="small"
                                sx={{ padding: '0px', minWidth: '0', color: '#DDE7FE' }}
                                onClick={() => setCartItems([])}
                            >
                                Clear
                            </Button>
                        </Grid>
                        <SelectedTab
                            buyNowMulti={buyNowMulti}
                            selectedNfts={cartItems}
                            onDeSelect={onDeSelect}
                            type="buy"
                            solBalance={solBalance}
                            ethBalance={ethBalance}
                        />
                    </>
                )}
                {multiTabIdx === 'sell' && <Sell />}
                {multiTabIdx === 'sweep' && (
                    <>
                        <div
                            className="sweep-panel"
                            style={{ marginLeft: '16px', marginRight: '16px', marginBottom: '12px', display: 'flex', gap: '8px' }}
                        >
                            <div style={{ width: '50%' }}>
                                <Typography component="h4" fontSize={12} fontWeight={500}>
                                    Max price per item
                                </Typography>
                                <TextField
                                    variant="outlined"
                                    label={chain}
                                    value={sweepValue}
                                    size="small"
                                    sx={{ mt: 2 }}
                                    onChange={(e: any) => handleSweepPriceChange(e.target.value)}
                                    fullWidth
                                />
                            </div>
                            <div style={{ width: '50%' }}>
                                <Typography component="h4" fontSize={12} fontWeight={500}>
                                    Number of items
                                </Typography>
                                <TextField
                                    variant="outlined"
                                    label="Items"
                                    value={sweepCount}
                                    type="number"
                                    size="small"
                                    onChange={(e: any) => handleItemsChange(e.target.value)}
                                    sx={{ mt: 2 }}
                                    fullWidth
                                />
                            </div>
                        </div>
                        <SelectedTab
                            buyNowMulti={buyNowMulti}
                            selectedNfts={cartItems}
                            onDeSelect={onDeSelect}
                            type="sweep"
                            solBalance={solBalance}
                            ethBalance={ethBalance}
                        />
                    </>
                )}
            </Box>
        </MainCard>
    );
}
