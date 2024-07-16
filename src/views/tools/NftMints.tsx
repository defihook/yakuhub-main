/* eslint-disable no-eval */
import { Typography, TextField, Stack, Button, Box, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useToasts } from 'hooks/useToasts';
import { getMints } from './utils/get-mints';
import { download } from './utils/download';
import useConnections from 'hooks/useConnetions';

// eslint-disable-next-line arrow-body-style
function NftMints() {
    const { connection } = useConnections();
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [counter, setCounter] = useState(0);
    const { showSuccessToast, showErrorToast } = useToasts();
    const [localStorageItems, setLocalStorageItems] = useState<{ name: string; timestamp: number; items: any[] }[]>([]);
    const [isInvalidAddress, setIsInvalidAddress] = useState(false);

    useEffect(() => {
        setIsInvalidAddress(!address || address.length === 0);
    }, [address]);

    const handleGetNftMints = async () => {
        if (!address || address.length === 0) {
            setIsInvalidAddress(true);
            setLoading(false);
            showErrorToast('Please provide a valid address.');
            return;
        }

        setLoading(true);
        getMints(address, connection, setCounter)
            // @ts-ignore
            .then((mints: any[]) => {
                const now = Date.now();
                const name = `mints-cmid-${address}-${now}`;
                const output = {
                    name,
                    timestamp: now,
                    items: mints
                };
                const outputAsString = JSON.stringify(output);
                download(`${name}.json`, outputAsString);
                const updatedItems = localStorageItems ? [...localStorageItems, output] : [output];
                setLocalStorageItems(updatedItems);
                localStorage.setItem('user-mint-lists', JSON.stringify(updatedItems));
                setLoading(false);
            })
            .catch((e) => {
                showErrorToast('Error. Please try again.');
                setLoading(false);
            })
            .finally(() => {
                showSuccessToast('File downloaded successfully.');
                setLoading(false);
                setCounter(0);
            });
    };

    return (
        <Box style={{ paddingTop: 20, paddingBottom: 20 }}>
            <Typography variant="h2" sx={{ mb: 4 }}>
                Get NFT Mints
            </Typography>
            <Stack spacing={3}>
                <Stack spacing={0.5}>
                    <Typography variant="subtitle1">CM ID or Verified Creator</Typography>
                    <TextField
                        variant="outlined"
                        value={address}
                        disabled={loading}
                        onChange={(e) => setAddress(e.target.value)}
                        error={!!address && isInvalidAddress}
                        sx={{
                            fieldset: { borderColor: '#f38aff !important' },
                            '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                        }}
                    />
                    <Typography variant="caption" sx={{ opacity: 0.5, fontSize: '12px' }}>
                        Please enter CM ID or Verified Creator.
                    </Typography>
                </Stack>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleGetNftMints}
                    disabled={loading || !address}
                    startIcon={loading && <CircularProgress size={20} />}
                    sx={{ borderRadius: 30000 }}
                >
                    Get Mints
                </Button>
            </Stack>
        </Box>
    );
}

export default NftMints;
