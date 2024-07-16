import { FC, ReactNode, useState, createContext, useContext } from 'react';

interface CartContextType {
    cartItems: any;
    setCartItems: React.Dispatch<React.SetStateAction<any>>;
    isOpen: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    temp: boolean;
    setTemp: React.Dispatch<React.SetStateAction<boolean>>;
    sweepValue: any;
    setSweepValue: React.Dispatch<React.SetStateAction<any>>;
    sweepCount: number;
    setSweepCount: React.Dispatch<React.SetStateAction<number>>;
    multiTabIdx: string;
    setMultiTabIdx: React.Dispatch<React.SetStateAction<string>>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isOpen, setOpen] = useState(false);
    const [sweepValue, setSweepValue] = useState(0);
    const [sweepCount, setSweepCount] = useState(0);
    const [multiTabIdx, setMultiTabIdx] = useState('buy');
    // After calling setCartItems(), should call the setTemp(!temp)
    // to update the cart items immediately
    // It's because useContext, we will need to update it later in a better way
    const [temp, setTemp] = useState(false);
    return (
        <CartContext.Provider
            value={{
                cartItems,
                setCartItems,
                isOpen,
                setOpen,
                temp,
                setTemp,
                sweepCount,
                setSweepCount,
                sweepValue,
                setSweepValue,
                multiTabIdx,
                setMultiTabIdx
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCartItems = () => {
    const context = useContext(CartContext);
    return context as CartContextType;
};
