interface WorkSpaceBoxProps {
    name?: string;
    description?: string;
    image?: string;
    users?: number;
    balance?: number;
}

const WorkSpaceBox = ({ name, description, image, users, balance }: WorkSpaceBoxProps) => (
    <div className="workspace-box md:flex justify-between items-center mw-full mb-4">
        <div className="flex items-center mb-4 md:mb-0">
            <div className="avatar-img flex-shrink-0">{image && <img src={image} alt="avatar" />}</div>
            <div className="mx-4">
                <h3 className="secondary-title">{name}</h3>
                <p className="detail-text text-muted">{description || 'N/A'}</p>
            </div>
        </div>

        <div className="flex justify-between w-full text-center md:text-right right">
            <div className="flex-grow-1 item-box">
                <h3 className="secondary-title">{users}</h3>
                <p className="detail-text text-muted">Users</p>
            </div>

            <div className="flex-grow-1 item-box">
                <h3 className="secondary-title">${balance}</h3>
                <p className="detail-text text-muted">Balance</p>
            </div>
        </div>
    </div>
);

export default WorkSpaceBox;
