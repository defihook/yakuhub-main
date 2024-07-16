// eslint-disable-next-line arrow-body-style
import { Stack, Box, TextField, Button, Avatar, Switch, FormControlLabel, Grid, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import { AnchorProvider } from '@project-serum/anchor';
import { ImageOutlined } from '@mui/icons-material';
import { Keypair, Signer } from '@solana/web3.js';
import { createMintInstructions, sendInstructions, SplTokenMetadata } from '@strata-foundation/spl-utils';
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    AuthorityType,
    createAssociatedTokenAccountInstruction,
    createMintToInstruction,
    createSetAuthorityInstruction,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID
} from '@solana/spl-token-v2';
import { DataV2 } from '@metaplex-foundation/mpl-token-metadata';
import { useWallet } from '@solana/wallet-adapter-react';
import useConnections from 'hooks/useConnetions';

// eslint-disable-next-line arrow-body-style
const TokenCreation = () => {
    const wallet = useWallet();
    const { connection } = useConnections();
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [photo, setPhoto] = useState<File>();
    const [description, setDescription] = useState('');
    const [decimals, setDecimals] = useState(0);
    const [supply, setSupply] = useState(0);
    const [keepMintAuthority, setKeepMintAuthority] = useState(true);
    const [keepFreezeAuthority, setKeepFreezeAuthority] = useState(false);

    const handleSelectPhoto = (event: React.ChangeEvent<HTMLInputElement | null>) => {
        if (event.target.files?.length) {
            setPhoto(event.target.files[0]);
        }
    };

    const inputPhoto = useRef() as React.MutableRefObject<HTMLInputElement>;

    const handleCreateToken = async () => {
        const targetMintKeypair = Keypair.generate();
        const targetMint = targetMintKeypair.publicKey;
        const me = wallet.publicKey;
        if (!me) return;
        const cloneWindow: any = window;
        // eslint-disable-next-line @typescript-eslint/dot-notation
        const provider = new AnchorProvider(connection, cloneWindow['solana'], AnchorProvider.defaultOptions());
        const splTokenMetadata = await SplTokenMetadata.init(provider);
        const instructions = await createMintInstructions(
            splTokenMetadata.provider,
            me,
            targetMintKeypair.publicKey,
            decimals,
            keepFreezeAuthority ? me : undefined
        );
        const signers: Signer[] = [targetMintKeypair];
        const uri = await splTokenMetadata.uploadMetadata({
            name,
            symbol,
            description,
            image: photo,
            mint: targetMintKeypair.publicKey
        });
        // @ts-ignore
        const metadata: DataV2 = {
            // Max name len 32
            name: name.substring(0, 32),
            symbol: symbol.substring(0, 10),
            uri,
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null
        };
        const { instructions: metadataInstructions, signers: metadataSigners } = await splTokenMetadata.createMetadataInstructions({
            data: metadata,
            mint: targetMint,
            mintAuthority: me,
            authority: me
        });
        instructions.push(...metadataInstructions);
        signers.push(...metadataSigners);
        const ata = await getAssociatedTokenAddress(targetMint, me, true, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
        instructions.push(
            createAssociatedTokenAccountInstruction(me, ata, me, targetMint, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID),
            createMintToInstruction(
                targetMint,
                ata,
                me,
                // eslint-disable-next-line new-cap
                supply * Math.pow(10, decimals),
                [],
                TOKEN_PROGRAM_ID
            )
        );

        if (!keepMintAuthority) {
            instructions.push(createSetAuthorityInstruction(targetMint, me, AuthorityType.MintTokens, null, [], TOKEN_PROGRAM_ID));
        }

        await sendInstructions(new Map(), splTokenMetadata.provider, instructions, signers, me);

        // eslint-disable-next-line consistent-return
        return targetMintKeypair.publicKey;
    };

    return (
        <Box style={{ paddingTop: 20, paddingBottom: 20 }}>
            <Typography variant="h2" sx={{ mb: 4 }}>
                Token Creation
            </Typography>
            <input type="file" name="photo" onChange={handleSelectPhoto} ref={inputPhoto} accept=".png, .jpg" hidden />
            <Stack spacing={3}>
                <Grid container spacing={1}>
                    <Grid item xs={12} md={6}>
                        <Stack spacing={0.5}>
                            <Typography variant="subtitle1">Token Name</Typography>
                            <TextField
                                variant="outlined"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                sx={{
                                    fieldset: { borderColor: '#f38aff !important' },
                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                }}
                            />
                            <Box sx={{ opacity: 0.5, fontSize: '12px' }}>The name that will be displayed for this token</Box>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Stack spacing={0.5}>
                            <Typography variant="subtitle1">Symbol</Typography>
                            <TextField
                                variant="outlined"
                                value={symbol}
                                onChange={(event) => setSymbol(event.target.value)}
                                sx={{
                                    fieldset: { borderColor: '#f38aff !important' },
                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                }}
                            />
                            <Box sx={{ opacity: 0.5, fontSize: '12px' }}>The symbol for this token, ex: SOL</Box>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Stack spacing={0.5}>
                            <Typography variant="subtitle1">Mint Decimals</Typography>
                            <TextField
                                variant="outlined"
                                type="number"
                                inputProps={{ min: '0', max: '12' }}
                                value={decimals}
                                onChange={(event) => setDecimals(parseInt(event.target.value, 10))}
                                sx={{
                                    fieldset: { borderColor: '#f38aff !important' },
                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                }}
                            />
                            <Box sx={{ opacity: 0.5, fontSize: '12px' }}>
                                The number of decimal places this mint will have. For example, SOL has 9 decimal places of precision. 0 is
                                best used for 1:1 items like raffle tickets, collectibles, or something redeemable.
                            </Box>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Stack spacing={0.5}>
                            <Typography variant="subtitle1">Supply</Typography>
                            <TextField
                                variant="outlined"
                                type="number"
                                inputProps={{ min: '0', step: '1000' }}
                                value={supply}
                                onChange={(event) => setSupply(parseInt(event.target.value, 10))}
                                sx={{
                                    fieldset: { borderColor: '#f38aff !important' },
                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                }}
                            />
                            <Box sx={{ opacity: 0.5, fontSize: '12px' }}>
                                The number of tokens to mint. After creation these will be available in your wallet
                            </Box>
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                        <Stack spacing={0.5}>
                            <Typography variant="subtitle1">Logo</Typography>
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
                                    sx={{ borderRadius: 30000 }}
                                    onClick={() => inputPhoto.current?.click()}
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
                            <Box sx={{ opacity: 0.5, fontSize: '12px' }}>The image that will be displayed with this token</Box>
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                        <Stack spacing={0.5}>
                            <Typography variant="subtitle1">Description</Typography>
                            <TextField
                                variant="outlined"
                                multiline
                                rows={3}
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                sx={{
                                    fieldset: { borderColor: '#f38aff !important' },
                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                }}
                            />
                            <Box sx={{ opacity: 0.5, fontSize: '12px' }}>The description that will be displayed for this token</Box>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Stack spacing={0.5}>
                            <FormControlLabel
                                control={
                                    <Switch checked={keepMintAuthority} onChange={(event) => setKeepMintAuthority(event.target.checked)} />
                                }
                                labelPlacement="end"
                                label="Keep Mint Authority?"
                            />
                            <Box sx={{ opacity: 0.5, fontSize: '12px' }}>
                                Would you like the ability to mint more than the specified supply of tokens?
                            </Box>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Stack spacing={0.5}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={keepFreezeAuthority}
                                        onChange={(event) => setKeepFreezeAuthority(event.target.checked)}
                                    />
                                }
                                labelPlacement="end"
                                label="Keep Freeze Authority?"
                            />
                            <Box sx={{ opacity: 0.5, fontSize: '12px' }}>
                                Would you like the ability to freeze token accounts using this token, so that they may no longer be used.
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </Stack>

            <Button variant="contained" color="secondary" fullWidth sx={{ borderRadius: 30000, mt: 4 }} onClick={handleCreateToken}>
                Create Token
            </Button>
        </Box>
    );
};

export default TokenCreation;
