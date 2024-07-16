interface EmptyBoxProps {
    icon: string;
    title: string;
    detail?: string;
}

const EmptyBox = ({ icon, title, detail }: EmptyBoxProps) => (
    <div className="empty-box flex flex-col justify-center items-center text-center">
        <div className="icon-box mt-8 md:mt-0">
            <img src={icon} width={48} height={48} alt="wallet" />
        </div>
        <h3 className="secondary-title">{title}</h3>
        {detail && <p className="detail-text">{detail}</p>}
    </div>
);

export default EmptyBox;
