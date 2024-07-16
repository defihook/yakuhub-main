import { Typography, TextField, Stack, Button, Box, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { getAddresses } from './utils/validators';
import { download } from './utils/download';
import { getOwners } from './utils/holder-snapshot';
import useConnections from 'hooks/useConnetions';
import { useToasts } from 'hooks/useToasts';

const jsonFormat = require('json-format');

// eslint-disable-next-line arrow-body-style
function HolderSnapshot() {
    const { connection } = useConnections();
    const { showErrorToast } = useToasts();
    const [mints, setMints] = useState('');
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [counter, setCounter] = useState(0);
    const [isInvalidMints, setIsInvalidMints] = useState(false);

    useEffect(() => {
        setIsInvalidMints(!mints || mints.length === 0);
    }, [mints]);

    const handleGetHolders = async () => {
        if (!mints || mints.length === 0) {
            setIsInvalidMints(true);
            setLoading(false);
            showErrorToast('Please provide valid addresses.');
            return;
        }

        const parsed = getAddresses(mints);
        setLoading(true);

        const owners = await getOwners(parsed, connection, setCounter).catch(() => {
            setLoading(false);
        });

        const filename = 'gib-holders.json';
        download(filename, jsonFormat(owners, { size: 1, type: 'tab' }));
        setLoading(false);
    };

    return (
        <Box style={{ paddingTop: 20, paddingBottom: 20 }}>
            <Typography variant="h2" sx={{ mb: 4 }}>
                Holder Snapshot
            </Typography>
            <Stack spacing={1}>
                <Stack spacing={0.5}>
                    <Typography variant="subtitle1">SOL mint IDs</Typography>
                    <TextField
                        multiline
                        variant="outlined"
                        rows={3}
                        value={mints}
                        onChange={(e) => setMints(e.target.value)}
                        error={!!mints && isInvalidMints}
                        disabled={loading}
                        sx={{
                            fieldset: { borderColor: '#f38aff !important' },
                            '&:hover': { fieldset: { borderColor: '#f38aff !important' } }
                        }}
                    />
                    <Box sx={{ opacity: 0.5, fontSize: '12px' }}>
                        Please enter NFT mint IDs as JSON array to get their holders, mints and amounts.
                    </Box>
                </Stack>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleGetHolders}
                    disabled={loading || !mints}
                    startIcon={loading && <CircularProgress size={20} />}
                    sx={{ borderRadius: 30000 }}
                >
                    Get Holders
                </Button>
            </Stack>
        </Box>
    );
}

export default HolderSnapshot;
