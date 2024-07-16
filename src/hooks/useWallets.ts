import { WalletsContext } from 'contexts/WalletContext';
import { useContext } from 'react';

const useWallets = () => {
    const context = useContext(WalletsContext);
    if (!context) throw new Error('context must be inside provider');
    return context;
};

export default useWallets;
