/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, ReactNode, useState, createContext, useContext } from 'react';

import BundleSection from 'components/BundleSection';

interface BundleWalletContextType {
    showBundleView: Boolean;
    setShowBundleView: React.Dispatch<React.SetStateAction<boolean>>;
}

const BundleWalletContext = createContext<BundleWalletContextType | null>(null);

export const BundleWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [showBundleView, setShowBundleView] = useState(false);
    return (
        <BundleWalletContext.Provider value={{ showBundleView, setShowBundleView }}>
            {children}
            <BundleSection open={showBundleView} onClose={() => setShowBundleView(false)} />
        </BundleWalletContext.Provider>
    );
};

export const useBundleView = () => {
    const context = useContext(BundleWalletContext);
    return context as BundleWalletContextType;
};
