import { Avatar, Button, Divider, IconButton, Typography, Box, Grid } from '@mui/material';
import { Cancel } from '@mui/icons-material';
import { round } from 'lodash';
import { IMAGE_PROXY } from 'config/config';
import SolanaLogo from 'assets/images/icons/solana.svg';
import EthLogo from 'assets/images/blockchains/ethereum-icon.png';
import { SelectedItemType } from './index';

const SelectedTab = (props: {
    selectedNfts: SelectedItemType[];
    buyNowMulti: Function;
    onDeSelect: Function;
    type: string;
    solBalance: number;
    ethBalance: number;
}) => {
    const { selectedNfts, buyNowMulti, onDeSelect, type, solBalance, ethBalance } = props;

    let totalSolPrice = 0;
    let totalEthPrice = 0;
    selectedNfts.forEach((item) => {
        if (item.chain === 'SOL') {
            totalSolPrice += item.price;
        } else {
            totalEthPrice += item.price;
        }
    });

    return (
        <>
            <Divider />
            <div
                style={{
                    height: '100vh',
                    overflow: 'auto',
                    padding: '8px 16px'
                }}
            >
                {selectedNfts.length !== 0 &&
                    selectedNfts.map((item: any, key: any) => (
                        <div className="selected-nft" key={key}>
                            <div className="nft-name">
                                <img src={`${item.chain === 'SOL' ? IMAGE_PROXY : ''}${item.metaDataImg}`} alt={item.name} />
                                <Typography component="h5" fontWeight={500} fontSize={14}>
                                    {`${item.name.split('#')[0].length > 8 ? `${item.name.slice(0, 7)}...` : item.name.split('#')[0]}#${
                                        item.name.split('#')[1]
                                    }`}
                                </Typography>
                            </div>
                            <div className="nft-price">
                                <Avatar
                                    src={item.chain === 'SOL' ? SolanaLogo : EthLogo}
                                    sx={{
                                        width: 18,
                                        height: 18,
                                        objectFit: 'contain',
                                        border: 'none',
                                        background: 'transparent'
                                    }}
                                    color="inherit"
                                />
                                <Typography component="h4" fontSize={12} fontWeight={700} sx={{ marginLeft: '4px' }}>
                                    {round(item.price, 2).toLocaleString()} {item.chain}
                                </Typography>

                                <IconButton
                                    onClick={() => onDeSelect(item.tokenAddress, item.contractAddress)}
                                    style={{
                                        position: 'absolute',
                                        left: 22,
                                        top: -6
                                    }}
                                    size="small"
                                >
                                    <Cancel style={{ fontSize: 16 }} />
                                </IconButton>
                            </div>
                        </div>
                    ))}
            </div>
            <Divider />
            <Grid container className="selected-group-control">
                <Box className="total-values">
                    <Typography component="h1" fontSize={20} fontWeight={600}>
                        Your total
                    </Typography>
                    {totalSolPrice === 0 && totalEthPrice === 0 && <span>-</span>}
                    {totalSolPrice > 0 && (
                        <span>
                            <Avatar
                                src={SolanaLogo}
                                sx={{
                                    width: 18,
                                    height: 18,
                                    objectFit: 'contain',
                                    border: 'none',
                                    background: 'transparent'
                                }}
                                color="inherit"
                            />
                            <Typography component="h4" fontSize={12} fontWeight={700} sx={{ marginLeft: '4px' }}>
                                {round(totalSolPrice, 2).toLocaleString()}
                            </Typography>
                        </span>
                    )}
                    {totalEthPrice > 0 && (
                        <span>
                            <Avatar
                                src={EthLogo}
                                sx={{
                                    width: 18,
                                    height: 18,
                                    objectFit: 'contain',
                                    border: 'none',
                                    background: 'transparent'
                                }}
                                color="inherit"
                            />
                            <Typography component="h4" fontSize={12} fontWeight={700} sx={{ marginLeft: '4px' }}>
                                {round(totalEthPrice, 2).toLocaleString()}
                            </Typography>
                        </span>
                    )}
                </Box>
                <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => buyNowMulti(selectedNfts)}
                    sx={{ width: '100%', gap: 1, mt: 1, borderRadius: '50px' }}
                    disabled={selectedNfts.length === 0}
                >
                    <Typography variant="body1" noWrap fontSize="16px">
                        Buy now
                    </Typography>
                </Button>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1.5, gap: '8px', width: '100%' }}>
                    <Typography component="h2" fontSize={16} fontWeight={400} sx={{ color: '#F5F8FFB2' }}>
                        Available Balance:
                    </Typography>
                    <div>
                        {solBalance > 0 && (
                            <Typography component="h2" fontSize={16} fontWeight={700} sx={{ color: '#F5F8FF' }}>
                                {round(solBalance, 3).toLocaleString()} SOL
                            </Typography>
                        )}
                        {ethBalance > 0 && (
                            <Typography component="h2" fontSize={16} fontWeight={700} sx={{ color: '#F5F8FF' }}>
                                {round(ethBalance, 3).toLocaleString()} ETH
                            </Typography>
                        )}
                    </div>
                </Box>
            </Grid>
        </>
    );
};

export default SelectedTab;
