// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconApps, IconBriefcase, IconUsers } from '@tabler/icons';

// constant
const icons = { IconApps, IconBriefcase, IconUsers };

// ==============================|| YAKU HOLDER MENU ITEMS ||============================== //

const staffManagement = {
    id: 'staffManagement',
    title: <FormattedMessage id="staff-management" />,
    caption: <FormattedMessage id="staff-management-caption" />,
    type: 'group',
    icon: icons.IconUsers,
    children: [
        {
            id: 'admin',
            title: <FormattedMessage id="project-manager" />,
            type: 'item',
            url: '/staff-management/admin',
            icon: icons.IconApps
        },
        {
            id: 'employee',
            title: <FormattedMessage id="employee" />,
            type: 'item',
            url: '/staff-management/employee',
            icon: icons.IconBriefcase
        }
    ]
};

export default staffManagement;
