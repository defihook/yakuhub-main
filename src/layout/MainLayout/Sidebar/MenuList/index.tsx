import { memo, useState } from 'react';

// material-ui
import { Typography } from '@mui/material';

// project imports
import NavGroup from './NavGroup';
import menuItem from 'menu-items';
import NavItem from './NavItem';

// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
    const [openIdx, setOpenIdx] = useState<any>(-1);
    const navItems = menuItem.items.map((item) => {
        switch (item.type) {
            case 'group':
                return <NavGroup key={item.id} item={item} openIdx={openIdx} setOpenIdx={setOpenIdx} />;
            case 'item':
                return <NavItem key={item.id} item={item} level={0} />;
            default:
                return (
                    <Typography key={item.id} variant="h6" color="error" align="center">
                        Menu Items Error
                    </Typography>
                );
        }
    });

    return <>{navItems}</>;
};

export default memo(MenuList);
