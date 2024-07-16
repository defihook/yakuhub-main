/* eslint-disable jsx-a11y/media-has-caption */
import { Avatar, Box, Chip, IconButton, ImageList, ImageListItem, ImageListItemBar, ListSubheader } from '@mui/material';
import { EyeOutlined } from '@ant-design/icons';
import { filter, map, round } from 'lodash';
import { IMAGE_PROXY } from 'config/config';
import MPActionButton from './MPActionButton';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SetAvatarButton from './SetAvatarButton';
import NFTsDialog from './NFTsDialog';
import SendAndBurnButton from './SendAndBurnButton';

const TitlebarImageList = ({
    items,
    title,
    icon,
    navigate,
    updateView,
    showActionButton,
    showAvatarButton,
    showSendAndBurnButton,
    showSubItems,
    chain = 'SOL'
}: any) => {
    const innerNav = useNavigate();
    const [show, setShow] = useState<number | boolean>();
    const [showItems, setShowItems] = useState<boolean>(false);
    const [cItem, setCItem] = useState<any>({});
    const showCollectionItemsDialog = (item: any) => {
        setCItem(item);
        setShowItems(true);
    };

    const navigateWithProjectId = async (item: any) => {
        if (item.project_id) {
            innerNav(`/explore/collection/${chain}/${item.project_id}/${item.mint}`);
        } else if (item.collection_symbol) {
            innerNav(`/explore/collection/${chain}/${item.collection_symbol}/${item.mint}`);
        }
    };

    return (
        <ImageList sx={{ width: '100%' }} cols={4} gap={4}>
            <ImageListItem key="Subheader" cols={4}>
                <ListSubheader
                    component="div"
                    sx={{ borderRadius: '.75rem', px: 3, fontSize: 16, fontWeight: 700, display: 'flex', gap: 0.5, alignItems: 'center' }}
                >
                    {icon || <></>} {items.length} {title}
                </ListSubheader>
            </ImageListItem>
            {map(
                filter(items, ({ img }) => !!img),
                (item, idx) => (
                    <ImageListItem
                        key={`${item.img}+${idx}`}
                        sx={{ borderRadius: 4, position: 'relative', cursor: 'pointer' }}
                        onMouseEnter={() => setShow(idx)}
                        onMouseLeave={() => setShow(false)}
                        onClick={() => showSubItems && showCollectionItemsDialog(item)}
                    >
                        {!item.video && (
                            <img
                                src={`${IMAGE_PROXY}${item.img}`}
                                srcSet={`${IMAGE_PROXY}${item.img}`}
                                alt={item.title}
                                style={{
                                    borderRadius: 16,
                                    aspectRatio: '1 / 1',
                                    objectFit: 'cover',
                                    width: '100%',
                                    minHeight: 80,
                                    maxHeight: 367
                                }}
                                loading="lazy"
                            />
                        )}
                        {item.video && (
                            <Box sx={{ aspectRatio: '1 / 1', width: '100%', display: 'flex', minHeight: 80, maxHeight: 367 }}>
                                <video autoPlay loop muted style={{ width: '100%' }}>
                                    <source src={item.video} />
                                </video>
                            </Box>
                        )}
                        {showActionButton && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    top: 0,
                                    right: 0,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    p: 1.5,
                                    display: show !== false && show === idx ? 'flex' : 'none',
                                    flexDirection: 'column',
                                    gap: 0.5
                                }}
                            >
                                {showAvatarButton && !item.listed && <SetAvatarButton item={item} />}
                                <MPActionButton
                                    price={item.price}
                                    owner={item.owner}
                                    broker_referral_address={item.broker_referral_address}
                                    marketplace_program_id={item.marketplace_program_id}
                                    tokenMint={item.mint}
                                    name={item.name}
                                    listed={item.listed}
                                    staked={item.staked}
                                    floor_price={item.floor_price}
                                    noListing
                                    updateView={updateView}
                                />
                                {showSendAndBurnButton && !item.listed && !item.staked && (
                                    <SendAndBurnButton item={item} updateView={updateView} />
                                )}
                            </Box>
                        )}
                        {item.staked && (
                            <Chip label="Staked" sx={{ position: 'absolute', top: 4, left: 4, backgroundColor: '#22222288' }} />
                        )}
                        {!item.staked && item.listed && (
                            <Chip label="Listed" sx={{ position: 'absolute', top: 4, left: 4, backgroundColor: '#22222288' }} />
                        )}
                        {item.price && (
                            <Chip
                                label={`${!item.listed ? 'FP: ' : ''}${round(item.price, 3).toLocaleString()}◎`}
                                sx={{ position: 'absolute', top: 4, right: 4, backgroundColor: '#22222288' }}
                            />
                        )}
                        <ImageListItemBar
                            title={item.title}
                            actionIcon={
                                navigate ? (
                                    <IconButton size="small" onClick={() => navigateWithProjectId(item)}>
                                        <EyeOutlined />
                                    </IconButton>
                                ) : (
                                    <Avatar sx={{ width: 24, height: 24, fontSize: 14, mr: 1 }}>{item.count}</Avatar>
                                )
                            }
                        />
                    </ImageListItem>
                )
            )}
            <NFTsDialog showItems={showItems} setShowItems={setShowItems} cItem={cItem} chain={chain} canView updateView={updateView} />
        </ImageList>
    );
};

export default TitlebarImageList;
