import { ImageOutlined } from '@mui/icons-material';
import { Box, Typography, Stack, TextField, Button, FormControl, Select, MenuItem, Avatar, Grid, IconButton } from '@mui/material';
import React, { useState, useRef } from 'react';
// eslint-disable-next-line import/no-unresolved
import { Metaplex, toMetaplexFileFromBrowser, walletAdapterIdentity, bundlrStorage } from '@metaplex-foundation/js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToasts } from 'hooks/useToasts';
import useConnections from 'hooks/useConnetions';
import { IconTrash } from '@tabler/icons';

function MintNft() {
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

    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [description, setDescription] = useState('');
    const [externalURL, setExternalURL] = useState('');
    const [resaleFee, setResaleFee] = useState(0);
    const [photo, setPhoto] = useState<File>();
    const [category, setCategory] = useState('image');
    const [attributes, setAttributes] = useState<Array<{ trait: string; value: string }>>([]);
    const inputPhoto = useRef() as React.MutableRefObject<HTMLInputElement>;
    const handleSelectPhoto = (event: React.ChangeEvent<HTMLInputElement | null>) => {
        if (event.target.files?.length) {
            setPhoto(event.target.files[0]);
        }
    };

    const handleMint = async () => {
        if (!photo) return;
        try {
            const { uri } = await metaplex
                .nfts()
                .uploadMetadata({
                    name,
                    symbol,
                    description,
                    external_url: externalURL,
                    attributes,
                    image: await toMetaplexFileFromBrowser(photo),
                    properties: {}
                })
                .run();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { nft } = await metaplex
                .nfts()
                .create({
                    uri,
                    name,
                    sellerFeeBasisPoints: resaleFee
                })
                .run();

            showSuccessToast('Success');
        } catch (error) {
            showErrorToast('Failed');
        }
    };

    return (
        <Box style={{ paddingTop: 20, paddingBottom: 20 }}>
            <input type="file" name="photo" onChange={handleSelectPhoto} ref={inputPhoto} accept=".png, .jpg" hidden />
            <Typography variant="h2" sx={{ mb: 4 }}>
                Mint NFT
            </Typography>
            <Stack spacing={3}>
                <Grid container>
                    <Grid item xs={12} md={4}>
                        <Stack spacing={0.5} sx={{ pr: { xs: 0, md: 2 } }}>
                            <Typography variant="body2">File*</Typography>
                            <Box>
                                <Avatar
                                    onClick={() => inputPhoto.current?.click()}
                                    src={photo ? URL.createObjectURL(photo as Blob) : ''}
                                    variant="rounded"
                                    sx={{ width: '100%', height: 300, aspectRatio: '1 / 1', cursor: 'pointer' }}
                                >
                                    <ImageOutlined />
                                </Avatar>
                            </Box>
                        </Stack>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        md={8}
                        sx={{
                            mt: { xs: 3, md: 0 },
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: { xs: 2, md: 0 }
                        }}
                    >
                        <Stack spacing={0.5}>
                            <Typography variant="body2">Name*</Typography>
                            <TextField
                                variant="outlined"
                                style={{ width: '100%' }}
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                sx={{
                                    fieldset: { borderColor: '#f38aff !important' },
                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                }}
                            />
                        </Stack>
                        <Stack spacing={0.5}>
                            <Typography variant="body2">Symbol</Typography>
                            <TextField
                                variant="outlined"
                                value={symbol}
                                onChange={(event) => setSymbol(event.target.value)}
                                style={{ width: '100%' }}
                                sx={{
                                    fieldset: { borderColor: '#f38aff !important' },
                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                }}
                            />
                        </Stack>
                        <Stack spacing={0.5}>
                            <Typography variant="body2">Category</Typography>
                            <FormControl fullWidth>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={category}
                                    style={{ width: '100%' }}
                                    onChange={(e) => setCategory(e.target.value)}
                                    sx={{
                                        fieldset: { borderColor: '#f38aff !important' },
                                        '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                    }}
                                >
                                    <MenuItem value="image">Image</MenuItem>
                                    <MenuItem value="vr">Vr</MenuItem>
                                    <MenuItem value="video">Video</MenuItem>
                                    <MenuItem value="html">HTML</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                        <Stack spacing={0.5}>
                            <Typography variant="body2">Resale Fee (0-10 000, e.g. for 5% use 500)</Typography>
                            <TextField
                                variant="outlined"
                                type="number"
                                style={{ width: '100%' }}
                                inputProps={{ min: '0', max: '10000' }}
                                value={resaleFee}
                                onChange={(event) => setResaleFee(parseInt(event.target.value, 10))}
                                sx={{
                                    fieldset: { borderColor: '#f38aff !important' },
                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                }}
                            />
                        </Stack>
                    </Grid>
                </Grid>
                <Stack spacing={0.5}>
                    <Typography variant="body2">External URL (Link to your website, e.g. https://rugbirdz.com)</Typography>
                    <TextField
                        variant="outlined"
                        value={externalURL}
                        style={{ width: '100%' }}
                        onChange={(event) => setExternalURL(event.target.value)}
                        sx={{
                            fieldset: { borderColor: '#f38aff !important' },
                            '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                        }}
                    />
                </Stack>
                <Stack spacing={0.5}>
                    <Typography variant="body2">Description</Typography>
                    <TextField
                        variant="outlined"
                        multiline
                        rows={3}
                        value={description}
                        style={{ width: '100%' }}
                        onChange={(event) => setDescription(event.target.value)}
                        sx={{
                            fieldset: { borderColor: '#f38aff !important' },
                            '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                        }}
                    />
                </Stack>
                <Stack spacing={0.5}>
                    <Typography variant="body2">Attributes</Typography>
                    {attributes.map((pair: { trait: string; value: string }, index) => (
                        <Stack spacing={0.5} direction="row">
                            <TextField
                                fullWidth
                                label="Trait"
                                variant="outlined"
                                value={pair.trait}
                                onChange={(event) => {
                                    const newPair = { ...pair, trait: event.target.value };
                                    const newAttributes = JSON.parse(JSON.stringify(attributes));
                                    newAttributes[index] = newPair;
                                    setAttributes(newAttributes);
                                }}
                                sx={{
                                    fieldset: { borderColor: '#f38aff !important' },
                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Value"
                                variant="outlined"
                                value={pair.value}
                                onChange={(event) => {
                                    const newPair = { ...pair, value: event.target.value };
                                    const newAttributes = JSON.parse(JSON.stringify(attributes));
                                    newAttributes[index] = newPair;
                                    setAttributes(newAttributes);
                                }}
                                sx={{
                                    fieldset: { borderColor: '#f38aff !important' },
                                    '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                                }}
                            />
                            <IconButton color="secondary" onClick={() => setAttributes(attributes.filter((p) => p !== pair))}>
                                <IconTrash />
                            </IconButton>
                        </Stack>
                    ))}
                    <Button
                        variant="contained"
                        color="secondary"
                        sx={{ borderRadius: 30000 }}
                        onClick={() => setAttributes(attributes.concat({ trait: '', value: '' }))}
                    >
                        ADD ATTRIBUTE
                    </Button>
                </Stack>
                <Button variant="contained" color="secondary" sx={{ borderRadius: 30000 }} onClick={handleMint}>
                    MINT NFT
                </Button>
            </Stack>
        </Box>
    );
}

export default MintNft;
