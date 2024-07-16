import { useEffect, useState } from 'react';
import { StarRateRounded } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Avatar, Box, Button, Card, CardContent, CardMedia, Chip, Tooltip, Typography } from '@mui/material';
import { IMAGE_PROXY, MARKETPLACE_PROGRAM_ID, RARITY_COLORS } from 'config/config';
import { round } from 'lodash';
import Image from 'mui-image';
import SolanaLogo from 'assets/images/icons/solana.svg';
import EthLogo from 'assets/images/blockchains/ethereum-icon.png';
import { getMarketplaceIcon, getRarity, rarityDiv } from 'utils/utils';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from 'components/Loading';

const NFTCard = ({
    meta_data_img,
    name,
    rank_est,
    supply,
    lowest_listing_mpa,
    token_address,
    meta_data_uri,
    project_id,
    attributes,
    buyNow,
    onSelect,
    selectedNfts,
    sweepValue
}: any) => {
    const { chain } = useParams();
    const navigate = useNavigate();
    const [selected, setSelected] = useState(false);
    const handleSelect = () => {
        lowest_listing_mpa.price > 0 &&
            onSelect(
                token_address,
                meta_data_img,
                name,
                lowest_listing_mpa.price as number,
                lowest_listing_mpa.broker_referral_address as string,
                lowest_listing_mpa.marketplace_program_id as string,
                project_id as string
            );
    };
    useEffect(() => {
        if (selectedNfts.filter((item: any) => item.tokenAddress === token_address).length === 0) {
            setSelected(false);
        } else {
            setSelected(true);
        }
    }, [JSON.stringify(selectedNfts)]);

    return (
        <>
            <Card
                sx={{
                    width: '100%',
                    cursor: 'pointer',
                    position: 'relative',
                    border: selected ? '1px solid #f38aff' : '1px solid transparent'
                }}
                // onClick={() => navigate(`/explore/collection/SOL/${project_id}/${token_address}`)}
                onClick={handleSelect}
            >
                <CardMedia sx={{ minHeight: 120, display: 'flex', position: 'relative' }}>
                    <Image
                        src={`${chain === 'SOL' ? IMAGE_PROXY : ''}${meta_data_img}`}
                        style={{ aspectRatio: '1 / 1' }}
                        alt={name}
                        fit="cover"
                        showLoading={<Loading />}
                    />

                    {rank_est >= 0 && (
                        <Chip
                            icon={<StarRateRounded />}
                            label={rank_est}
                            size="small"
                            sx={{
                                background: `${RARITY_COLORS[getRarity(rarityDiv(supply), rank_est) || '']}88`,
                                color: '#000',
                                alignItems: 'center',
                                position: 'absolute',
                                left: 8,
                                top: 8,
                                lineHeight: 18,
                                '.MuiSvgIcon-root': {
                                    height: '0.8rem',
                                    width: '0.8rem',
                                    fill: 'yellow',
                                    marginTop: '-3px'
                                }
                            }}
                        />
                    )}
                    {lowest_listing_mpa && getMarketplaceIcon(lowest_listing_mpa.marketplace_program_id) && (
                        <Tooltip title={MARKETPLACE_PROGRAM_ID[lowest_listing_mpa.marketplace_program_id]}>
                            <Avatar
                                sx={{
                                    objectFit: 'contain',
                                    border: 'none',
                                    width: 36,
                                    height: 36,
                                    position: 'absolute',
                                    right: 16,
                                    bottom: -18,
                                    background: 'transparent'
                                }}
                                src={getMarketplaceIcon(lowest_listing_mpa.marketplace_program_id)}
                            />
                        </Tooltip>
                    )}
                </CardMedia>
                <CardContent
                    sx={{
                        backgroundColor: rank_est >= 0 ? `${RARITY_COLORS[getRarity(rarityDiv(supply), rank_est) || '']}22` : 'transparent'
                    }}
                >
                    <Typography component="h4" fontWeight={700} fontSize={16}>
                        {name}
                    </Typography>
                    {lowest_listing_mpa && (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
                            <Avatar
                                src={chain === 'SOL' ? SolanaLogo : EthLogo}
                                sx={{
                                    width: 18,
                                    height: 18,
                                    cursor: 'pointer',
                                    border: selected ? '1px solid #f38aff' : '1px solid transparent',
                                    backgroundColor: 'transparent'
                                }}
                                color="inherit"
                            />
                            <Typography component="h4" fontSize={16} fontWeight={700}>
                                {round(lowest_listing_mpa.price, 2).toLocaleString()}
                            </Typography>
                        </Box>
                    )}
                    {lowest_listing_mpa && (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
                            {lowest_listing_mpa.price > 0 && (
                                <Button
                                    sx={{ borderRadius: 30 }}
                                    color="secondary"
                                    variant="contained"
                                    onClick={(event) =>
                                        buyNow({
                                            meta_data_img,
                                            name,
                                            rank_est,
                                            supply,
                                            token_address,
                                            meta_data_uri,
                                            project_id,
                                            attributes,
                                            lowest_listing_mpa,
                                            event
                                        })
                                    }
                                >
                                    <Typography component="p" noWrap>
                                        Buy
                                    </Typography>
                                </Button>
                            )}
                            <Button
                                sx={{ ml: 'auto', borderRadius: 30 }}
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                    navigate(`/explore/collection/${chain}/${project_id}/${token_address}`, {
                                        replace: true
                                    })
                                }
                                title="View NFT Details"
                            >
                                <Typography component="p" noWrap>
                                    Detail
                                </Typography>
                            </Button>
                        </Box>
                    )}
                    {selected && (
                        <CheckCircleIcon
                            sx={{ fontSize: 20 }}
                            style={{
                                position: 'absolute',
                                right: 10,
                                top: 10,
                                color: '#f38aff'
                            }}
                        />
                    )}
                </CardContent>
            </Card>
        </>
    );
};

export default NFTCard;
