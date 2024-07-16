/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-await-in-loop */
/* eslint-disable array-callback-return */
/* eslint-disable arrow-body-style */
/* eslint-disable jsx-a11y/control-has-associated-label */

import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';

import { Box, Button, Checkbox, Divider, FormControlLabel, FormGroup, Grid, LinearProgress, Typography } from '@mui/material';
import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz';
import { createBurnInstruction, createCloseAccountInstruction, getAssociatedTokenAddress } from '@solana/spl-token-v2';
import { IconArrowLeft, IconArrowRight, IconFlame, IconX } from '@tabler/icons';
import useConnections from 'hooks/useConnetions';
import useStaked from 'hooks/useStaked';
import { map } from 'lodash';
import { toast } from 'react-toastify';
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

type BurnNftAction =
    | { type: 'started'; payload?: null }
    | { type: 'error'; payload?: null }
    | { type: 'unselectAll'; payload?: null }
    | { type: 'burning'; payload?: null }
    | { type: 'burned'; payload?: null }
    | { type: 'success'; payload: { nfts: any[] } }
    | { type: 'nfts'; payload: { nfts: any[] } }
    | { type: 'isModalOpen'; payload: { isModalOpen: boolean } }
    | { type: 'publicAddress'; payload: { publicAddress: string } }
    | { type: 'itemsPerPage'; payload: { itemsPerPage: number } }
    | { type: 'selectedNFTs'; payload: { selectedNFTs: PublicKey[] } };

const reducer = (state: typeof initState, action: BurnNftAction) => {
    switch (action.type) {
        case 'started':
            return { ...state, status: 'pending' };
        case 'nfts':
            return { ...state, nfts: action.payload.nfts };
        case 'burning':
            return { ...state, isBurning: true };
        case 'burned':
            return { ...state, isBurning: false };
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
            throw new Error('unsupported action type given on BurnNFTs reducer');
    }
};

