import { Button, Skeleton } from '@mui/material';
import { Add, ArrowUpward, ArrowDownward, ContentCopy } from '@mui/icons-material';
import SolanaIcon from 'assets/images/workspace/solana-icon.png';
import { shortenAddress } from 'utils/utils';

interface AssetsProps {
    workspace?: any;
    loading?: boolean;
}

const Assets = ({ workspace, loading }: AssetsProps) => (
    <div className="flex flex-col justify-between gap-2 xl:flex-row xl:gap-6">
        <div className="w-full flex flex-col gap-2 xl:gap-6">
            <div className="vault-box">
                <div className="md:flex justify-between items-center mt-2 pb-4 bottom-border">
                    <div className="mb-2 md:mb-0">
                        <p className="detail-text text-muted">Vault balance</p>
                        <h4 className="text-2xl font-bold">
                            {loading || !workspace.balance ? <Skeleton variant="text" /> : <span>${workspace.balance}</span>}
                        </h4>
                    </div>

                    <div className="flex items-center">
                        <Button variant="contained" className="dark-btn big-btn">
                            <ArrowUpward sx={{ fontSize: 20 }} />
                        </Button>
                        <Button variant="contained" className="blue-btn big-btn ml-4 mr-auto">
                            <ArrowDownward sx={{ fontSize: 20 }} />
                        </Button>
                        <div className="address-box ml-4">
                            <p className="text-muted">address</p>
                            <div className="flex">
                                <h3 className="secondary-title mr-2">CshY...3VrP</h3>
                                <ContentCopy sx={{ fontSize: 18 }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center py-4 bottom-border">
                    <img className="rounded-full" src={SolanaIcon} width={20} height={20} alt="solana" />
                    <h3 className="secondary-title ml-3 mr-auto">
                        SOL <span className="text-muted">Solana</span>
                    </h3>
                    <h3 className="secondary-title pr-2">
                        <span className="text-muted">$0.03</span> 0.001
                    </h3>
                </div>
            </div>

            <div className="vault-box">
                <div className="flex items-center mt-2 pb-4 bottom-border">
                    <h3 className="secondary-title">Recent transactions</h3>
                </div>

                <div className="flex items-center py-4 bottom-border">
                    <p className="detail-text text-muted text-muted">October 18, 2022</p>
                </div>

                <div className="grid grid-cols-2 py-4 pr-2 bottom-border lg:grid-cols-4">
                    <div className="flex items-center">
                        <img className="rounded-full" src={SolanaIcon} width={20} height={20} alt="solana" />
                        <h3 className="secondary-title ml-3">Deposit</h3>
                    </div>
                    <h3 className="secondary-title text-right lg:text-center">
                        {loading || !workspace.owner ? <Skeleton variant="text" /> : <span>{shortenAddress(workspace.owner)}</span>}
                    </h3>
                    <h3 className="secondary-title text-muted text-left lg:text-center">3:11 AM</h3>
                    <h3 className="secondary-title text-right">0.001 SOL</h3>
                </div>
            </div>

            <div className="vault-box contacts-box">
                <div className="flex items-center">
                    <h3 className="secondary-title mr-auto">Contacts</h3>
                    <Button variant="contained" className="dark-btn">
                        <Add sx={{ fontSize: 20 }} />
                    </Button>
                </div>
                <p className="detail-text text-muted mt-2">No contacts yet</p>
            </div>
        </div>

        <div className="vault-box swap-box flex justify-center items-center">Swap Box</div>
    </div>
);

export default Assets;
