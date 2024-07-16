import {
    Box,
    Chip,
    ClickAwayListener,
    Divider,
    Grid,
    Paper,
    Popper,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';

import Transitions from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import useNotifications from 'hooks/useNotifications';
import { useToasts } from 'hooks/useToasts';
import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import NotificationList from './NotificationList';
import useAuth from 'hooks/useAuth';
import { NotificationStatus } from 'types/notifications';

const NotificationPopper = ({ open, anchorRef, handleClose }: any) => {
    const auth = useAuth();
    const theme = useTheme();
    const { notifications, reloadNotifications, updateAllStatus } = useNotifications();
    // notification status options
    const status = [
        {
            value: NotificationStatus.ALL,
            label: 'All'
        },
        {
            value: NotificationStatus.UNREAD,
            label: 'Unread'
        },
        {
            value: NotificationStatus.READ,
            label: 'Read'
        }
    ];
    const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

    const { showSuccessToast } = useToasts();
    const [value, setValue] = useState<typeof NotificationStatus | string>(NotificationStatus.ALL);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> | undefined) => {
        event?.target.value && setValue(event?.target.value);
    };
    const handleMarkAllRead = async () => {
        await updateAllStatus({ variables: { status: NotificationStatus.READ } });
        showSuccessToast(`Marked all notifications as read.`);
        await reloadNotifications();
    };

    useEffect(() => {
        if (auth.token) {
            reloadNotifications();
        }
    }, [auth.token, value]);
    return (
        <Popper
            placement={matchesXs ? 'bottom' : 'bottom-end'}
            open={open}
            anchorEl={anchorRef?.current}
            role={undefined}
            transition
            disablePortal
            sx={{ zIndex: 9998 }}
            popperOptions={{
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [matchesXs ? 5 : 0, 20]
                        }
                    }
                ]
            }}
        >
            {({ TransitionProps }) => (
                <ClickAwayListener onClickAway={handleClose}>
                    <Transitions position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
                        <Paper>
                            {open && (
                                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                                    <Grid container direction="column" spacing={2}>
                                        <Grid item xs={12}>
                                            <Grid
                                                container
                                                alignItems="center"
                                                justifyContent="space-between"
                                                spacing={0.5}
                                                sx={{ pt: 2, px: 2 }}
                                            >
                                                <Grid item>
                                                    <Stack direction="row" spacing={2}>
                                                        <Typography variant="subtitle1" sx={{ mr: 2 }}>
                                                            {status.find((k: any) => k.value === value)?.label} Notifications
                                                        </Typography>

                                                        <Chip
                                                            size="small"
                                                            label={
                                                                value === NotificationStatus.ALL
                                                                    ? notifications.length
                                                                    : filter(notifications, (k: any) => k.status === value).length
                                                            }
                                                            sx={{
                                                                color: theme.palette.background.default,
                                                                bgcolor: theme.palette.warning.dark
                                                            }}
                                                        />
                                                    </Stack>
                                                </Grid>
                                                <Grid item>
                                                    <Typography
                                                        component={Link}
                                                        to="#"
                                                        variant="subtitle2"
                                                        color="primary"
                                                        onClick={handleMarkAllRead}
                                                    >
                                                        Mark as all read
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Grid container direction="column" spacing={2}>
                                                <Grid item xs={12}>
                                                    <Box sx={{ px: 2, pt: 0.25 }}>
                                                        <TextField
                                                            id="outlined-select-currency-native"
                                                            select
                                                            fullWidth
                                                            value={value}
                                                            onChange={handleChange}
                                                            SelectProps={{
                                                                native: true
                                                            }}
                                                        >
                                                            {status.map((option) => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </TextField>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} p={0}>
                                                    <Divider sx={{ my: 0 }} />
                                                </Grid>
                                            </Grid>
                                            <NotificationList
                                                notifications={
                                                    value === NotificationStatus.ALL
                                                        ? notifications
                                                        : filter(notifications, (k: any) => k.status === value)
                                                }
                                            />
                                        </Grid>
                                    </Grid>
                                    <Divider />
                                </MainCard>
                            )}
                        </Paper>
                    </Transitions>
                </ClickAwayListener>
            )}
        </Popper>
    );
};

export default NotificationPopper;
