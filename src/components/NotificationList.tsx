// material-ui
import { useTheme, styled } from '@mui/material/styles';
import { Avatar, Chip, Grid, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

// assets
import { IconPlanet, IconTrendingUp } from '@tabler/icons';
import moment from 'moment';
import { map } from 'lodash';
import { useToasts } from 'hooks/useToasts';
import useNotifications from 'hooks/useNotifications';

// styles
const ListItemWrapper = styled('div')(({ theme }) => ({
    cursor: 'pointer',
    padding: 16,
    '&:hover': {
        background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.primary.light
    },
    '& .MuiListItem-root': {
        padding: 0
    }
}));

const NotificationItem = ({ id, icon, theme, title, date, description, status, chipErrorSX, action }: any) => {
    const { showSuccessToast } = useToasts();
    const { updateStatus, deleteNotification, reloadNotifications } = useNotifications();

    const handleStatusUpdate = (newStatus: string) => {
        updateStatus({
            variables: { id, status: newStatus }
        }).then(() => {
            showSuccessToast(`Notification status updated.`);
            reloadNotifications();
        });
    };

    const handleDelete = () => {
        deleteNotification({
            variables: { id }
        }).then(() => {
            showSuccessToast(`Notification deleted successfully.`);
            reloadNotifications();
        });
    };

    return (
        <ListItemWrapper>
            <ListItem alignItems="center">
                <ListItemAvatar>
                    <Avatar
                        sx={{
                            color: theme.palette.secondary.dark,
                            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.primary.light,
                            border: theme.palette.mode === 'dark' ? '1px solid' : 'none',
                            borderColor: theme.palette.secondary.dark
                        }}
                    >
                        {icon === 'planet' && <IconPlanet stroke={1.5} size="1.3rem" />}
                        {icon === 'trendup' && <IconTrendingUp stroke={1.5} size="1.3rem" />}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={<Typography variant="subtitle1">{title}</Typography>}
                    secondary={<Typography variant="caption">{moment(date).fromNow()}</Typography>}
                />
            </ListItem>
            <Grid container direction="column" className="list-container">
                <Grid item xs={12} sx={{ pb: 2 }}>
                    <Typography variant="subtitle2">{description}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Grid container>
                        <Grid item>
                            {status === 'read' && <Chip label="Unread" sx={chipErrorSX} onClick={() => handleStatusUpdate('unread')} />}
                            {status === 'unread' && <Chip label="Read" sx={chipErrorSX} onClick={() => handleStatusUpdate('read')} />}
                            <Chip label="Delete" sx={chipErrorSX} onClick={handleDelete} />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </ListItemWrapper>
    );
};

// ==============================|| NOTIFICATION LIST ITEM ||============================== //

const NotificationList = ({ notifications }: any) => {
    const theme = useTheme();

    const chipSX = {
        height: 24,
        padding: '0 6px'
    };

    const chipErrorSX = {
        ...chipSX,
        color: theme.palette.orange.dark,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.orange.light,
        marginRight: '5px'
    };

    return (
        <List
            sx={{
                width: '100%',
                maxWidth: 330,
                maxHeight: 350,
                py: 0,
                borderRadius: '10px',
                overflowY: 'auto',
                [theme.breakpoints.down('md')]: {
                    maxWidth: 300
                },
                '& .MuiListItemSecondaryAction-root': {
                    top: 22
                },
                '& .MuiDivider-root': {
                    my: 0
                },
                '& .list-container': {
                    pl: 7
                }
            }}
        >
            {notifications.length > 0 ? (
                map(notifications, (notification) => (
                    <NotificationItem key={notification.id} {...notification} chipErrorSX={chipErrorSX} theme={theme} />
                ))
            ) : (
                <Typography variant="subtitle1" sx={{ m: 2, textAlign: 'center' }}>
                    You do not have any notifications.
                </Typography>
            )}
        </List>
    );
};

export default NotificationList;
