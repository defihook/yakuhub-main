// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconStar } from '@tabler/icons';

// ==============================|| EXPLORE MENU ITEMS ||============================== //

const explore = {
    id: 'explore',
    title: <FormattedMessage id="explore" />,
    type: 'group',
    showInCollapsed: true,
    icon: IconStar,
    defaultOpen: true,
    children: [
        {
            id: 'wallets',
            title: <FormattedMessage id="wallets" />,
            type: 'item',
            url: '/explore/wallets',
            breadcrumbs: false,
            soon: true
        },
        {
            id: 'collection',
            title: <FormattedMessage id="nfts" />,
            type: 'item',
            url: '/explore/collection/SOL',
            breadcrumbs: true
        },
        {
            id: 'token',
            title: <FormattedMessage id="tokens" />,
            type: 'item',
            url: '/explore/token',
            breadcrumbs: true
        },
        {
            id: 'defi',
            title: <FormattedMessage id="defi" />,
            type: 'item',
            url: '/explore/defi',
            breadcrumbs: true
        },
        {
            id: 'dao',
            title: <FormattedMessage id="dao" />,
            type: 'item',
            url: '#',
            breadcrumbs: false,
            soon: true
        }
    ]
};

export default explore;
