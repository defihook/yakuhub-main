// material-ui
import { styled } from '@mui/material/styles';

// ==============================|| AUTHENTICATION 1 WRAPPER ||============================== //

const AuthWrapper = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#09080d' : theme.palette.primary.light,
    minHeight: '70vh'
}));

export default AuthWrapper;
