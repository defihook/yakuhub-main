/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-await-in-loop */
/* eslint-disable array-callback-return */
/* eslint-disable arrow-body-style */
/* eslint-disable jsx-a11y/control-has-associated-label */

import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, Button, Divider, Grid, LinearProgress, TextField, Typography } from '@mui/material';
import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz';
import {
    createAssociatedTokenAccountInstruction,
    createCloseAccountInstruction,
    createTransferInstruction,
    getAssociatedTokenAddress
} from '@solana/spl-token-v2';
import { IconArrowLeft, IconArrowRight, IconSend } from '@tabler/icons';
import { Promise } from 'bluebird';
import useConnections from 'hooks/useConnetions';
import { useToasts } from 'hooks/useToasts';
import { chunk, filter, flatten, map } from 'lodash';
import { NFTPreview } from './NftPreview';
import { NftPreviewSkeleton } from './NftPreviewSkeleton';
import { getBlockhashWithRetries } from './utils/get-blockhash-with-retries';
import { toPublicKey } from './utils/to-publickey';
import { fetchMetaForUI } from './utils/token-metadata';

const initState: {
    nfts: any[];
    status: string;
    publicAddress: null | string;
    itemsPerPage: 12 | 24 | 120;
    isModalOpen: boolean;
    isBurning: boolean;
    selectedNFTs: PublicKey[];
} = {
    nfts: [],
    publicAddress: null,
    status: 'idle',
    itemsPerPage: 12,
    isModalOpen: false,
    isBurning: false,
    selectedNFTs: []
};

type SendNftAction =
    | { type: 'started'; payload?: null }
    | { type: 'error'; payload?: null }
    | { type: 'unselectAll'; payload?: null }
    | { type: 'sending'; payload?: null }
    | { type: 'sent'; payload?: null }
    | { type: 'success'; payload: { nfts: any[] } }
    | { type: 'nfts'; payload: { nfts: any[] } }
    | { type: 'isModalOpen'; payload: { isModalOpen: boolean } }
    | { type: 'publicAddress'; payload: { publicAddress: string } }
    | { type: 'itemsPerPage'; payload: { itemsPerPage: number } }
    | { type: 'selectedNFTs'; payload: { selectedNFTs: PublicKey[] } };

const reducer = (state: typeof initState, action: SendNftAction) => {
    switch (action.type) {
        case 'started':
            return { ...state, status: 'pending' };
        case 'nfts':
            return { ...state, nfts: action.payload.nfts };
        case 'sending':
            return { ...state, isSending: true };
        case 'sent':
            return { ...state, isSending: false };
        case 'error':
            return { ...state, status: 'rejected' };
        case 'itemsPerPage':
            return { ...state, itemsPerPage: action.payload.itemsPerPage };
        case 'isModalOpen':
            return { ...state, isModalOpen: action.payload.isModalOpen };
        case 'publicAddress':
            return { ...state, publicAddress: action.payload.publicAddress };
        case 'success':
            return { ...state, status: 'resolved', nfts: action.payload.nfts };
        case 'unselectAll':
            return { ...state, selectedNFTs: [] };
        case 'selectedNFTs':
            return {
                ...state,
                selectedNFTs: action.payload.selectedNFTs
            };
        default:
            throw new Error('unsupported action type given on SendNFTs reducer');
    }
};

