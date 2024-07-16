import { Alert, Box, Typography } from '@mui/material';

const TopAlert = ({ severity = 'warning', description, buttons }: any) => (
    <Alert severity={severity}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, width: '100%' }}>
            <Typography>{description}</Typography>
            {buttons}
        </Box>
    </Alert>
);
export default TopAlert;
