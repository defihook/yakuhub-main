import { FC, ReactNode, createContext, useState } from 'react';

// types
import { AuthContextType } from 'types/auth';

// context & provider
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<any>(null);
    const [signed, setSigned] = useState<any>(false);
    const [myPublic, setMyPublic] = useState<any>(null);
    const [yakuPass, setYakuPass] = useState<any>(false);
    const [user, setUser] = useState<any>({});
    const [isAttempting, setIsAttempting] = useState<any>(false);

    const attempting = (value: boolean) => {
        setIsAttempting(value);
    };

    const signin = async (jwt: string, publicKey?: string) => {
        setToken(jwt);
        if (publicKey) {
            setMyPublic(publicKey);
        }
        localStorage.setItem('yaku-lemonade', jwt);
    };

    const logout = () => {
        setToken(null);
        setMyPublic(null);
        setUser({});
    };

    const pass = () => {
        setYakuPass(true);
    };

    const sign = () => {
        setSigned(true);
    };

    const setUserData = (data: any) => {
        setUser(data);
    };

    return (
        <AuthContext.Provider
            value={{ logout, token, signin, pass, yakuPass, myPublic, sign, signed, isAttempting, attempting, user, setUserData }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
