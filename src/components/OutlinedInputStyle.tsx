import { OutlinedInput, styled } from '@mui/material';
import { shouldForwardProp } from '@mui/system';

const OutlinedInputStyle = styled(OutlinedInput, { shouldForwardProp })(({ theme }) => ({
    width: 434,
    height: 46,
    marginLeft: 16,
    paddingTop: '0px !important',
    paddingBottom: '0px !important',
    paddingLeft: '16px !important',
    paddingRight: '16px !important',
    borderRadius: '40px',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(36, 24, 47, 0.85)' : theme.palette.background.default,
    fieldset: {
        borderRadius: '40px',
        border: '1px solid transparent',
        borderColor: 'transparent !important'
    },
    '& input': {
        background: 'transparent !important',
        paddingLeft: '4px !important'
    },
    [theme.breakpoints.down('lg')]: {
        width: 250
    },
    [theme.breakpoints.down('md')]: {
        width: '100%',
        marginLeft: 4,
        background: theme.palette.mode === 'dark' ? 'rgba(36, 24, 47,0.85)' : '#fff'
    }
}));
export default OutlinedInputStyle;
