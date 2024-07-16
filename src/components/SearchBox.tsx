import { Avatar, Box, InputAdornment, useTheme, OutlinedInput, styled } from '@mui/material';
import { IconSearch, IconX } from '@tabler/icons';
import { bindToggle } from 'material-ui-popup-state';
import { shouldForwardProp } from '@mui/system';

const OutlinedInputStyle = styled(OutlinedInput, { shouldForwardProp })(({ theme }) => ({
    width: 434,
    height: 46,
    marginLeft: 0,
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
const SearchBox = ({ params = {}, value, popupState, placeholder, sx = { marginLeft: '16px' } }: any) => {
    const theme = useTheme();
    return (
        <OutlinedInputStyle
            {...params}
            sx={sx}
            id="input-search-header"
            value={value}
            placeholder={placeholder}
            startAdornment={
                <InputAdornment position="start">
                    <IconSearch stroke={1.5} size="1rem" color={theme.palette.grey[500]} />
                </InputAdornment>
            }
            endAdornment={
                popupState && (
                    <InputAdornment position="end">
                        <Box sx={{ ml: 2 }}>
                            <Avatar
                                variant="rounded"
                                sx={{
                                    ...theme.typography.commonAvatar,
                                    ...theme.typography.mediumAvatar,
                                    background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.orange.light,
                                    color: theme.palette.orange.dark,
                                    '&:hover': {
                                        background: theme.palette.orange.dark,
                                        color: theme.palette.orange.light
                                    }
                                }}
                                {...(popupState ? bindToggle(popupState) : {})}
                            >
                                <IconX stroke={1.5} size="1.3rem" />
                            </Avatar>
                        </Box>
                    </InputAdornment>
                )
            }
            aria-describedby="search-helper-text"
            inputProps={{ ...params.inputProps, 'aria-label': 'weight' }}
        />
    );
};

export default SearchBox;
