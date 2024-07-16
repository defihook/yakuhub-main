/* eslint-disable no-await-in-loop */
import { Box, Typography, Stack, Button } from '@mui/material';
import { Metaplex, walletAdapterIdentity, bundlrStorage, toMetaplexFileFromBrowser } from '@metaplex-foundation/js';
import { useWallet } from '@solana/wallet-adapter-react';
import useConnections from 'hooks/useConnetions';
import { useRef, useState } from 'react';

function ArweaveUpload() {
    const inputTag = useRef() as React.MutableRefObject<HTMLInputElement>;
    const [files, setFiles] = useState<Array<File>>([]);
    const [uris, setUris] = useState<Array<string>>([]);

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

    const handleSelectPhoto = (event: React.ChangeEvent<HTMLInputElement | null>) => {
        if (event.target.files?.length) {
            const selectedFiles = [];
            for (let i = 0; i < event.target.files.length; i += 1) {
                selectedFiles.push(event.target.files[i]);
            }
            setFiles(selectedFiles);
        }
    };

    const handleUpload = async () => {
        const metaplexFiles = [];
        for (let i = 0; i < files.length; i += 1) {
            const file = await toMetaplexFileFromBrowser(files[i]);
            metaplexFiles.push(file);
        }
        setUris(await metaplex.storage().uploadAll(metaplexFiles));
    };

    return (
        <Box style={{ paddingTop: 20, paddingBottom: 20 }}>
            <input type="file" multiple name="photo" onChange={handleSelectPhoto} ref={inputTag} hidden />
            <Typography variant="h2" sx={{ mb: 4 }}>
                Arweave Upload
            </Typography>
            <Stack spacing={4}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'stretch'
                    }}
                >
                    <Button variant="contained" color="secondary" onClick={() => inputTag.current.click()} sx={{ borderRadius: 30000 }}>
                        Select Files
                    </Button>
                    {/* <Button variant="outlined" onClick={() => {}}>
                        Select Folder
                    </Button> */}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {uris.map((uri) => (
                        <a href={uri} target="_blank" rel="noreferrer">
                            uri
                        </a>
                    ))}
                </Box>
                <Button variant="contained" color="secondary" onClick={handleUpload} sx={{ borderRadius: 30000 }}>
                    UPLOAD
                </Button>
            </Stack>
        </Box>
    );
}

export default ArweaveUpload;
