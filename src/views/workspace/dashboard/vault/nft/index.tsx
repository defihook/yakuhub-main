import EmptyBox from '../../../components/empty-box';
import NftIcon from 'assets/images/workspace/nft-icon.svg';

const Nft = () => (
    <div>
        <EmptyBox icon={NftIcon} title="No NFTs" detail="Click on “Deposit” to add your NFTs to the vault" />
    </div>
);

export default Nft;
