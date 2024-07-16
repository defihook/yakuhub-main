/* eslint-disable no-extra-boolean-cast */
import { MailOutline } from '@mui/icons-material';
import {
    Avatar,
    AvatarGroup,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Skeleton,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { IconBrandDiscord, IconBrandTwitter, IconUpload } from '@tabler/icons';
import Badges from 'components/BadgeIcons';
import copy from 'copy-to-clipboard';
import { mutations } from '../../../graphql/graphql';
import useAuth from 'hooks/useAuth';
import useAuthMutation from 'hooks/useAuthMutation';
import { useToasts } from 'hooks/useToasts';
import { filter, find } from 'lodash';
import { useEffect, useState } from 'react';
// eslint-disable-next-line
import ProfileBanner from './ProfileBanner';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';

const EditProfileDialog = ({
    src,
    showEditProfile,
    setShowEditProfile,
    handleSave,
    handleUploadBanner,
    isLoading,
    handleShowSelectNft,
    username,
    handleUsername,
    bio,
    handleBio,
    locale,
    handleLocale
}: any) => (
    <Dialog open={showEditProfile} onClose={() => setShowEditProfile(false)} fullWidth maxWidth="lg">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography component="h2" fontSize={24} fontWeight={800}>
                Edit profile
            </Typography>
            <LoadingButton
                variant="contained"
                color="secondary"
                sx={{ backgroundColor: '#fff', color: '#000', borderRadius: 30000 }}
                onClick={() => handleSave()}
                loading={isLoading}
            >
                Save
            </LoadingButton>
        </DialogTitle>
        <DialogContent>
            <ProfileBanner height={240} editable upload={handleUploadBanner} />
            <Box
                sx={{
                    mt: { xs: '-40px', md: '-75px' },
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative'
                }}
            >
                <Avatar
                    src={src}
                    sx={{
                        width: { xs: 60, md: 150 },
                        height: { xs: 60, md: 150 },
                        objectFit: 'contain',
                        border: 'none',
                        backgroundColor: '#000',
                        zIndex: 20
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        top: 0,
                        right: 0,
                        backgroundColor: '#00000066',
                        width: { xs: 60, md: 150 },
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '50%',
                        display: 'flex',
                        p: 2,
                        zIndex: 21
                    }}
                >
                    <IconButton
                        sx={{
                            backgroundColor: '#00000066'
                        }}
                        onClick={() => handleShowSelectNft()}
                    >
                        <IconUpload />
                    </IconButton>
                </Box>
            </Box>
            <Box
                sx={{
                    mt: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    alignItems: 'center'
                }}
            >
                <TextField
                    fullWidth
                    inputProps={{ maxLength: 30 }}
                    label="Vanity"
                    value={username}
                    onChange={(e) => handleUsername(e.target.value)}
                />
                <TextField fullWidth inputProps={{ maxLength: 600 }} label="Bio" value={bio} onChange={(e) => handleBio(e.target.value)} />
                <TextField
                    fullWidth
                    inputProps={{ maxLength: 30 }}
                    label="Location"
                    value={locale}
                    onChange={(e) => handleLocale(e.target.value)}
                />
            </Box>
        </DialogContent>
    </Dialog>
);

const AvatarSection = ({
    src,
    vanity,
    sol_name,
    discord,
    twitter,
    stakedYakuNfts,
    wallet,
    mainWallet,
    handleChat,
    handleFollow,
    isFollowed,
    followers,
    followings,
    handleShowSelectNft
}: any) => {
    const { user, setUserData } = useAuth();
    const { showSuccessToast } = useToasts();
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState(user?.vanity || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [locale, setLocale] = useState(user?.location || '');
    const theme = useTheme();
    const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));
    const [updateProfile] = useAuthMutation(mutations.UPDATE_PROFILE);
    const handleEditProfile = () => {
        setShowEditProfile(true);
    };

    const handleUsername = async (name: string) => {
        setUsername(name);
    };
    const handleBio = async (name: string) => {
        setBio(name);
    };
    const handleLocale = async (name: string) => {
        setLocale(name);
    };
    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateProfile({
                variables: {
                    profile: {
                        vanity: username,
                        bio,
                        location: locale
                    }
                }
            });
            setUserData({
                ...user,
                vanity: username,
                bio,
                location: locale
            });
            showSuccessToast('Successfully updated your profile.');
            setShowEditProfile(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleUploadBanner = async (image: string) => {
        const {
            data: { url }
        } = await axios.post('https://project.yaku.ai/files/upload', {
            user: user.id,
            update: true,
            file: image
        });
        setUserData({
            ...user,
            banner: image
        });
    };
    useEffect(() => {
        if (user) {
            setUsername(user?.vanity);
            setBio(user?.bio);
            setLocale(user?.location);
        }
    }, [user]);
    return (
        <Box
            sx={{
                mt: { xs: '-40px', md: '-180px' },
                display: 'flex',
                alignItems: 'center'
            }}
        >
            {src ? (
                <Avatar
                    src={src}
                    sx={{
                        width: { xs: 60, md: 240 },
                        height: { xs: 60, md: 240 },
                        objectFit: 'contain',
                        border: 'none',
                        backgroundColor: '#000',
                        zIndex: 20
                    }}
                />
            ) : (
                <Skeleton
                    sx={{
                        width: { xs: 60, md: 240 },
                        height: { xs: 60, md: 240 },
                        zIndex: 20,
                        backgroundColor: '#111111ec'
                    }}
                    variant="circular"
                />
            )}
            <Box
                sx={{
                    backgroundColor: '#111111ec',
                    width: { xs: '100%', md: 'auto' },
                    minWidth: { xs: '80vw', md: 480 },
                    maxWidth: '80vw',
                    minHeight: 100,
                    maxHeight: 140,
                    zIndex: 19,
                    pl: 5,
                    pr: 2,
                    borderRadius: 4,
                    marginLeft: '-24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}
            >
                <Grid container columnSpacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Grid item xs={!!handleFollow ? 7 : 12}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                            <Typography noWrap fontSize={20} fontWeight={800}>
                                {mainWallet?.publicKey?.toBase58() === wallet && user ? user.vanity : vanity} {sol_name && `| ${sol_name}`}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', columnGap: 1, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                            {discord && (
                                <Tooltip title="Click to copy">
                                    <Typography
                                        fontSize={14}
                                        fontWeight={800}
                                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
                                        noWrap
                                        onClick={() => {
                                            copy(`${discord?.name}#${discord?.discriminator}`);
                                            showSuccessToast(`Copied discord id: ${discord?.name}#${discord?.discriminator}`);
                                        }}
                                    >
                                        <IconBrandDiscord style={{ height: 16, width: 14 }} />
                                        <Typography noWrap>{`${discord?.name}#${discord?.discriminator}`}</Typography>
                                    </Typography>
                                </Tooltip>
                            )}
                            {twitter && (
                                <Typography
                                    fontSize={14}
                                    fontWeight={800}
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
                                    onClick={() => window.open(`https://twitter.com/${twitter?.username}`, '_blank')}
                                    noWrap
                                >
                                    <IconBrandTwitter style={{ height: 16, width: 14 }} />
                                    <Typography noWrap>{twitter?.username}</Typography>
                                </Typography>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                            <AvatarGroup
                                max={matchUpMd ? 6 : 4}
                                spacing="medium"
                                sx={{
                                    gap: 2,
                                    cursor: 'pointer',
                                    '.MuiAvatarGroup-avatar': { width: 24, height: 24, border: 'none', fontSize: 16 },
                                    '.MuiAvatar-root': { border: 'none' }
                                }}
                            >
                                {stakedYakuNfts &&
                                    stakedYakuNfts.length > 0 &&
                                    filter(stakedYakuNfts, ({ amount }: any) => amount === 36000000000).length > 0 && (
                                        <Badges icon="BadgeIconDiamond" alt="Mansion Owner" />
                                    )}
                                {/* <Badges icon="BadgeIconDiploma" /> */}
                                {stakedYakuNfts && stakedYakuNfts.length > 0 && <Badges icon="BadgeIconLemon" alt="Yaku Holder" />}
                                {stakedYakuNfts &&
                                    stakedYakuNfts.length > 0 &&
                                    !!find(stakedYakuNfts, ({ amount }: any) => amount >= 2000000000 && amount < 4000000000) && (
                                        <Badges icon="BadgeIconMotor" alt="Bike Holder" />
                                    )}
                                {stakedYakuNfts &&
                                    stakedYakuNfts.length > 0 &&
                                    filter(stakedYakuNfts, ({ amount }: any) => amount === 4000000000).length > 9 && (
                                        <Badges icon="BadgeIconWhale" alt="Whale" />
                                    )}
                                {/* <Badges icon="BadgeIconTwitter" /> */}
                                {/* <Badges icon="BadgeIconGoldMedal" /> */}
                            </AvatarGroup>
                        </Box>
                    </Grid>
                    <Grid
                        item
                        xs={4.5}
                        sx={{
                            alignItems: 'flex-end',
                            flexDirection: 'column',
                            justifyContent: 'space-bewteen',
                            height: '100%',
                            display: !!handleFollow ? 'flex' : 'none'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            {mainWallet?.publicKey?.toBase58() === wallet && user ? (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    sx={{ backgroundColor: '#fff', color: '#000', borderRadius: 30000 }}
                                    onClick={handleEditProfile}
                                >
                                    {matchUpMd ? 'Edit Profile' : 'Edit'}
                                </Button>
                            ) : (
                                <></>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            {mainWallet?.publicKey?.toBase58() !== wallet ? (
                                <>
                                    <IconButton onClick={handleChat}>
                                        <MailOutline />
                                    </IconButton>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        sx={{ backgroundColor: '#fff', color: '#000', borderRadius: 30000 }}
                                        onClick={handleFollow}
                                    >
                                        {isFollowed ? 'Unfollow' : 'Follow'}
                                    </Button>
                                </>
                            ) : (
                                <></>
                            )}
                        </Box>
                        <Box
                            sx={{
                                mt: 1,
                                display: 'flex',
                                alignItems: { xs: 'flex-end', md: 'center' },
                                justifyContent: { md: 'flex-end', xs: 'center' },
                                gap: 1,
                                flexDirection: { xs: 'column', md: 'row' }
                            }}
                        >
                            <Typography noWrap>
                                {Intl.NumberFormat('en-US', {
                                    notation: 'compact',
                                    maximumFractionDigits: 1
                                }).format(followings || 0)}{' '}
                                Followings
                            </Typography>

                            <Typography noWrap>
                                {Intl.NumberFormat('en-US', {
                                    notation: 'compact',
                                    maximumFractionDigits: 1
                                }).format(followers || 0)}{' '}
                                Followers
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <EditProfileDialog
                {...{
                    src,
                    showEditProfile,
                    setShowEditProfile,
                    handleSave,
                    handleUploadBanner,
                    isLoading,
                    handleShowSelectNft,
                    username,
                    handleUsername,
                    bio,
                    handleBio,
                    locale,
                    handleLocale
                }}
            />
        </Box>
    );
};

export default AvatarSection;
