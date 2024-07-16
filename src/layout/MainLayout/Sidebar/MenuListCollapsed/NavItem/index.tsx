// material-ui
import { ListItemButton, ListItemIcon, Tooltip } from '@mui/material';

// project imports
import useConfig from 'hooks/useConfig';
import { useSelector } from 'store';

// assets
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// types
import { NavItemType } from 'types';

interface NavItemProps {
    item: NavItemType;
    level: number;
}

// ==============================|| SIDEBAR MENU LIST ITEMS ||============================== //

const NavItem = ({ item, level }: NavItemProps) => {
    const { borderRadius } = useConfig();
    const { openItem } = useSelector((state: any) => state.menu);

    const Icon = item?.icon!;
    const itemIcon = item?.icon ? (
        <Icon stroke={1.5} size="24px" />
    ) : (
        <FiberManualRecordIcon
            sx={{
                width: openItem.findIndex((id: any) => id === item?.id) > -1 ? 8 : 6,
                height: openItem.findIndex((id: any) => id === item?.id) > -1 ? 8 : 6
            }}
            fontSize={level > 0 ? 'inherit' : 'medium'}
        />
    );

    return (
        <ListItemButton
            // {...listItemProps}
            disabled={item.disabled}
            sx={{
                cursor: item.hidden ? 'not-allowed' : 'pointer',
                borderRadius: `${borderRadius}px`,
                mb: 0.5,
                px: 0,
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
                backgroundColor: level > 1 ? 'transparent !important' : 'inherit',
                width: '100%'
            }}
            selected={openItem?.findIndex((id: any) => id === item.id) > -1}
        >
            <Tooltip title={item?.title || ''}>
                <ListItemIcon sx={{ minWidth: 'unset' }}>{itemIcon}</ListItemIcon>
            </Tooltip>
        </ListItemButton>
    );
};

export default NavItem;
