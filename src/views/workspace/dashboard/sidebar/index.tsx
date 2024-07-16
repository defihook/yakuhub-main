import { Link, useLocation } from 'react-router-dom';
import { Skeleton, CircularProgress } from '@mui/material';
import { QrCode, ContentCopy, Launch, PeopleOutline, Settings, AccountBalance, Apps, Explore } from '@mui/icons-material';

const Actions = [
    {
        name: 'qr',
        icon: <QrCode sx={{ fontSize: 16 }} />,
        url: '/'
    },
    {
        name: 'copy',
        icon: <ContentCopy sx={{ fontSize: 16 }} />,
        url: '/'
    },
    {
        name: 'share',
        icon: <Launch sx={{ fontSize: 16 }} />,
        url: '/'
    }
];

interface SidebarProps {
    workspace?: any;
    loading?: boolean;
}

const Sidebar = ({ workspace, loading }: SidebarProps) => {
    const { pathname } = useLocation();

    const Links = [
        {
            name: 'users',
            title: 'Users',
            icon: <PeopleOutline sx={{ fontSize: 20 }} />,
            url: `/workspaces/users/${workspace.id}`
        },
        {
            name: 'management',
            title: 'Staff',
            icon: <Settings sx={{ fontSize: 20 }} />,
            url: `/workspaces/staff-management/admin/${workspace.id}`
        },
        {
            name: 'vault',
            title: 'Vault',
            icon: <AccountBalance sx={{ fontSize: 20 }} />,
            url: `/workspaces/vault/${workspace.id}`
        },
        {
            name: 'apps',
            title: 'Apps',
            icon: <Apps sx={{ fontSize: 20 }} />,
            url: `/workspaces/apps/${workspace.id}`
        },
        {
            name: 'info',
            title: 'Info',
            icon: <Explore sx={{ fontSize: 20 }} />,
            url: '/info'
        }
    ];

    return (
        <div className="sidebar">
            <div className="profile-box lg:flex flex-col items-center">
                <div className="flex lg:flex-col items-center lg:text-center">
                    {loading ? (
                        <Skeleton variant="circular" width={40} height={40} />
                    ) : (
                        <div className="avatar-img mx-2 lg:mx-0 lg:mb-2">
                            {workspace.image && <img src={workspace.image} alt="avatar" />}
                        </div>
                    )}
                    <div>
                        <p className="detail-text text-muted">
                            {loading || !workspace.name ? <Skeleton variant="text" width={60} /> : <span>{workspace.name}</span>}
                        </p>
                        <h3 className="secondary-title">
                            {loading || !workspace.balance ? <Skeleton variant="text" width={60} /> : <span>${workspace.balance}</span>}
                        </h3>
                    </div>
                </div>

                <div className="flex justify-between w-full mt-3">
                    {Actions.map((el, idx) => (
                        <Link key={idx} to={el.url} className="action flex justify-center items-center">
                            {el.icon}
                        </Link>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="mt-20 text-center">
                    <CircularProgress color="secondary" />
                </div>
            ) : (
                <div className="mt-3">
                    {Links.map((el, idx) => (
                        <Link
                            key={idx}
                            to={el.url}
                            className={`sidebar-link flex items-center mt-2 px-4 py-2 ${pathname.includes(el.name) ? 'active' : ''}`}
                        >
                            {el.icon}
                            <h3 className="secondary-title ml-2">{el.title}</h3>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Sidebar;
