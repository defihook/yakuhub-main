import { EyeOutlined } from '@ant-design/icons';
import {
    Avatar,
    Box,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    Skeleton
} from '@mui/material';
import { IMAGE_PROXY } from 'config/config';
import { map, round } from 'lodash';
import Image from 'mui-image';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MPActionButton from './MPActionButton';
import SendAndBurnButton from './SendAndBurnButton';
import SetAvatarButton from './SetAvatarButton';

const NFTsDialog = ({
    showItems,
    setShowItems,
    cItem,
    canView = true,
    updateView,
    hideTitle = false,
    cols = 4,
    gap = 4,
    isLoading = false,
    noListing = false,
    showSendAndBurnButton = true,
    chain = 'SOL'
}: any) => {
    const innerNav = useNavigate();
    const [show, setShow] = useState<number | boolean>();
    const navigateWithProjectId = async (item: any) => {
        const projectId = item.project_id || item.collection_symbol || item.collectionKey;
        const mint = item.mint;
        innerNav(`/explore/collection/${chain}/${projectId}/${mint}`);
    };
    return (
        <Dialog open={showItems} onClose={() => setShowItems(false)} maxWidth="xl">
            {!hideTitle && (
                <DialogTitle sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Avatar sx={{ backgroundColor: 'transparent' }} src={`${IMAGE_PROXY}${cItem.img}`} /> {cItem.title} ({cItem.count})
                </DialogTitle>
            )}
            <DialogContent>
                {!isLoading ? (
                    <ImageList sx={{ width: '100%', overflowY: 'hidden' }} cols={cols} gap={gap}>
                        {map(cItem.items, (item: any, idx: number) => (
                            <ImageListItem
                                key={`${item.image}+${idx}`}
                                sx={{ borderRadius: 4, position: 'relative' }}
                                onMouseEnter={() => setShow(idx)}
                                onMouseLeave={() => setShow(false)}
                            >
                                {!item.video && (
                                    <Image
                                        src={`${IMAGE_PROXY}${item.image}`}
                                        alt={item.title}
                                        style={{
                                            borderRadius: 16,
                                            aspectRatio: '1 / 1',
                                            objectFit: 'cover',
                                            width: '100%',
                                            height: 'auto',
                                            minHeight: 80,
                                            maxHeight: 367
                                        }}
                                    />
                                )}
                                {item.video && (
                                    <Box sx={{ aspectRatio: '1 / 1', width: '100%', display: 'flex', minHeight: 80, maxHeight: 367 }}>
                                        <video autoPlay loop muted style={{ width: '100%' }}>
                                            <source src={item.video} />
                                        </video>
                                    </Box>
                                )}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        top: 0,
                                        right: 0,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        p: 2,
                                        display: show !== false && show === idx ? 'flex' : 'none',
                                        flexDirection: 'column',
                                        gap: 0.5
                                    }}
                                >
                                    {!item.listed && <SetAvatarButton item={item} />}
                                    {!noListing && (
                                        <MPActionButton
                                            price={item.price}
                                            owner={item.owner}
                                            broker_referral_address={item.broker_referral_address}
                                            marketplace_program_id={item.marketplace_program_id}
                                            tokenMint={item.mint}
                                            name={item.name}
                                            listed={item.listStatus === 'listed' || item.listed}
                                            staked={item.staked}
                                            floor_price={cItem.floor_price || item.floor_price}
                                            noListing
                                            updateView={updateView}
                                        />
                                    )}
                                    {showSendAndBurnButton && !item.listed && !item.staked && (
                                        <SendAndBurnButton item={item} updateView={updateView} />
                                    )}
                                </Box>
                                {item.staked && (
                                    <Chip label="Staked" sx={{ position: 'absolute', top: 4, left: 4, backgroundColor: '#22222288' }} />
                                )}
                                {!item.staked && (item.listStatus === 'listed' || item.listed) && (
                                    <Chip label="Listed" sx={{ position: 'absolute', top: 4, left: 4, backgroundColor: '#22222288' }} />
                                )}
                                {item.price && (
                                    <Chip
                                        label={`${!(item.listStatus === 'listed' || item.listed) ? 'FP: ' : ''}${round(
                                            item.price,
                                            3
                                        ).toLocaleString()}◎`}
                                        sx={{ position: 'absolute', top: 4, right: 4, backgroundColor: '#22222288' }}
                                    />
                                )}
                                {cItem.floor_price && !item.price && item.listStatus !== 'listed' && (
                                    <Chip
                                        label={`${!(item.listStatus === 'listed' || item.listed) ? 'FP: ' : ''}${round(
                                            cItem.floor_price,
                                            3
                                        ).toLocaleString()}◎`}
                                        sx={{ position: 'absolute', top: 4, right: 4, backgroundColor: '#22222288' }}
                                    />
                                )}
                                {canView && (
                                    <ImageListItemBar
                                        title={item.name}
                                        actionIcon={
                                            <IconButton size="small" onClick={() => navigateWithProjectId(item)}>
                                                <EyeOutlined />
                                            </IconButton>
                                        }
                                    />
                                )}
                            </ImageListItem>
                        ))}
                    </ImageList>
                ) : (
                    <Grid container gap={gap}>
                        {map(Array(cols * 2), (col) => (
                            <Grid key={col} item xs={12 / cols}>
                                <Skeleton
                                    variant="rounded"
                                    width="100%"
                                    height="auto"
                                    sx={{ aspectRatio: '1 / 1', minHeight: 80, minWidth: 80 }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default NFTsDialog;
