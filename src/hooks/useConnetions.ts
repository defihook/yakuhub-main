import { useContext } from 'react';

import ConnectionsContext from '../contexts/ConnectionsContext';

const useConnections = () => {
    const context = useContext(ConnectionsContext);
    if (!context) throw new Error('context must be inside provider');
    return context;
};

export default useConnections;
