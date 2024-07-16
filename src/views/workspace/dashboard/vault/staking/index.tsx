import { Button } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import StakingIcon from 'assets/images/workspace/staking-icon.png';

const Staking = () => (
    <>
        <div className="xl:flex mb-2">
            <div className="vault-box flex w-full mb-2 xl:mb-0 xl:mr-2">
                <div className="staking-box w-1/3">
                    <p className="detail-text text-muted">Staked</p>
                    <h3 className="primary-title">0 SOL</h3>
                </div>

                <div className="staking-box w-2/3">
                    <p className="detail-text text-muted">ROI</p>
                    <h3 className="primary-title">0.00000 SOL</h3>
                </div>
            </div>

            <div className="vault-box flex w-full">
                <div className="staking-box w-full">
                    <p className="detail-text text-muted">Activating</p>
                    <h3 className="primary-title">0 SOL</h3>
                </div>

                <div className="staking-box w-full">
                    <p className="detail-text text-muted">Deactivating</p>
                    <h3 className="primary-title">0 SOL</h3>
                </div>

                <div className="staking-box w-full">
                    <p className="detail-text text-muted">Withdrawable</p>
                    <h3 className="primary-title">0 SOL</h3>
                </div>
            </div>
        </div>

        <div className="vault-box flex justify-between items-center">
            <img className="rounded-t rounded-b" src={StakingIcon} width={36} height={36} alt="staking" />
            <div className="ml-4 mr-auto">
                <p className="detail-text font-semi-bold text-white">Stakewiz by Laine</p>
                <p className="detail-text text-muted">Validators</p>
            </div>
            <div className="ml-2 mr-8">
                <p className="detail-text font-semi-bold text-white">34h 37m</p>
                <p className="detail-text text-muted">Epoch</p>
            </div>
            <Button variant="contained" className="dark-btn">
                <KeyboardArrowDown />
            </Button>
        </div>
    </>
);

export default Staking;
