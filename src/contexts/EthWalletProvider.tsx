import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
// eslint-disable-next-line
import Web3 from 'web3';
import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils';
import useAuth from 'hooks/useAuth';

type useEthContextType = {
    ethAddress: string;
    chain: string;
    ethBalance: number;
    ethConnected: boolean;
    ethConnect: Function;
    ethSignout: Function;
    getWalletNfts: any;
    sendTransaction: any;
};

const userDefaultValue: useEthContextType = {
    ethAddress: '',
    chain: '',
    ethBalance: 0,
    ethConnected: false,
    ethConnect: () => {},
    ethSignout: () => {},
    getWalletNfts: () => {},
    sendTransaction: () => {}
};

const UseEthContext = createContext<useEthContextType>(userDefaultValue);
export const ETH_WEI = Math.pow(10, 18);

Moralis.start({
    apiKey: '6jgzUdAGie0eoxc9derlamUVLMrPwMqulo7hwizwrO14x3WV54Yx0j4xTAInawDq'
});

export default function EthWalletProvider(props: { children: ReactNode }) {
    const [userData, setUserData] = useState<useEthContextType>(userDefaultValue);
    const [connected, setConnected] = useState(false);
    const [signerAddress, setSignerAddress] = useState('');
    const [ethBal, setEthBalance] = useState(0);
    const auth = useAuth();
    const web3 = new Web3('https://mainnet.infura.io/v3/c28fffee6c304d49b717b001d24e795d');

    const connectWallet = async () => {
        try {
            console.log('Metamask connection....');
            const clone: any = (window as any).ethereum;
            if (typeof clone !== 'undefined') {
                clone.request({ method: 'eth_requestAccounts' });
            }
            console.log(clone.selectedAddress, ' ===> window.ethereum.selectedAddress');
            if (clone.selectedAddress) {
                setConnected(true);
                setSignerAddress(clone.selectedAddress);
                const balance = await web3.eth.getBalance(clone.selectedAddress);
                console.log((balance as unknown as number) / ETH_WEI, '==> ETH Balance');
                setEthBalance((balance as unknown as number) / ETH_WEI);
            }
        } catch (error) {
            console.log(error);
        }
    };

    async function sendTransaction(data: Object) {
        let result = { success: false, message: '' };

        try {
            console.log('sending data', data);
            const clone: any = (window as any).ethereum;
            clone.request({ method: 'eth_requestAccounts' });
            if (clone.selectedAddress) {
                const txHash = await (window as any).ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [data]
                });
                console.log('txhash', txHash);
                result = { success: true, message: 'Transaction confirmed.' };
            }
        } catch (error: any) {
            console.log('error', error);
            if (error.message.includes('User denied transaction')) {
                result = { success: false, message: 'User denied transaction signature.' };
            } else {
                result = { success: false, message: 'Transaction failed to confirm.' };
            }
        }

        return result;
    }

    const getWalletNfts = async (address: string) => {
        const chain = EvmChain.ETHEREUM;
        const response = await Moralis.EvmApi.nft.getWalletNFTs({
            address,
            chain
        });

        console.log(response);
        return response;
    };

    useEffect(() => {
        const clone: any = (window as any).ethereum;
        if (typeof clone !== 'undefined') {
            clone.on('accountsChanged', async (accounts: any) => {
                if (clone.selectedAddress) {
                    console.log(clone.selectedAddress, 'window.ethereum.selectedAddress');
                    setConnected(true);
                    setSignerAddress(clone.selectedAddress);
                    const balance = await web3.eth.getBalance(clone.selectedAddress);
                    console.log((balance as unknown as number) / ETH_WEI, '==> ETH Balance');
                    setEthBalance((balance as unknown as number) / ETH_WEI);
                }
            });
        }
    }, []);

    useEffect(() => {
        if (signerAddress !== '') {
            setConnected(true);
        }
    }, [signerAddress]);

    useEffect(() => {
        if (auth?.user?.ethAddress) {
            connectWallet();
        }
    }, [auth?.user?.ethAddress]);

    useEffect(() => {
        setUserData({
            ethAddress: signerAddress,
            chain: 'ETH Mainnet',
            ethBalance: ethBal,
            ethConnected: connected,
            ethConnect: connectWallet,
            ethSignout: () => {},
            getWalletNfts,
            sendTransaction
        });
    }, [signerAddress, ethBal, connected]);

    // eslint-disable-next-line react/destructuring-assignment
    return <UseEthContext.Provider value={userData}>{props.children}</UseEthContext.Provider>;
}

export function useEthcontext() {
    return useContext(UseEthContext);
}
