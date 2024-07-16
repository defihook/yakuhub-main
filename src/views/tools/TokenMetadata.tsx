import { Typography, TextField, Stack, Button, Box, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { fetchMetaForUI } from './utils/token-metadata';
import { getAddresses } from './utils/validators';
import { download } from './utils/download';
import { useToasts } from 'hooks/useToasts';
import useConnections from 'hooks/useConnetions';

const jsonFormat = require('json-format');

// eslint-disable-next-line arrow-body-style
function TokenMetadata() {
    const { connection } = useConnections();
    const [mints, setMints] = useState('');
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [counter, setCounter] = useState(0);
    const [isInvalidMints, setIsInvalidMints] = useState(false);
    const { showSuccessToast, showErrorToast } = useToasts();

    useEffect(() => {
        setIsInvalidMints(!mints || mints.length === 0);
    }, [mints]);

    const handleGetMetadata = async () => {
        if (!mints || mints.length === 0) {
            setIsInvalidMints(true);
            setLoading(false);
            showErrorToast('Please provide valid addresses.');
            return;
        }

        const parsed = getAddresses(mints);
        setLoading(true);

        fetchMetaForUI(parsed, setCounter, connection).subscribe({
            next: (e) => {
                download(`nft-metadata-${Date.now()}.json`, jsonFormat(e, { size: 1, type: 'tab' }));
                setLoading(false);
            },
            error: (e) => {
                setLoading(false);
                showErrorToast(`Error. Please try again.`);
            },
            complete: () => {
                showSuccessToast(`Metadata file downloaded successfully.`);
                setLoading(false);
            }
        });
    };

    return (
        <Box style={{ paddingTop: 20, paddingBottom: 20 }}>
            <Typography variant="h2" sx={{ mb: 4 }}>
                Token Metadata
            </Typography>
            <Stack spacing={3}>
                <Stack spacing={0.5}>
                    <Typography variant="subtitle1">SOL mint IDs</Typography>
                    <TextField
                        multiline
                        variant="outlined"
                        disabled={loading}
                        rows={3}
                        value={mints}
                        sx={{
                            fieldset: { borderColor: '#f38aff !important' },
                            '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                        }}
                        onChange={(e) => setMints(e.target.value)}
                        error={!!mints && isInvalidMints}
                    />
                    <Typography variant="caption" sx={{ opacity: 0.5, fontSize: '12px' }}>
                        Please enter NFT token mint address(es) to get their metadata.
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.5, fontSize: '12px' }}>
                        Enter multiple mint IDs separate either by{' '}
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            comma
                        </Typography>
                        , or{' '}
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            newline
                        </Typography>
                        .
                    </Typography>
                </Stack>
                <Button
                    variant="contained"
                    color="secondary"
                    sx={{ borderRadius: 30000 }}
                    onClick={handleGetMetadata}
                    disabled={loading || !mints}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    Get Metadata
                </Button>
            </Stack>
        </Box>
    );
}

export default TokenMetadata;
