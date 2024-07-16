import { useContext } from 'react';

import StakedContext from 'contexts/StakedContext';

const useStaked = () => {
    const context = useContext(StakedContext);
    if (!context) throw new Error('context must be inside provider');
    return context;
};

export default useStaked;
