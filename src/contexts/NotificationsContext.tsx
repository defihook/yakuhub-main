import NotificationPopper from 'components/NotificationPopper';
import { mutations, queries } from '../graphql/graphql';
import useAuth from 'hooks/useAuth';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import useAuthMutation from 'hooks/useAuthMutation';
import { FC, ReactNode, createContext, useState, useRef, useEffect, MouseEvent, TouchEvent } from 'react';

// types
import { NotificationsContextType, NotificationStatus } from 'types/notifications';
import moment from 'moment';
import { filter } from 'lodash';

// context & provider
const NotificationsContext = createContext<NotificationsContextType | null>(null);

export const NOTIFICATION_POOL_INTERVAL = 1000 * 60; // 60 sec

export const NotificationsProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const auth = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [getNotifications] = useAuthLazyQuery(queries.GET_NOTIFICATIONS, {
        fetchPolicy: 'network-only'
    });
    const [updateAllStatus] = useAuthMutation(mutations.UPDATE_ALL_NOTIFICATIONS_STATUS);
    const [create] = useAuthMutation(mutations.CREATE_NOTIFICATION);

    const [updateStatus] = useAuthMutation(mutations.UPDATE_NOTIFICATION_STATUS);
    const [deleteNotification] = useAuthMutation(mutations.DELETE_NOTIFICATION);

    const [open, setOpen] = useState(false);
    const anchorRef = useRef<any>(null);
    const prevOpen = useRef(open);

    const handleToggle = () => {
        setOpen((prev) => !prev);
    };
    const handleClose = (event: MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };
    const reloadNotifications = async () => {
        const { data } = await getNotifications();
        const unread = filter(data?.getNotificationsByUserId ?? [], (k: any) => k.status === NotificationStatus.UNREAD).length;
        setNotifications(data?.getNotificationsByUserId ?? []);
        setUnreadCount(unread);
    };

    const createNotification = async ({ title, description, icon }: any) => {
        const result = await create({
            variables: {
                title,
                description,
                status: NotificationStatus.UNREAD,
                date: moment().toISOString(),
                icon
            }
        });
        return result?.data?.createNotification || false;
    };
    useEffect(() => {
        if (auth.token) {
            reloadNotifications();
        }
    }, [auth.token]);
    useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef?.current?.focus();
        }
        prevOpen.current = open;
    }, [open]);
    useEffect(() => {
        let timerId = 0;
        const queryNotifications = async () => {
            if (auth.token) {
                await reloadNotifications();
                startTimer();
            }
        };

        const startTimer = () => {
            timerId = window.setTimeout(() => {
                queryNotifications();
            }, NOTIFICATION_POOL_INTERVAL);
        };

        queryNotifications();
        return () => {
            clearTimeout(timerId);
        };
    }, [auth.token]);
    return (
        <NotificationsContext.Provider
            value={{
                anchorRef,
                open,
                notifications,
                unreadCount,
                handleToggle,
                handleClose,
                createNotification,
                reloadNotifications,
                updateAllStatus,
                updateStatus,
                deleteNotification
            }}
        >
            {children}
            <NotificationPopper open={open} handleClose={handleClose} anchorRef={anchorRef} />
        </NotificationsContext.Provider>
    );
};

export default NotificationsContext;
