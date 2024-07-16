/* eslint-disable no-nested-ternary */
/* eslint-disable array-callback-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from 'react';

// material-ui
import { CircularProgress, Grid, Typography, Box, Dialog, Stack, useMediaQuery, useTheme } from '@mui/material';

// third-party
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';

// project imports
import ViewDropModal from './ViewDropModal';
import CalendarStyled from './CalendarStyled';
import Toolbar from './Toolbar';
import moment from 'moment';

// test
import EventContent from './EventContent';
import { IconPlus } from '@tabler/icons';
import { queries } from '../../../graphql/graphql';
import useAuthQuery from 'hooks/useAuthQuery';
import CreateDropModal from './CreateDropModal';
import { each, flatten } from 'lodash';
import { useSelector } from 'store';
import { drawerWidth, drawerWidthCollapsed } from 'store/constant';

// ==============================|| APPLICATION CALENDAR ||============================== //

const MintCalendar = () => {
    const calendarRef = useRef<FullCalendar>(null);
    const theme = useTheme();
    const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));
    const { drawerOpen } = useSelector((state) => state.menu);
    const { data, loading, refetch: refetchDrops } = useAuthQuery(queries.GET_DROPS);
    const [mintColors, setMintColors] = useState(null);
    const [mintNotifications, setMintNotifications] = useState(null);

    const { data: favouriteMints, refetch: refetchFavouriteMints } = useAuthQuery(queries.GET_USER_FAVOURITE_MINTS);
    const { data: userMints, refetch: refetchUserMints } = useAuthQuery(queries.GET_USER_MINTS);
    const { data: mintColorsData, refetch: refetchMintColors } = useAuthQuery(queries.GET_MINT_COLORS);
    const { data: mintNotificationsData, refetch: refetchMintNotifications } = useAuthQuery(queries.GET_MINT_NOTIFICATIONS);

    const [events, setEvents] = useState([]);
    const [eventsData, setEventsData] = useState([]);
    const [modalData, setModalData] = useState<any>({});
    const [filter, setFilter] = useState('all');
    const [showNewEventModal, setShowNewEventModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewName, setViewName] = useState<string>('dayGridMonth');

    // Toolbar Data
    const [date, setDate] = useState(new Date());

    // Modal
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleDateToday = () => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();

            calendarApi.today();
            setDate(calendarApi.getDate());
        }
    };

    const handleDatePrev = () => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();

            calendarApi.prev();
            setDate(calendarApi.getDate());
        }
    };

    const handleDateNext = () => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();

            calendarApi.next();
            setDate(calendarApi.getDate());
        }
    };

    const handleChangeView = (name: string) => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();

            calendarApi.changeView(name);
            setViewName(name);
            setDate(calendarApi.getDate());
        }
    };

    const handleNameClick = ({ event }: any) => {
        if (event?.title) {
            handleOpen();
            const filteredEventData = eventsData.filter(
                (eventToBeFiltered: any) => eventToBeFiltered.name === event.title || eventToBeFiltered.title === event.title
            );
            setModalData(filteredEventData[0]);
        }
    };

    const processEvents = async () => {
        const drops: any = data.getDrops;
        const { data: favMintsData }: any = await refetchFavouriteMints();
        const temp_favMints: any = favMintsData?.getFavouriteMintsByUserId?.map((k: any) => k.title) || [];

        const eventHolder: any = [];
        const eventDataHolder: any = [];

        each(flatten(Object.values(drops)), (object: any) => {
            if (!object) {
                return true;
            }
            const isAllDay = !object.time.includes('UTC');
            const datetime = object.time.includes('UTC')
                ? moment(`${object.date} ${object.time.replace(' UTC', '')}`)
                      .utc()
                      .format('YYYY-MM-DD HH:mm:ss')
                : object.date;

            if (filter === 'all' || (filter === 'nft' && temp_favMints.includes(object.name))) {
                eventDataHolder.push(object);
                eventHolder.push({ title: object.name, date: datetime, allDay: isAllDay });
            }
            return true;
        });

        const { data: userMintsData } = await refetchUserMints();
        const temp_userMints: any = userMintsData?.getUserMintsByUserId || [];
        each(temp_userMints, (k: any) => {
            if ((filter === 'nft' && temp_favMints.includes(k.title)) || filter === 'all') {
                eventDataHolder.push(k);
                eventHolder.push({ title: k.title, date: moment(k.date).format('YYYY-MM-DD HH:mm:ss'), allDay: false });
            }
        });

        return { eventHolder, eventDataHolder };
    };

    const handleReloadType = async (type: string) => {
        switch (type) {
            case 'fav': {
                const { eventDataHolder, eventHolder } = await processEvents();
                setEvents(eventHolder);
                setEventsData(eventDataHolder);
                break;
            }

            case 'color': {
                const { data: newMintColorsData }: any = await refetchMintColors();
                setMintColors(newMintColorsData);
                break;
            }
            case 'noti': {
                const { data: newNotiData }: any = await refetchMintNotifications();
                setMintNotifications(newNotiData);
                break;
            }
        }
    };

    useEffect(() => {
        if (mintNotificationsData) {
            setMintNotifications(mintNotificationsData);
        }
    }, [mintNotificationsData]);

    useEffect(() => {
        if (mintColorsData) {
            setMintColors(mintColorsData);
        }
    }, [mintColorsData]);

    useEffect(() => {
        if (data && data.getDrops) {
            reloadEvents();
        }
    }, [data, loading, filter]);

    useEffect(() => {
        if (data && data.getDrops) {
            reloadEvents();
        }
    }, []);

    const reloadEvents = async () => {
        if (!loading) {
            const { eventDataHolder, eventHolder } = await processEvents();

            setEvents(eventHolder);
            setEventsData(eventDataHolder);

            const { data: newMintColorsData }: any = await refetchMintColors();
            setMintColors(newMintColorsData);
            const { data: newNotiData }: any = await refetchMintNotifications();
            setMintNotifications(newNotiData);

            setEvents(eventHolder);
            setEventsData(eventDataHolder);
        }
    };

    const renderEventContent = (eventInfo: any): any => {
        const filteredEventData = eventsData.find(
            (eventToBeFiltered: any) =>
                eventToBeFiltered.name === eventInfo.event.title || eventToBeFiltered.title === eventInfo.event.title
        );

        return (
            <EventContent
                eventInfo={eventInfo}
                eventData={filteredEventData}
                handleNameClick={handleNameClick}
                favouriteMints={favouriteMints}
                mintColors={mintColors}
                mintNotifications={mintNotifications}
                viewName={viewName}
                reload={handleReloadType}
            />
        );
    };

    const handleEdit = () => {
        setModalData({ ...modalData });
        handleClose();
        setShowNewEventModal(true);
    };

    if (!loading) {
        return (
            <Box sx={{ position: 'relative', paddingBottom: 10, width: '100%' }}>
                <CalendarStyled>
                    <Toolbar
                        date={date}
                        onClickNext={handleDateNext}
                        onClickPrev={handleDatePrev}
                        onClickToday={handleDateToday}
                        onClickChangeView={handleChangeView}
                        onClickChangeFilter={(v: string) => {
                            if (v !== null) {
                                setFilter(v);
                            }
                        }}
                        onClickRefresh={async () => {
                            await refetchDrops();
                            await reloadEvents();
                        }}
                        filter={filter}
                    />
                    <Box
                        sx={{
                            width: matchUpMd
                                ? `calc(100vw - ${drawerOpen ? drawerWidth : drawerWidthCollapsed}px - 60px)`
                                : 'calc(100vw - 50px)'
                        }}
                    >
                        <FullCalendar
                            weekends
                            // editable
                            ref={calendarRef}
                            rerenderDelay={10}
                            initialDate={date}
                            dayMaxEventRows={2}
                            eventDisplay="block"
                            events={events}
                            headerToolbar={false}
                            contentHeight="auto"
                            height="auto"
                            handleWindowResize
                            displayEventTime
                            displayEventEnd
                            eventTimeFormat={{
                                hour: 'numeric',
                                minute: '2-digit',
                                meridiem: 'short'
                            }}
                            plugins={[listPlugin, dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
                            eventContent={renderEventContent}
                            eventAllow={(dropInfo: any, draggedEvent: any): boolean =>
                                moment(dropInfo?.start).isSame(moment(draggedEvent?.start), 'day')
                            }
                            dayCellContent={(obj) => (
                                <>
                                    <Typography variant="h6">{obj.dayNumberText}</Typography>
                                    {matchUpMd && <IconPlus size={10} />}
                                    <Typography
                                        noWrap
                                        variant="caption"
                                        onClick={() => {
                                            setModalData(null);
                                            setSelectedDate(obj.date);
                                            setShowNewEventModal(true);
                                        }}
                                        style={{ cursor: 'pointer', marginLeft: 2 }}
                                    >
                                        {matchUpMd ? 'Create event' : <IconPlus size={10} />}
                                    </Typography>
                                </>
                            )}
                        />
                    </Box>
                </CalendarStyled>
                <Dialog maxWidth="sm" fullWidth onClose={handleClose} open={open} sx={{ '& .MuiDialog-paper': { p: 0 } }}>
                    {open && <ViewDropModal drop={modalData} onCancel={handleClose} reload={reloadEvents} edit={handleEdit} />}
                </Dialog>
                <Dialog
                    maxWidth="sm"
                    fullWidth
                    onClose={() => setShowNewEventModal(false)}
                    open={showNewEventModal}
                    sx={{ '& .MuiDialog-paper': { p: 0 } }}
                >
                    {showNewEventModal && selectedDate && (
                        <CreateDropModal
                            drop={modalData}
                            onCancel={() => setShowNewEventModal(false)}
                            reload={reloadEvents}
                            selectedDate={selectedDate}
                        />
                    )}
                </Dialog>
            </Box>
        );
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} alignItems="center">
                <Stack display="flex" flexDirection="row" justifyContent="center" sx={{ my: 10 }}>
                    <CircularProgress color="secondary" />
                </Stack>
            </Grid>
        </Grid>
    );
};

export default MintCalendar;
