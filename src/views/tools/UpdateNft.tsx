import { Box, Typography, Stack, TextField, Button } from '@mui/material';
import React, { useState } from 'react';
import { Metaplex, walletAdapterIdentity, bundlrStorage } from '@metaplex-foundation/js';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useToasts } from 'hooks/useToasts';
import useConnections from 'hooks/useConnetions';

function UpdateNft() {
    const { connection } = useConnections();
    const metaplex = new Metaplex(connection);
    const wallet = useWallet();
    metaplex.use(walletAdapterIdentity(wallet));

    metaplex.use(
        bundlrStorage({
            address: 'https://node1.bundlr.network',
            providerUrl: 'https://api.mainnet-beta.solana.com',
            timeout: 60000
        })
    );

    const { showSuccessToast, showErrorToast } = useToasts();

    const [mintAddress, setMintAddress] = useState('');
    const [metadataJson, setMetadataJson] = useState('');
    const [updateAuthority, setUpdateAuthority] = useState('');

    const handleUpdate = async () => {
        if (!mintAddress) return;

        try {
            const mint = new PublicKey(mintAddress);

            // @ts-ignore
            const nft = await metaplex.nfts().findByMint(mint).run();
            console.log(nft);

            const { uri: newUri } = await metaplex
                .nfts()
                .uploadMetadata({
                    ...nft.json,
                    ...JSON.parse(metadataJson || '{}')
                })
                .run();

            // @ts-ignore
            await metaplex.nfts().update(nft, { uri: newUri }).run();

            showSuccessToast('Success');
        } catch (error) {
            console.log(error);
            showErrorToast('Failed');
        }
    };

    return (
        <Box style={{ paddingTop: 20, paddingBottom: 20 }}>
            <Typography variant="h2" sx={{ mb: 4 }}>
                Update Metadata
            </Typography>
            <Stack spacing={3}>
                <Stack spacing={0.5}>
                    <Typography variant="body2">NFT Mint*</Typography>
                    <TextField
                        variant="outlined"
                        value={mintAddress}
                        onChange={(event) => setMintAddress(event.target.value)}
                        sx={{
                            fieldset: { borderColor: '#f38aff !important' },
                            '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                        }}
                    />
                </Stack>

                <Stack spacing={0.5}>
                    <Typography variant="body2">New Metadata as JSON (optional)</Typography>
                    <TextField
                        variant="outlined"
                        multiline
                        rows={3}
                        value={metadataJson}
                        onChange={(event) => setMetadataJson(event.target.value)}
                        sx={{
                            fieldset: { borderColor: '#f38aff !important' },
                            '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                        }}
                    />
                </Stack>
                <Stack spacing={0.5}>
                    <Typography variant="body2">New Update Authority (optional)</Typography>
                    <TextField
                        variant="outlined"
                        value={updateAuthority}
                        onChange={(event) => setUpdateAuthority(event.target.value)}
                        sx={{
                            fieldset: { borderColor: '#f38aff !important' },
                            '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                        }}
                    />
                </Stack>

                <Button variant="contained" color="secondary" onClick={handleUpdate} sx={{ borderRadius: 30000 }}>
                    UPDATE NFT
                </Button>
            </Stack>
        </Box>
    );
}

export default UpdateNft;
