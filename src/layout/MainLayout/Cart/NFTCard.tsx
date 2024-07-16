import { Typography, FormControl, Box, OutlinedInput, Avatar, InputAdornment, Tooltip } from '@mui/material';
import SolanaLogo from 'assets/images/icons/solana.svg';
import EthLogo from 'assets/images/blockchains/ethereum-icon.png';

const NFTCard = (props: { token: any; changePrice: Function; isSol?: boolean }) => {
    const { token, changePrice, isSol = true } = props;

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2, pl: 2, width: '100%', mb: '8px' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <img src={token.image} alt={token.name} width="42" height="42" style={{ borderRadius: '12px' }} />
                <div>
                    <Tooltip title={token.name}>
                        <Typography
                            href={`/explore/collection/${isSol ? 'SOL' : 'ETH'}/${token.symbol}/${token.mint}`}
                            component="a"
                            fontWeight={500}
                            fontSize={14}
                        >
                            {`#${token.name.split('#')[1]}`}
                        </Typography>
                    </Tooltip>
                    <Tooltip title={`Rank ${token.rarity_rank}`}>
                        <Typography component="h5" fontWeight={500} fontSize={14}>
                            {token.rarity_rank}
                        </Typography>
                    </Tooltip>
                </div>
            </div>
            <FormControl variant="outlined" sx={{ maxWidth: '100px' }}>
                <OutlinedInput
                    id="outlined-adornment-weight"
                    type="number"
                    value={token.newPrice}
                    onChange={(e) => changePrice(token.mint, +e.target.value)}
                    endAdornment={
                        <InputAdornment position="start">
                            <Avatar
                                src={isSol ? SolanaLogo : EthLogo}
                                sx={{
                                    width: 18,
                                    height: 18,
                                    objectFit: 'contain',
                                    border: 'none',
                                    background: 'transparent'
                                }}
                                color="inherit"
                            />
                        </InputAdornment>
                    }
                    aria-describedby="outlined-weight-helper-text"
                    size="small"
                    inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*'
                        // step: '0.01'
                    }}
                    sx={{ padding: '0px', '& input': { padding: '10px 0px 10px 10px !important' } }}
                />
            </FormControl>
        </Box>
    );
};

export default NFTCard;
