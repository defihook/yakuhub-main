// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconHome, IconFlame } from '@tabler/icons';

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
    id: 'dashboard',
    title: 'Home',
    type: 'group',
    icon: IconHome,
    children: [
        {
            id: 'home',
            title: <FormattedMessage id="home" />,
            type: 'item',
            url: '/home',
            icon: IconHome,
            breadcrumbs: false
        },
        {
            id: 'feed',
            title: <FormattedMessage id="feed" />,
            type: 'item',
            url: '#',
            icon: IconFlame,
            breadcrumbs: false,
            soon: true
        }
    ]
};

export default dashboard;
