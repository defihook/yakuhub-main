import { useContext } from 'react';
import NotificationsContext from '../contexts/NotificationsContext';

const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (!context) throw new Error('context must be inside provider');
    return context;
};

export default useNotifications;