export default function BurnNFTs() {
    const { connection } = useConnections();
    const { publicKey, signAllTransactions } = useWallet();
    const { getNFTsByOwner } = useStaked();

    // @ts-ignore
    const [state, dispatch] = useReducer(reducer, initState);
    const [showVerified, setShowVerified] = useState(false);
    const [verifiedNFTMints, setVerifiedNFTMints] = useState<any[]>([]);

    const pubKeyString = useMemo(() => publicKey?.toBase58(), [publicKey]);

    const handleNFTs = useCallback(
        async (shouldShowVerified = false) => {
            if (!publicKey || !pubKeyString) {
                return;
            }

            try {
                // @ts-ignore
                dispatch({ type: 'started' });
                if (shouldShowVerified && verifiedNFTMints.length > 0 && pubKeyString === state.publicAddress) {
                    // @ts-ignore
                    dispatch({ type: 'success', payload: { nfts: verifiedNFTMints } });
                } else {
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
                    const { data: nftData } = await getNFTsByOwner({
                        variables: {
                            wallets: [publicKey.toBase58()]
                        }
                    });
                    const nftList = map(nftData.getWallet, ({ mint }) => mint);
                    const mints = accounts
                        .filter((a) => shouldShowVerified || (!shouldShowVerified && !nftList.includes(a.mint)))
                        .map((a: any) => a.mint);
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
                    if (shouldShowVerified) {
                        setVerifiedNFTMints(nftsWithImages);
                    }
                    // @ts-ignore
                    dispatch({ type: 'success', payload: { nfts: nftsWithImages } });
                }
            } catch (err) {
                console.log(err);
                // @ts-ignore
                dispatch({ type: 'error' });
            }
        },
        [publicKey, pubKeyString, connection]
    );

    const itemsPerPage = useMemo(() => state.itemsPerPage, [state]);

    const [page, setPage] = useState(1);

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

    const handleNFTUnselect = useCallback(
        (mint: PublicKey) => {
            const newItems = state.selectedNFTs.filter((nft: { equals: (arg0: PublicKey) => any }) => !nft.equals(mint));
            // @ts-ignore
            dispatch({ type: 'selectedNFTs', payload: { selectedNFTs: newItems } });
        },
        [state.selectedNFTs]
    );

    const removeNFT = useCallback(
        (nft: PublicKey) => {
            // @ts-ignore
            dispatch({
                type: 'nfts',
                payload: {
                    nfts: state.nfts.filter((i: { mint: string | PublicKey | Uint8Array }) => !toPublicKey(i.mint).equals(nft))
                }
            });
        },
        [state.nfts]
    );

    const handleBurn = useCallback(async () => {
        if (!publicKey || !state.selectedNFTs) {
            return;
        }

        try {
            // @ts-ignore
            dispatch({ type: 'burning' });
            toast(`Burning ${state.selectedNFTs.length} NFTs`, {
                isLoading: true
            });
            const txs = [];
            for (const mint of state.selectedNFTs) {
                const mintAssociatedAccountAddress = await getAssociatedTokenAddress(mint, publicKey, false);
                const tokenAmount = await connection.getTokenAccountBalance(mintAssociatedAccountAddress);
                const amount = tokenAmount.value.uiAmount;
                const instruction = createBurnInstruction(mintAssociatedAccountAddress, mint, publicKey, amount || 1, []);

                const closeIx = createCloseAccountInstruction(mintAssociatedAccountAddress, publicKey, publicKey, []);
                const transaction = new Transaction().add(instruction, closeIx);
                transaction.recentBlockhash = (await getBlockhashWithRetries(connection)).blockhash;
                transaction.feePayer = publicKey;
                txs.push(transaction);
            }
            // @ts-ignore
            const signedTxs = await signAllTransactions(txs);
            let i = 0;
            const mints = [...state.selectedNFTs];
            const txSignatures = [];
            for (const tx of signedTxs) {
                const id = await connection.sendRawTransaction(tx.serialize());
                txSignatures.push(id);
            }
            for (const id of txSignatures) {
                await connection.confirmTransaction(id, 'confirmed');
                removeNFT(mints[i]);
                handleNFTUnselect(mints[i]);
                i += 1;
            }
        } catch (err) {
            console.log(err);
            toast.dismiss();
            toast('Some NFTs are not burned!', { type: 'error' });
        }
        // @ts-ignore
        dispatch({ type: 'burned' });
        toast.dismiss();
    }, [publicKey, state, removeNFT, handleNFTUnselect, connection, signAllTransactions]);

    const itemsPerPageSelectionDisplay = useMemo(() => {
        const options = [12, 24, 120];

        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '20px' }}>
                <Typography variant="body2" style={{ marginRight: 10 }}>
                    Items per page:
                </Typography>
                <Box sx={{ display: 'flex' }}>
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
                <Box sx={{ mt: 4 }}>
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
                                        hoverComponent={
                                            <Typography
                                                sx={{
                                                    display: 'flex',
                                                    gap: 1,
                                                    borderRadius: 30000,
                                                    border: '1px solid red',
                                                    backgroundColor: 'red',
                                                    alignItems: 'center',
                                                    p: 1,
                                                    color: 'white'
                                                }}
                                            >
                                                <IconX /> <>Select to burn</>
                                            </Typography>
                                        }
                                        selectedComponent={
                                            <Typography
                                                sx={{
                                                    display: 'flex',
                                                    gap: 1,
                                                    borderRadius: 30000,
                                                    border: '1px solid #f38aff',
                                                    backgroundColor: '#f38aff',
                                                    alignItems: 'center',
                                                    py: 1,
                                                    px: 2,
                                                    color: 'white'
                                                }}
                                            >
                                                <>Selected</>
                                            </Typography>
                                        }
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>

                {paginationDisplay}
                {itemsPerPageSelectionDisplay}
            </>
        );
    }, [state, itemsPerPageSelectionDisplay, paginationDisplay, nftsToRender, handleNFTSelect]);

    return (
        <Box>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid item xs={12} md={6} lg={8}>
                    <Typography variant="body2">
                        This tool facilitates the destruction of NFTs that the connected wallet owns. It also releases the rent (ca 0.002
                        SOL per NFT)
                    </Typography>
                </Grid>
                <Grid item xs={12} md={3} lg={2}>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    color="secondary"
                                    checked={showVerified}
                                    disabled={['idle', 'pending'].includes(state.status)}
                                    onChange={() => {
                                        const result = !showVerified;
                                        setPage(1);
                                        setShowVerified(result);
                                        handleNFTs(result);
                                    }}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                />
                            }
                            label="Show Verified"
                        />
                    </FormGroup>
                </Grid>
                <Grid item xs={12} md={3} lg={2}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        disabled={!state.selectedNFTs.length}
                        onClick={() => {
                            handleBurn();
                        }}
                        endIcon={<IconFlame />}
                        sx={{ borderRadius: 30000 }}
                    >
                        {state.selectedNFTs.length ? `burn ${state.selectedNFTs.length} items` : 'select to burn'}{' '}
                    </Button>
                </Grid>
            </Grid>
            <Divider sx={{ mt: 2 }} />
            {publicKey ? <div>{nftDisplay}</div> : null}
        </Box>
    );
}
