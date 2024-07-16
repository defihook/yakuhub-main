/* eslint-disable @typescript-eslint/no-unused-vars */
// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconApps, IconBox, IconCalendar, IconSwitch, IconCoin, IconCrosshair, IconBolt, IconSend, IconFlame } from '@tabler/icons';

// ==============================|| APPLICATION MENU ITEMS ||============================== //

const applications = {
    id: 'applications',
    title: <FormattedMessage id="application" />,
    type: 'item',
    showInCollapsed: true,
    url: '/applications',
    icon: IconApps,
    breadcrumbs: false
    // children: [
    //     {
    //         id: 'swap',
    //         title: 'Swap',
    //         type: 'item',
    //         url: '/applications/swap',
    //         icon: IconSwitch,
    //         breadcrumbs: true
    //     },
    //     {
    //         id: 'sniper',
    //         title: <FormattedMessage id="sniper" />,
    //         type: 'item',
    //         url: '/applications/sniper',
    //         icon: IconCrosshair,
    //         breadcrumbs: true
    //     },
    //     {
    //         id: 'mint-calendar',
    //         title: <FormattedMessage id="mint-calendar" />,
    //         type: 'item',
    //         url: '/applications/calendar',
    //         icon: IconCalendar,
    //         breadcrumbs: true
    //     },
    //     {
    //         id: 'raffles',
    //         title: <FormattedMessage id="raffles" />,
    //         type: 'item',
    //         url: '/applications/raffles',
    //         icon: IconBox,
    //         breadcrumbs: true
    //     },
    //     {
    //         id: 'staking',
    //         title: <FormattedMessage id="staking" />,
    //         type: 'item',
    //         url: '/applications/staking',
    //         icon: IconBolt,
    //         breadcrumbs: true
    //     },
    //     // {
    //     //     id: 'spaces',
    //     //     title: <FormattedMessage id="spaces" />,
    //     //     type: 'item',
    //     //     url: '/spaces',
    //     //     icon: icons.IconAffiliate,
    //     //     breadcrumbs: false
    //     // },
    //     {
    //         id: 'send-nfts',
    //         title: <FormattedMessage id="send-nfts" />,
    //         type: 'item',
    //         url: '/applications/send-nfts',
    //         icon: IconSend,
    //         breadcrumbs: true
    //     },
    //     {
    //         id: 'burn-nfts',
    //         title: <FormattedMessage id="burn-nfts" />,
    //         type: 'item',
    //         url: '/applications/burn-nfts',
    //         icon: IconFlame,
    //         breadcrumbs: true
    //     }
    //     // {
    //     //     id: 'collabs',
    //     //     title: <FormattedMessage id="collabs" />,
    //     //     type: 'item',
    //     //     url: '#',
    //     //     icon: IconAtom,
    //     //     breadcrumbs: false,
    //     //     soon: true
    //     // },
    //     // {
    //     //     id: 'token-creation',
    //     //     title: <FormattedMessage id="token-creation" />,
    //     //     type: 'item',
    //     //     url: '/applications/token-creation',
    //     //     icon: IconCoin
    //     // }
    //     // {
    //     //     id: 'trade',
    //     //     title: <FormattedMessage id="trade" />,
    //     //     type: 'item',
    //     //     url: '#',
    //     //     icon: IconRepeat,
    //     //     hidden: true
    //     // },
    //     // {
    //     //     id: 'rarity-search',
    //     //     title: <FormattedMessage id="rarity-search" />,
    //     //     type: 'item',
    //     //     url: '#',
    //     //     icon: IconSearch,
    //     //     hidden: true
    //     // }
    // ]
};

export default applications;
