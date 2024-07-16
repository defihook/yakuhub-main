import { Box, Skeleton } from '@mui/material';

const NFTProjectPlaceholder = () => (
    <Box
        sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            gap: 2
        }}
    >
        <Skeleton variant="rounded" width={48} height={51} />
        <Skeleton variant="rounded" width="100%" height={51} />
    </Box>
);

export default NFTProjectPlaceholder;
