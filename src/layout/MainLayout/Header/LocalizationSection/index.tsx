import { useEffect, useRef, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Avatar,
    Box,
    ClickAwayListener,
    Grid,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    Popper,
    Typography,
    useMediaQuery,
    Tooltip
} from '@mui/material';

// project imports
import Transitions from 'components/@extended/Transitions';

// assets
import useConfig from 'hooks/useConfig';
import { map } from 'lodash';
import { LOCALES } from 'config';
import { IconChevronDown, IconChevronUp } from '@tabler/icons';

// ==============================|| LOCALIZATION ||============================== //

const LocalizationSection = () => {
    const { borderRadius, locale, onChangeLocale } = useConfig();

    const theme = useTheme();
    const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

    const [open, setOpen] = useState(false);
    const anchorRef = useRef<any>(null);
    const [language, setLanguage] = useState<string>(locale);

    const handleListItemClick = (
        event: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLDivElement, MouseEvent> | undefined,
        lng: string
    ) => {
        setLanguage(lng);
        onChangeLocale(lng);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: MouseEvent | TouchEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    const prevOpen = useRef(open);
    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef?.current?.focus();
        }
        prevOpen.current = open;
    }, [open]);

    useEffect(() => {
        setLanguage(locale);
    }, [locale]);

    return (
        <>
            <Box
                sx={{
                    ml: 2,
                    [theme.breakpoints.down('md')]: {
                        ml: 1
                    }
                }}
            >
                <Tooltip title="Language Settings">
                    <Typography
                        variant="h5"
                        fontSize={10}
                        color="inherit"
                        ref={anchorRef}
                        aria-controls={open ? 'menu-list-grow' : undefined}
                        aria-haspopup="true"
                        onClick={handleToggle}
                        sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}
                    >
                        {LOCALES.find(({ value }) => value === language)?.label}
                        {open ? <IconChevronUp style={{ height: 16 }} /> : <IconChevronDown style={{ height: 16 }} />}
                    </Typography>
                </Tooltip>
            </Box>

            <Popper
                placement={matchesXs ? 'bottom-start' : 'bottom'}
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                sx={{
                    zIndex: 200
                }}
                popperOptions={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 4]
                            }
                        }
                    ]
                }}
            >
                {({ TransitionProps }) => (
                    <ClickAwayListener onClickAway={handleClose}>
                        <Transitions position={matchesXs ? 'top-left' : 'top'} in={open} {...TransitionProps}>
                            <Paper elevation={16}>
                                {open && (
                                    <List
                                        component="nav"
                                        sx={{
                                            py: 0,
                                            width: '100%',
                                            minWidth: 200,
                                            maxWidth: 280,
                                            bgcolor: theme.palette.background.paper,
                                            borderRadius: `${borderRadius}px`,
                                            [theme.breakpoints.down('md')]: {
                                                maxWidth: 250
                                            }
                                        }}
                                    >
                                        {map(LOCALES, ({ value, label, desc }) => (
                                            <ListItemButton
                                                selected={language === value}
                                                onClick={(event) => handleListItemClick(event, value)}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Grid container>
                                                            <Typography color="textPrimary">{label}</Typography>
                                                            <Typography variant="caption" color="textSecondary" sx={{ ml: '8px' }}>
                                                                ({desc})
                                                            </Typography>
                                                        </Grid>
                                                    }
                                                />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                )}
                            </Paper>
                        </Transitions>
                    </ClickAwayListener>
                )}
            </Popper>
        </>
    );
};

export default LocalizationSection;
