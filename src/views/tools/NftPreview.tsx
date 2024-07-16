/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable import/prefer-default-export */
import { Box, Card, CardMedia, CardContent, Typography } from '@mui/material';
import Loading from 'components/Loading';
import { IMAGE_PROXY } from 'config/config';
import Image from 'mui-image';
import { useState } from 'react';

interface NFTPreviewProps {
    nft: any;
    selectable: boolean;
    selected: boolean;
    handleNFTSelect: (...args: any) => void;
    hoverComponent?: any;
    selectedComponent?: any;
}
export function NFTPreview({
    nft,
    selectable = false,
    selected = false,
    handleNFTSelect = (...args: any) => {},
    hoverComponent,
    selectedComponent
}: NFTPreviewProps) {
    const [showHover, setShowHover] = useState(false);
    return (
        <Card
            sx={{ width: '100%', height: '100%', cursor: 'pointer', border: selected ? '2px solid #f38aff' : '' }}
            onClick={() => selectable && handleNFTSelect(nft.mint)}
            onMouseEnter={() => {
                if (hoverComponent) {
                    setShowHover(true);
                }
            }}
            onMouseLeave={() => {
                setShowHover(false);
            }}
        >
            <CardMedia sx={{ minHeight: 128, display: 'flex', position: 'relative' }}>
                {nft?.metadata?.properties?.category !== 'video' && (
                    <Image
                        src={`${IMAGE_PROXY}${nft?.metadata?.image}`}
                        style={{ aspectRatio: '1 / 1' }}
                        alt={nft.metadata?.name}
                        fit="cover"
                        showLoading={<Loading />}
                    />
                )}
                {nft?.metadata?.properties?.category === 'video' && (
                    <Box sx={{ aspectRatio: '1 / 1', minHeight: 80, maxHeight: 367 }}>
                        <video autoPlay loop style={{ width: '100%' }}>
                            <source src={nft?.metadata?.animation_url} />
                        </video>
                    </Box>
                )}
                {showHover && !selected && hoverComponent && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#00000088'
                        }}
                    >
                        {hoverComponent}
                    </Box>
                )}
                {selected && selectedComponent && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#00000088'
                        }}
                    >
                        {selectedComponent}
                    </Box>
                )}
            </CardMedia>
            <CardContent
                sx={{
                    backgroundColor: 'transparent'
                }}
            >
                <Typography component="h4" fontWeight={700} fontSize={16}>
                    {nft.metadata?.name || nft?.tokenData?.name}
                </Typography>
            </CardContent>
        </Card>
    );
}
