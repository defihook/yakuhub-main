/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';

// material-ui
import { Grid, Typography, Stack, IconButton, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// assets
import { IconStar, IconPalette, IconBell } from '@tabler/icons';
import { useToasts } from 'hooks/useToasts';
import useAuthMutation from 'hooks/useAuthMutation';
import { mutations } from '../../../graphql/graphql';

const EventContent = ({ eventInfo, eventData, handleNameClick, favouriteMints, mintColors, mintNotifications, viewName, reload }: any) => {
    const theme = useTheme();
    const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
    const { showSuccessToast } = useToasts();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isNotificationsOn, setIsNotificationsOn] = useState(false);
    const [isColored, setIsColored] = useState(false);
    const DEFAULT_MINT_COLOR = '#f38affcc';
    const DEFAULT_IMAGE_URL = `https://ik.imagekit.io/g1noocuou2/Yakushima_Studios/tr:w-30/Logo4K.png?ik-sdk-version=javascript-1.4.3&updatedAt=1657556475258`;

    const [CreateFavouriteMint] = useAuthMutation(mutations.CREATE_FAVOURITE_MINT);
    const [RemoveFavouriteMint] = useAuthMutation(mutations.REMOVE_FAVOURITE_MINT);
    const [CreateMintColor] = useAuthMutation(mutations.CREATE_MINT_COLOR);
    const [RemoveMintColor] = useAuthMutation(mutations.REMOVE_MINT_COLOR);
    const [CreateMintNotification] = useAuthMutation(mutations.CREATE_MINT_NOTIFICATION);
    const [RemoveMintNotification] = useAuthMutation(mutations.REMOVE_MINT_NOTIFICATION);

    useEffect(() => {
        const temp = favouriteMints?.getFavouriteMintsByUserId?.map((k: any) => k.title) || [];
        const temp_isFavorite = temp.includes(eventInfo.event.title);
        setIsFavorite(temp_isFavorite);

        const tn = mintNotifications?.getMintNotificationsByUserId?.map((k: any) => k.title) || [];
        const temp_isNotificationsOn = tn.includes(eventInfo.event.title);
        setIsNotificationsOn(temp_isNotificationsOn);

        const tc = mintColors?.getMintColorsByUserId?.map((k: any) => k.title) || [];
        const tc_isColored = tc.includes(eventInfo.event.title);
        setIsColored(tc_isColored);
    }, []);

    useEffect(() => {
        if (viewName === 'dayGridMonth') {
            document.querySelectorAll('.fc-event-main').forEach((k: any) => {
                if (k.querySelector('h6').innerText === eventInfo.event.title) {
                    k.parentNode.style.backgroundColor = isColored ? DEFAULT_MINT_COLOR : '#3D1456';
                }
            });
        } else if (viewName === 'listWeek') {
            document.querySelectorAll('.fc-list-event').forEach((k: any) => {
                if (k.querySelector('h6').innerText === eventInfo.event.title) {
                    k.style.backgroundColor = isColored ? DEFAULT_MINT_COLOR : ' #3D1456';
                }
            });
        }
    }, [viewName, isColored]);

    const handleFavoriteClick = () => {
        const newVal = !isFavorite;
        setIsFavorite(newVal);
        if (newVal) {
            CreateFavouriteMint({
                variables: { title: eventInfo.event.title }
            }).then(() => {
                showSuccessToast(`Event "${eventInfo.event.title}" is added in your favorite mints.`);
            });
        } else {
            RemoveFavouriteMint({
                variables: { title: eventInfo.event.title }
            }).then(() => {
                showSuccessToast(`Event "${eventInfo.event.title}" is removed from your favorite mints.`);
            });
        }
        reload('fav');
    };

    const handleNotificationsClick = () => {
        const newVal = !isNotificationsOn;
        setIsNotificationsOn(newVal);
        if (newVal) {
            CreateMintNotification({
                variables: { title: eventInfo.event.title, date: eventData.date }
            }).then(() => {
                showSuccessToast(`You've turned ON notifications for the "${eventInfo.event.title}" event.`);
            });
        } else {
            RemoveMintNotification({
                variables: { title: eventInfo.event.title }
            }).then(() => {
                showSuccessToast(`You've turned OFF notifications for the "${eventInfo.event.title}" event.`);
            });
        }
        reload('noti');
    };

    const handleChangeColor = () => {
        const newVal = !isColored;
        setIsColored(newVal);
        if (newVal) {
            CreateMintColor({
                variables: { title: eventInfo.event.title, color: DEFAULT_MINT_COLOR }
            }).then(() => {
                showSuccessToast(`Mint color saved.`);
            });
        } else {
            RemoveMintColor({
                variables: { title: eventInfo.event.title }
            }).then(() => {
                showSuccessToast(`Mint color removed.`);
            });
        }
        reload('color');
    };

    return (
        <>
            {viewName === 'dayGridMonth' && (
                <>
                    {!matchDownMd ? (
                        <Grid container spacing={-1} sx={{ alignItems: 'center' }}>
                            <Grid item xs={3} onClick={(e) => handleNameClick(eventInfo)}>
                                <img
                                    src={eventData?.image || eventData?.logo || DEFAULT_IMAGE_URL}
                                    style={{
                                        width: 30,
                                        maxWidth: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '50%',
                                        aspectRatio: '1 / 1',
                                        marginTop: 3
                                    }}
                                    alt={eventInfo.event.title}
                                />
                            </Grid>
                            <Grid item xs={9}>
                                <Stack direction="column" spacing={-1}>
                                    <Stack
                                        direction="row"
                                        spacing={-1}
                                        onClick={(e) => handleNameClick(eventInfo)}
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <Typography
                                            noWrap
                                            variant="h6"
                                            style={{ color: theme.palette.primary.light, paddingBottom: '5px', paddingLeft: '2px' }}
                                        >
                                            {eventInfo.event.title}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="center" alignItems="center">
                                        <IconButton onClick={handleFavoriteClick} size="small">
                                            <IconStar
                                                color="none"
                                                fill={isFavorite ? theme.palette.warning.main : theme.palette.secondary.light}
                                                size={16}
                                            />
                                        </IconButton>
                                        <IconButton onClick={handleNotificationsClick} size="small">
                                            <IconBell
                                                color="none"
                                                fill={isNotificationsOn ? theme.palette.warning.main : theme.palette.secondary.light}
                                                size={16}
                                            />
                                        </IconButton>
                                        <IconButton onClick={handleChangeColor} size="small">
                                            <IconPalette
                                                color="none"
                                                fill={isColored ? theme.palette.warning.main : theme.palette.secondary.light}
                                                size={16}
                                            />
                                        </IconButton>
                                    </Stack>
                                </Stack>
                            </Grid>
                        </Grid>
                    ) : (
                        <>
                            <img
                                src={eventData?.image || eventData?.logo || DEFAULT_IMAGE_URL}
                                style={{
                                    marginRight: 10,
                                    height: 24,
                                    width: 24,
                                    objectFit: 'cover',
                                    borderRadius: '50%',
                                    marginTop: 3
                                }}
                                alt={eventInfo.event.title}
                            />
                            <Typography noWrap variant="h6" style={{ color: theme.palette.primary.light }}>
                                {eventInfo.event.title}
                            </Typography>
                        </>
                    )}
                </>
            )}

            {viewName === 'listWeek' && (
                <Grid container spacing={1} alignItems="center" justifyContent="space-between">
                    <Grid item xs={12} md={8} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Stack onClick={() => handleNameClick(eventInfo)}>
                            <img
                                src={eventData?.image || eventData?.logo || DEFAULT_IMAGE_URL}
                                style={{ marginRight: 10, height: 30, width: 30, objectFit: 'cover', borderRadius: '50%', marginTop: 3 }}
                                alt={eventInfo.event.title}
                            />
                        </Stack>
                        <Typography
                            noWrap
                            variant="h6"
                            onClick={(e) => handleNameClick(eventInfo)}
                            style={{ color: theme.palette.primary.light }}
                        >
                            {eventInfo.event.title}
                        </Typography>
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={4}
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}
                    >
                        <IconButton onClick={handleFavoriteClick} size="small">
                            <IconStar color="none" fill={isFavorite ? 'orange' : theme.palette.primary.light} size={16} />
                        </IconButton>
                        <IconButton onClick={handleNotificationsClick} size="small">
                            <IconBell color="none" fill={isNotificationsOn ? 'orange' : theme.palette.primary.light} size={16} />
                        </IconButton>
                        <IconButton onClick={handleChangeColor} size="small">
                            <IconPalette color="none" fill={isColored ? 'orange' : theme.palette.primary.light} size={16} />
                        </IconButton>
                    </Grid>
                </Grid>
            )}
        </>
    );
};

export default EventContent;
