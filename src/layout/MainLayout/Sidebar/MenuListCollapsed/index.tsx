/* eslint-disable no-nested-ternary */
import { memo } from 'react';

// project imports
import { NavItemTypeObject } from 'types';
import menuItem from 'menu-items';
import NavItem from './NavItem';
import { Avatar, useTheme } from '@mui/material';
import useAuth from 'hooks/useAuth';
import { DEFAULT_IMAGE_URL, IMAGE_PROXY } from 'config/config';
import { isEmpty } from 'lodash';
import { useWallet } from '@solana/wallet-adapter-react';

// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuListCollapsed = () => {
    const showAvatar = true;
    const theme = useTheme();
    const auth = useAuth();
    const wallet = useWallet();
    const allItems: NavItemTypeObject[] = [];
    menuItem.items.forEach((item: NavItemTypeObject) => {
        if (item && item.showInCollapsed) {
            allItems.push(item);
        }
    });

    const getAvatar = (proxy = IMAGE_PROXY) => {
        if (auth.user?.avatar) {
            return `${proxy}${auth.user?.avatar}`;
        }
        if (auth.user?.discord?.avatar) {
            return `${proxy}https://cdn.discordapp.com/avatars/${auth.user?.discord?.id}/${auth.user?.discord?.avatar}.png`;
        }
        return `${proxy}${DEFAULT_IMAGE_URL}`;
    };

    return (
        <>
            {showAvatar && !isEmpty(auth.user) && wallet.connected && (
                <Avatar
                    src={getAvatar()}
                    sx={{
                        ...theme.typography.largeAvatar,
                        width: 24,
                        height: 24,
                        margin: '10px auto 10px auto !important',
                        cursor: 'pointer',
                        backgroundColor: 'transparent'
                    }}
                />
            )}
            {allItems.map((menu, idx) => (
                <NavItem key={idx} item={menu} level={0} />
            ))}
        </>
    );
};

export default memo(MenuListCollapsed);