function SendNfts() {
    const { connection } = useConnections();
    const { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } = useToasts();
    // const connection = new Connection(clusterApiUrl('devnet'));
    const { publicKey, signAllTransactions } = useWallet();
    const [dstAddress, setDstAddress] = useState('');

    // @ts-ignore
    const [state, dispatch] = useReducer(reducer, initState);

    const pubKeyString = useMemo(() => publicKey?.toBase58(), [publicKey]);

    const handleNFTs = useCallback(async () => {
        if (!publicKey || !pubKeyString) {
            return;
        }

        try {
            // @ts-ignore
            dispatch({ type: 'started' });
            // @ts-ignore
            dispatch({
                type: 'publicAddress',
                payload: { publicAddress: pubKeyString }
            });

            const accounts = await getParsedNftAccountsByOwner({
                publicAddress: pubKeyString,
                connection
            });
            const mints = accounts.map((a) => a.mint);
            // @ts-ignore
            const data = (await fetchMetaForUI(mints, () => {}, connection).toPromise()).filter((e) => !e.failed);

            const nftsWithImages = data.map((nft) => {
                if (nft) {
                    if (nft.metadata?.image) {
                        return { ...nft, image: nft.metadata?.image };
                    }
                    if (nft.metadata?.properties?.category === 'video') {
                        return {
                            ...nft,
                            image: null,
                            video: { ...nft?.metadata?.properties?.files[0] }
                        };
                    }
                    return { ...nft, image: null, video: null };
                }
                return { ...nft, image: null, video: null };
            });
            // @ts-ignore
            dispatch({ type: 'success', payload: { nfts: nftsWithImages } });
        } catch (err) {
            console.log(err);
            // @ts-ignore
            dispatch({ type: 'error' });
        }
    }, [publicKey, pubKeyString, connection]);

    const itemsPerPage = useMemo(() => state.itemsPerPage, [state]);

    const [page, setPage] = useState(1);

    const createAssociatedTokenAccountsForMints = async (mints: PublicKey[], destination: string) => {
        const resolvedTokenaccountsWithBalances = filter(
            await Promise.mapSeries(mints, async (mint: PublicKey) => ({
                mint,
                ata: await getAssociatedTokenAddress(mint, toPublicKey(destination), true),
                balance: await connection.getBalance(await getAssociatedTokenAddress(mint, toPublicKey(destination), true))
            })),
            (mint: any) => !mint.balance || !mint.ata
        );
        const txs = [];
        const chunks = chunk(resolvedTokenaccountsWithBalances, 5);
        if (!chunks.length) {
            return;
        }
        showLoadingToast(
            `Creating ${resolvedTokenaccountsWithBalances.length} token accounts \n in ${chunks.length} transactions..\nThis can take a while!`
        );
        for (const slice of chunks) {
            const tx = new Transaction().add(
                ...map(slice, (acc) =>
                    // @ts-ignore
                    createAssociatedTokenAccountInstruction(publicKey, acc.ata, toPublicKey(destination), acc.mint)
                )
            );
            tx.recentBlockhash = (await getBlockhashWithRetries(connection)).blockhash;
            // @ts-ignore
            tx.feePayer = publicKey;
            txs.push(tx);
        }
        if (txs.length) {
            // @ts-ignore
            await signAllTransactions(txs);
            const txSignatures = [];
            for (const tx of txs) {
                const txSianture = await connection.sendRawTransaction(tx.serialize());
                txSignatures.push(txSianture);
            }
            for (const txSinature of txSignatures) {
                await connection.confirmTransaction(txSinature, 'confirmed');
            }
            // await Promise.map(txs, (tx) =>
            //     sendAndConfirmWithRetry(
            //         connection,
            //         tx.serialize(),
            //         {
            //             maxRetries: 3,
            //             skipPreflight: true
            //         },
            //         'processed'
            //     )
            // );
        }
    };

    const handleSend = async () => {
        if (!publicKey || !state.selectedNFTs) {
            return;
        }

        // @ts-ignore
        dispatch({ type: 'sending' });

        try {
            await createAssociatedTokenAccountsForMints(state.selectedNFTs, dstAddress);
            const txChunks: any[][] = await Promise.map(chunk(state.selectedNFTs, 3), (sliced: any[]) =>
                Promise.map(sliced, async (mint) => {
                    const sourceATA = await getAssociatedTokenAddress(mint, publicKey, true);
                    const destATA = await getAssociatedTokenAddress(mint, toPublicKey(dstAddress), true);
                    const tokenAccBalance = +(await connection.getTokenAccountBalance(sourceATA)).value.amount;
                    const instruction = createTransferInstruction(sourceATA, destATA, publicKey, tokenAccBalance, []);
                    const closeIx = createCloseAccountInstruction(sourceATA, publicKey, publicKey, []);
                    const transaction = new Transaction().add(instruction, closeIx);
                    transaction.recentBlockhash = (await getBlockhashWithRetries(connection)).blockhash;
                    transaction.feePayer = publicKey;
                    return transaction;
                })
            );
            const flattenTxs = flatten(txChunks);
            dismissToast();
            showLoadingToast(`Sending ${flattenTxs.length} transactions...`);
            // @ts-ignore
            await signAllTransactions(flattenTxs);
            const txSignatures = [];
            for (const tx of flattenTxs) {
                const txSianture = await connection.sendRawTransaction(tx.serialize());
                txSignatures.push(txSianture);
            }
            for (const txSinature of txSignatures) {
                await connection.confirmTransaction(txSinature, 'confirmed');
            }
            // await Promise.mapSeries(flattenTxs, async (tx) => {
            //     try {
            //         const txId = await sendAndConfirmWithRetry(
            //             connection,
            //             tx.serialize(),
            //             {
            //                 maxRetries: 3,
            //                 skipPreflight: true
            //             },
            //             'processed'
            //         );
            //         return txId;
            //     } catch (error) {
            //         showErrorToast(`Transaction could not be confirmed in time, please check explorer.`);
            //     }
            //     return undefined;
            // });
            const filtered: any[] = filter(
                state.nfts,
                ({ mint }: { mint: string | PublicKey | Uint8Array }) => !state.selectedNFTs.includes(toPublicKey(mint))
            );
            // @ts-ignore
            dispatch({
                type: 'nfts',
                payload: {
                    nfts: filtered
                }
            });
            // @ts-ignore
            dispatch({ type: 'selectedNFTs', payload: { selectedNFTs: [] } });
            dismissToast();
            showSuccessToast(`Sent ${state.selectedNFTs.length} NFTs!`);
        } catch (err: any) {
            console.error(err);
            dismissToast();
            showErrorToast(`Error sending transaction. ${err.message || err.code || err}`);
        } finally {
            // @ts-ignore
            dispatch({ type: 'sent' });
        }
    };

    const nftsToRender = useMemo(() => {
        if (!state.nfts) {
            return [];
        }

        const nftsCopy = [...state.nfts];
        const chunkedNFTs = [];
        const firstChunk = nftsCopy.splice(0, itemsPerPage);
        chunkedNFTs.push(firstChunk);
        while (nftsCopy.length) {
            const chunk = nftsCopy.splice(0, itemsPerPage);
            chunkedNFTs.push(chunk);
        }
        return chunkedNFTs[page - 1];
    }, [state, page, itemsPerPage]);

    const handleNextPage = () => {
        setPage(page + 1);
    };

    const handlePrevPage = () => {
        setPage(page - 1 || 1);
    };

    const handleItemsPerPageSelection = useCallback(
        (itemsPerPage: number) => {
            // @ts-ignore
            dispatch({ type: 'itemsPerPage', payload: { itemsPerPage } });
        },
        [dispatch]
    );

    const handleNFTSelect = useCallback(
        (selectedNFT: string) => {
            const newPubkey = toPublicKey(selectedNFT);
            const idx = state.selectedNFTs.findIndex((nft: { equals: (arg0: PublicKey) => any }) => nft.equals(newPubkey));
            if (idx >= 0) {
                const newItems = state.selectedNFTs.filter((nft: { equals: (arg0: PublicKey) => any }) => !nft.equals(newPubkey));
                // @ts-ignore
                dispatch({ type: 'selectedNFTs', payload: { selectedNFTs: newItems } });
            } else {
                const newItems = [...state.selectedNFTs, newPubkey];
                // @ts-ignore
                dispatch({ type: 'selectedNFTs', payload: { selectedNFTs: newItems } });
            }
        },
        [state.selectedNFTs]
    );

    const itemsPerPageSelectionDisplay = useMemo(() => {
        const options = [12, 24, 120];

        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '20px' }}>
                <Typography variant="body2" style={{ marginRight: 10 }}>
                    Items per page:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {options.map((opt, index) => (
                        <div key={opt}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                size="small"
                                onClick={() => handleItemsPerPageSelection(opt)}
                                disabled={opt === itemsPerPage}
                                sx={{ borderRadius: 30000 }}
                            >
                                {opt}
                            </Button>
                        </div>
                    ))}
                </Box>
            </Box>
        );
    }, [itemsPerPage, handleItemsPerPageSelection]);

    const paginationDisplay = useMemo(() => {
        return state.nfts.length > itemsPerPage ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '20px', gap: '10px' }}>
                <Button variant="contained" color="secondary" onClick={handlePrevPage} disabled={page < 2} sx={{ borderRadius: 30000 }}>
                    <IconArrowLeft />
                </Button>
                <Typography variant="body2">
                    {page} / {/* trying maffs */}
                    {state.nfts?.length % itemsPerPage === 0
                        ? state.nfts?.length / itemsPerPage
                        : Math.floor(state.nfts?.length / itemsPerPage) + 1}
                </Typography>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleNextPage}
                    sx={{ borderRadius: 30000 }}
                    disabled={
                        page >=
                        (state.nfts?.length % itemsPerPage === 0
                            ? state.nfts?.length / itemsPerPage
                            : Math.floor(state.nfts?.length / itemsPerPage) + 1)
                    }
                >
                    <IconArrowRight />
                </Button>
            </Box>
        ) : null;
    }, [state.nfts, itemsPerPage, page, handlePrevPage, handleNextPage]);

    useEffect(() => {
        if (publicKey && state.status === 'idle') {
            handleNFTs();
        }
    }, [publicKey, state, handleNFTs]);

    const nftDisplay = useMemo(() => {
        if (['idle', 'pending'].includes(state.status)) {
            return (
                <>
                    <LinearProgress color="secondary" />
                    <Grid container spacing={4} sx={{ mt: 4 }}>
                        {map([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], (idx) => (
                            <Grid item xs={6} md={4} lg={3} xl={2} key={idx}>
                                <NftPreviewSkeleton />
                            </Grid>
                        ))}
                    </Grid>
                </>
            );
        }

        return state.status === 'rejected' ? (
            <Typography variant="body2" className="text-lg text-center text-white">
                There was an error fetching your NFTs.
            </Typography>
        ) : (
            <>
                <div>
                    {state.nfts.length === 0 ? (
                        <Typography variant="body2" style={{ marginLeft: 10 }}>
                            You have no NFTs.
                        </Typography>
                    ) : (
                        <Grid container spacing={4}>
                            {nftsToRender?.map((nft) => (
                                <Grid item xs={6} md={4} lg={3} xl={2} id={nft.mint} key={nft.mint}>
                                    <NFTPreview
                                        nft={nft}
                                        selectable
                                        handleNFTSelect={handleNFTSelect}
                                        selected={
                                            !!state.selectedNFTs.find((n: { equals: (arg0: PublicKey) => any }) =>
                                                n.equals(toPublicKey(nft.mint))
                                            )
                                        }
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </div>
            </>
        );
    }, [state, itemsPerPageSelectionDisplay, paginationDisplay, nftsToRender, handleNFTSelect]);
    return (
        <Box>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid item xs={12} lg={6}>
                    <Typography variant="body2">This tool facilitates bulk sending of NFTs.</Typography>
                    <Typography variant="body2">Please select NFTs and input destination address to send.</Typography>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Grid container spacing={2} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Grid item xs={12} md={8}>
                            <TextField
                                variant="outlined"
                                value={dstAddress}
                                sx={{
                                    width: '100%',
                                    height: '52px',
                                    fieldset: { borderColor: '#f38aff !important' },
                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                }}
                                disabled={state.isSending}
                                onChange={(e) => setDstAddress(e.target.value)}
                                label="Destination address"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <LoadingButton
                                fullWidth
                                variant="contained"
                                color="secondary"
                                sx={{ height: '52px', borderRadius: 30000 }}
                                disabled={!state.selectedNFTs.length || !dstAddress}
                                onClick={handleSend}
                                loading={state.isSending}
                                endIcon={<IconSend />}
                            >
                                {state.selectedNFTs.length ? `send ${state.selectedNFTs.length} items` : 'select to send'}{' '}
                            </LoadingButton>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Divider sx={{ mt: 2 }} />
            {publicKey ? (
                <Box sx={{ mt: 4 }}>
                    {nftDisplay}
                    {paginationDisplay}
                    {itemsPerPageSelectionDisplay}
                </Box>
            ) : null}
        </Box>
    );
}

export default SendNfts;
