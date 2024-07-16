/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-await-in-loop */
/* eslint-disable array-callback-return */
/* eslint-disable arrow-body-style */
/* eslint-disable jsx-a11y/control-has-associated-label */

import { useReducer, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ParsedAccountData, PublicKey } from '@solana/web3.js';

import { fetchMetaForUI } from './utils/token-metadata';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token-v2';
import { toPublicKey } from './utils/to-publickey';
import { NFTPreview } from './NftPreview';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons';
import { Box, Button, Typography, Grid, Stack, TextField, Avatar, LinearProgress } from '@mui/material';
import { ImageOutlined } from '@mui/icons-material';
import useConnections from 'hooks/useConnetions';
import { DataV2, Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { NftPreviewSkeleton } from './NftPreviewSkeleton';
import { map } from 'lodash';
import MainCard from 'components/MainCard';
import { AnchorProvider } from '@project-serum/anchor';
import { SplTokenMetadata } from '@strata-foundation/spl-utils';

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

export default function UpdateToken() {
    // const connection = new Connection(clusterApiUrl('devnet'));
    const { connection } = useConnections();
    const { publicKey } = useWallet();

    // @ts-ignore
    const [state, dispatch] = useReducer(reducer, initState);
    const [tokens, setTokens] = useState<any[]>([]);
    const pubKeyString = useMemo(() => publicKey?.toBase58(), [publicKey]);

    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState<File>();

    const inputPhoto = useRef() as React.MutableRefObject<HTMLInputElement>;
    const handleSelectPhoto = (event: React.ChangeEvent<HTMLInputElement | null>) => {
        // setPhoto(event.target.files);
        if (event.target.files?.length) {
            setPhoto(event.target.files[0]);
        }
    };

    const handleNFTs = useCallback(async () => {
        if (!publicKey) {
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
            const accounts = await connection.getParsedProgramAccounts(
                TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
                {
                    filters: [
                        {
                            dataSize: 165 // number of bytes
                        },
                        {
                            memcmp: {
                                offset: 32, // number of bytes
                                // @ts-ignore
                                bytes: pubKeyString // base58 encoded string
                            }
                        }
                    ]
                }
            );
            const mints = accounts
                .filter((a) => (a.account.data as ParsedAccountData).parsed.info.tokenAmount.uiAmount > 1)
                .map((a) => (a.account.data as ParsedAccountData).parsed.info.mint);

            // @ts-ignore
            const data = (await fetchMetaForUI(mints, () => {}, connection).toPromise()).filter((e) => !e.failed || true);
            setTokens(data);
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

    const handleNFTSelect = (selectedNFT: string) => {
        const newPubkey = toPublicKey(selectedNFT);
        // @ts-ignore
        dispatch({ type: 'selectedNFTs', payload: { selectedNFTs: [newPubkey] } });
        const token = tokens.filter((token) => token.mint === newPubkey.toString())[0];
        if (token) {
            setName(token.metadata.name);
            setSymbol(token.metadata.symbol);
            setDescription(token.metadata.description);
        }
    };

    const handleUpdate = async () => {
        if (!publicKey) return;

        const mint = state.selectedNFTs[0];
        const me = publicKey;
        if (!me) return;
        const cloneWindow: any = window;
        // eslint-disable-next-line @typescript-eslint/dot-notation
        const provider = new AnchorProvider(connection, cloneWindow['solana'], AnchorProvider.defaultOptions());
        const splTokenMetadata = await SplTokenMetadata.init(provider);
        const uri = await splTokenMetadata.uploadMetadata({
            name,
            symbol,
            description,
            image: photo,
            mint
        });

        const data: DataV2 = {
            // Max name len 32
            name: name.substring(0, 32),
            symbol: symbol.substring(0, 10),
            uri,
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null
        };
        const metadata = await Metadata.getPDA(mint);

        const { instructions, signers } = await splTokenMetadata.updateMetadataInstructions({
            data,
            metadata
        });
        await splTokenMetadata.sendInstructions(instructions, signers);
    };

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
                <Button variant="contained" onClick={handlePrevPage} disabled={page < 2} sx={{ borderRadius: 30000 }}>
                    <IconArrowLeft />
                </Button>
                <p>
                    {page} / {/* trying maffs */}
                    {state.nfts?.length % itemsPerPage === 0
                        ? state.nfts?.length / itemsPerPage
                        : Math.floor(state.nfts?.length / itemsPerPage) + 1}
                </p>
                <Button
                    variant="contained"
                    onClick={handleNextPage}
                    disabled={
                        page >=
                        (state.nfts?.length % itemsPerPage === 0
                            ? state.nfts?.length / itemsPerPage
                            : Math.floor(state.nfts?.length / itemsPerPage) + 1)
                    }
                    sx={{ borderRadius: 30000 }}
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
            <p className="text-lg text-center text-white">There was an error fetching your Tokens :(</p>
        ) : (
            <>
                <Grid container spacing={2} sx={{ justifyContent: 'space-between' }}>
                    <Grid item xs={12} md={state.selectedNFTs.length > 0 ? 8 : 12}>
                        <div>
                            {state.nfts.length === 0 ? (
                                <Typography variant="body2" style={{ marginLeft: 10 }}>
                                    You have no Token.
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
                    </Grid>
                    {state.selectedNFTs.length > 0 && (
                        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <MainCard divider={false}>
                                <input type="file" name="photo" onChange={handleSelectPhoto} ref={inputPhoto} accept=".png, .jpg" hidden />

                                <Stack spacing={1}>
                                    <Grid item xs={12}>
                                        <Stack spacing={0.5}>
                                            <Box sx={{ opacity: 0.5, fontSize: '12px' }}>Name</Box>
                                            <TextField
                                                variant="outlined"
                                                value={name}
                                                onChange={(event) => setName(event.target.value)}
                                                sx={{
                                                    fieldset: { borderColor: '#f38aff !important' },
                                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                                }}
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Stack spacing={0.5}>
                                            <Box sx={{ opacity: 0.5, fontSize: '12px' }}>Symbol</Box>
                                            <TextField
                                                variant="outlined"
                                                value={symbol}
                                                onChange={(event) => setSymbol(event.target.value)}
                                                sx={{
                                                    fieldset: { borderColor: '#f38aff !important' },
                                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                                }}
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Stack spacing={0.5}>
                                            <Box sx={{ opacity: 0.5, fontSize: '12px' }}>Description</Box>
                                            <TextField
                                                variant="outlined"
                                                multiline
                                                rows={5}
                                                value={description}
                                                onChange={(event) => setDescription(event.target.value)}
                                                sx={{
                                                    fieldset: { borderColor: '#f38aff !important' },
                                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                                }}
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Stack spacing={0.5}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px'
                                                }}
                                            >
                                                <Button
                                                    variant="contained"
                                                    color="secondary"
                                                    onClick={() => inputPhoto.current?.click()}
                                                    sx={{ borderRadius: 30000 }}
                                                >
                                                    Choose
                                                </Button>
                                                <Avatar
                                                    src={photo ? URL.createObjectURL(photo as Blob) : ''}
                                                    variant="rounded"
                                                    sx={{ width: 34, height: 34 }}
                                                >
                                                    <ImageOutlined />
                                                </Avatar>
                                            </Box>
                                            <Box sx={{ opacity: 0.5, fontSize: '12px' }}>
                                                The image that will be displayed with this token
                                            </Box>
                                        </Stack>
                                    </Grid>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        disabled={!state.selectedNFTs.length}
                                        onClick={handleUpdate}
                                        sx={{ borderRadius: 30000 }}
                                    >
                                        UPDATE
                                    </Button>
                                </Stack>
                            </MainCard>
                        </Grid>
                    )}
                </Grid>
                {paginationDisplay}
                {itemsPerPageSelectionDisplay}
            </>
        );
    }, [state, itemsPerPageSelectionDisplay, paginationDisplay, nftsToRender, handleNFTSelect]);

    return (
        <Box style={{ paddingTop: 20, paddingBottom: 20 }}>
            <Typography variant="h2" sx={{ mb: 4 }}>
                Update Token Metadata
            </Typography>
            {publicKey ? <div>{nftDisplay}</div> : null}
        </Box>
    );
}
