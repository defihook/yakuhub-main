/* eslint-disable import/prefer-default-export */
import { useEffect, useMemo, SVGProps } from 'react';
import _ from 'lodash';
import type { FC } from 'react';
import { useTheme } from '@mui/material/styles';
import { useWallet, WalletContextState } from '@solana/wallet-adapter-react';
// eslint-disable-next-line
import {
    Config,
    Backend,
    DialectContextProvider,
    DialectThemeProvider,
    DialectUiManagementProvider,
    DialectWalletAdapter,
    defaultVariables
} from '@dialectlabs/react-ui';
// eslint-disable-next-line
import { DialectDappsIdentityResolver } from '@dialectlabs/identity-dialect-dapps';
import { CardinalTwitterIdentityResolver } from '@dialectlabs/identity-cardinal';
import { SNSIdentityResolver } from '@dialectlabs/identity-sns';
import useConnections from 'hooks/useConnetions';
import { IconSettings, IconArrowBackUp, IconChevronDown, IconPencil } from '@tabler/icons';

import useAuth from 'hooks/useAuth';
import YakuTwitterDialectResolver from './utils/YakuTwitterDialectResolver';
import $ from 'jquery';

import './styles/dialect.css';
// eslint-disable-next-line import/no-unresolved
import '@dialectlabs/react-ui/index.css';

const convertWalletForDialect = (
    wallet: WalletContextState,
    signMessage: (message: Uint8Array) => Promise<Uint8Array>
): DialectWalletAdapter => ({
    publicKey: wallet.publicKey!,
    connected: wallet.connected && !wallet.connecting && !wallet.disconnecting && Boolean(wallet.publicKey),
    signMessage,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line no-underscore-dangle
    diffieHellman: wallet.wallet?.adapter?._wallet?.diffieHellman
        ? async (pubKey) =>
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              // eslint-disable-next-line no-underscore-dangle
              wallet.wallet?.adapter?._wallet?.diffieHellman(pubKey)
        : undefined
});

const ArrowVerticalSvgComponent = (props: SVGProps<SVGSVGElement>) => <IconChevronDown {...props} />;
const ArrowBackSvgComponent = (props: SVGProps<SVGSVGElement>) => <IconArrowBackUp {...props} />;
const ComposeSvgComponent = (props: SVGProps<SVGSVGElement>) => <IconPencil {...props} />;
const SettingsSvgComponent = (props: SVGProps<SVGSVGElement>) => <IconSettings {...props} />;

const createThemeOverrides = () => {
    let outlinedInput = _.replace(defaultVariables.dark.outlinedInput, 'focus-within:dt-bg-black', '');
    outlinedInput = _.replace(outlinedInput, 'focus-within:dt-border-white', '');
    const outlinedInputLight = _.replace(outlinedInput, 'dt-text-white', '');

    const avatarDark = _.replace(defaultVariables.dark.avatar, 'dt-bg-neutral-900', 'dt-bg-[#F38AFF]');
    const messageDark = _.replace(defaultVariables.dark.message, 'dt-border-neutral-800', 'dt-border-neutral-500');
    let textAreaDark = _.replace(defaultVariables.dark.textArea, 'dt-bg-black', 'dt-bg-[#24182F]');
    textAreaDark = _.replace(textAreaDark, 'dt-placeholder-neutral-600', '');
    return {
        dark: {
            colors: {
                bg: 'dt-bg-[#24182F]',
                toggleBackgroundActive: 'dt-bg-[#F38AFF]'
            },
            icons: {
                arrowvertical: ArrowVerticalSvgComponent,
                back: ArrowBackSvgComponent,
                compose: ComposeSvgComponent,
                settings: SettingsSvgComponent
            },
            avatar: avatarDark,
            message: messageDark,
            outlinedInput,
            otherMessage: 'dt-bg-subtle-night',
            textArea: textAreaDark
        },
        light: {
            colors: {
                toggleBackgroundActive: 'dt-bg-[#F38AFF]'
            },
            icons: {
                arrowvertical: ArrowVerticalSvgComponent,
                back: ArrowBackSvgComponent,
                compose: ComposeSvgComponent,
                settings: SettingsSvgComponent
            },
            header: 'dt-max-h-[3.5rem] dt-min-h-[3.5rem] dt-px-4',
            outlinedInput: outlinedInputLight
        }
    };
};

const DialectProvider: FC = ({ children }) => {
    const auth = useAuth();
    const { connection } = useConnections();
    const theme = useTheme();
    const wallet = useWallet();

    const signMessage = async (message: Uint8Array) => wallet.signMessage!(message);
    const dialectWallet = useMemo(() => convertWalletForDialect(wallet, signMessage), [wallet]);

    const dialectConfig = useMemo(
        (): any => ({
            backends: [Backend.DialectCloud, Backend.Solana],
            environment: 'production',
            dialectCloud: {
                tokenStore: 'local-storage'
            },
            solana: {
                rpcUrl: connection.rpcEndpoint
            },
            identity: {
                resolvers: [
                    new DialectDappsIdentityResolver(),
                    new SNSIdentityResolver(connection),
                    new CardinalTwitterIdentityResolver(connection),
                    new YakuTwitterDialectResolver(auth.token)
                ]
            }
        }),
        [connection, auth.token]
    );

    useEffect(() => {
        const intervalId = setInterval(
            () =>
                $('input[placeholder="D1AL...DY5h, @saydialect or dialect.sol"]').attr(
                    'placeholder',
                    'D1AL...DY5h, @saydialect or dialect.sol'
                ),
            500
        );
        return () => clearInterval(intervalId);
    }, []);

    return (
        <DialectContextProvider config={dialectConfig} wallet={dialectWallet}>
            <DialectThemeProvider theme={theme.palette.mode} variables={createThemeOverrides()}>
                <DialectUiManagementProvider>{children}</DialectUiManagementProvider>
            </DialectThemeProvider>
        </DialectContextProvider>
    );
};

export { DialectProvider };
