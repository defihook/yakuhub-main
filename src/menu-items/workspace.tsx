// third-party
import { FormattedMessage } from 'react-intl';

// assets
import {
    IconApps,
    IconBriefcase,
    IconUsers,
    IconCoin,
    IconInfoCircle,
    IconCamera,
    IconTool,
    IconEdit,
    IconCloudUpload,
    IconFingerprint
} from '@tabler/icons';

// ==============================|| YAKU HOLDER MENU ITEMS ||============================== //

const workspace = {
    id: 'workspace',
    title: <FormattedMessage id="create-workspace" />,
    type: 'group',
    icon: IconBriefcase,
    children: [
        {
            id: 'staffManagement',
            title: <FormattedMessage id="payroll" />,
            type: 'collapse',
            defaultOpen: true,
            icon: IconUsers,
            children: [
                {
                    id: 'admin',
                    title: <FormattedMessage id="project-manager" />,
                    type: 'item',
                    url: '/staff-management/admin',
                    icon: IconApps,
                    breadcrumbs: true
                },
                {
                    id: 'employee',
                    title: <FormattedMessage id="project-staff" />,
                    type: 'item',
                    url: '/staff-management/employee',
                    icon: IconBriefcase,
                    breadcrumbs: true
                }
            ]
        },
        {
            id: 'token-metadata',
            title: <FormattedMessage id="token-metadata" />,
            type: 'item',
            url: '/tools/token-metadata',
            icon: IconInfoCircle,
            breadcrumbs: false
        },
        {
            id: 'nft-mints',
            title: <FormattedMessage id="nft-mints" />,
            type: 'item',
            url: '/tools/nft-mints',
            icon: IconFingerprint,
            breadcrumbs: false
        },
        {
            id: 'holder-snapshot',
            title: <FormattedMessage id="holder-snapshot" />,
            type: 'item',
            url: '/tools/holder-snapshot',
            icon: IconCamera,
            breadcrumbs: false
        },
        {
            id: 'mint-nft',
            title: <FormattedMessage id="mint-nft" />,
            type: 'item',
            url: '/tools/mint-nft',
            icon: IconTool,
            breadcrumbs: false
        },
        {
            id: 'update-nft',
            title: <FormattedMessage id="update-nft" />,
            type: 'item',
            url: '/tools/update-nft',
            icon: IconEdit,
            breadcrumbs: false
        },
        {
            id: 'arweave-upload',
            title: <FormattedMessage id="arweave-upload" />,
            type: 'item',
            url: '/tools/arweave-upload',
            icon: IconCloudUpload,
            breadcrumbs: false
        },
        {
            id: 'token-creation',
            title: <FormattedMessage id="token-creation" />,
            type: 'item',
            url: '/tools/token-creation',
            icon: IconCoin,
            breadcrumbs: false
        },
        {
            id: 'update-token',
            title: <FormattedMessage id="update-token" />,
            type: 'item',
            url: '/tools/update-token',
            icon: IconEdit,
            breadcrumbs: false
        }
    ]
};

export default workspace;
