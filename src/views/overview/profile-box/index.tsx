import { useState, useEffect } from 'react';
import { Skeleton } from '@mui/material';
import { Twitter } from '@mui/icons-material';
import EditDialog from './components/EditDialog';
import NFTsDialog from './components/NFTsDialog';
import DefaultAvatar from 'assets/images/profile-image.jpeg';
import DiscordIcon from 'assets/images/workspace/discord-icon.svg';
import '../overview.scss';

import axios from 'axios';
import { filter, flatten, map } from 'lodash';
import useAuth from 'hooks/useAuth';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import useAuthMutation from 'hooks/useAuthMutation';
import { queries, mutations } from '../../../graphql/graphql';
import { useToasts } from 'hooks/useToasts';
import { IMAGE_PROXY_BANNER, DEFAULT_BANNER } from 'config/config';
import { shortenAddress } from 'utils/utils';

const ProfileBox = ({ wallet }: any) => {
    const { user, setUserData } = useAuth();
    console.log('USER: ', user);
    const [loading, setLoading] = useState<boolean>(false);
    const [avatar, setAvatar] = useState<any>(user.avatar);
    const [banner, setBanner] = useState<any>(user.banner);
    const [username, setUsername] = useState<string>(user.vanity);
    const [followers, setFollowers] = useState<number>(0);
    const [followings, setFollowings] = useState<number>(0);
    const [getUserFollowers] = useAuthLazyQuery(queries.GET_USER_FOLLOWERS);
    const [getUserFollowings] = useAuthLazyQuery(queries.GET_USER_FOLLOWINGS);

    const fetchUserFollows = async () => {
        try {
            setLoading(true);
            console.log('USER_FOLLOWERS_FETCHING...');
            const { data: userFollowers } = await getUserFollowers({
                variables: { wallet }
            });
            console.log('FOLLOWERS: ', userFollowers.getUserFollowers);
            setFollowers(userFollowers?.getUserFollowers?.length);

            console.log('USER_FOLLOWINGS_FETCHING...');
            const { data: userFollowings } = await getUserFollowings({
                variables: { wallet }
            });
            console.log('FOLLOWINGS: ', userFollowings?.getUserFollowings);
            setFollowings(userFollowings?.getUserFollowings?.length);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserFollows();
    }, []);

    const refreshProfile = async () => {
        if (user) {
            setUsername(user.vanity);
            setBio(user.bio);
            setLocale(user.location);
            setAvatar(user.avatar);
            setBanner(user.banner);
        }
    };

    useEffect(() => {
        refreshProfile();
    }, [user]);

    /* For Edit Profile Dialog */
    const [show, setShow] = useState(false);
    const [bio, setBio] = useState<string>(user.bio);
    const [locale, setLocale] = useState<any>(user.location);
    const [showSelectNft, setShowSelectNft] = useState(false);
    const [collections, setCollections] = useState<any[]>([]);
    const [updateProfile] = useAuthMutation(mutations.UPDATE_PROFILE);
    const { showSuccessToast } = useToasts();

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
        setLoading(true);
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
            setShow(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadBanner = async (image: string) => {
        await axios.post('https://project.yaku.ai/files/upload', {
            user: user.id,
            update: true,
            file: image
        });
        setUserData({
            ...user,
            banner: image
        });
    };

    const handleShowSelectNft = () => {
        setShowSelectNft(true);
        // console.log(flatten(map(collections, ({ items }) => items)));
    };

    return (
        <section className="profile-box mid-bg mb-4 rounded-3xl overflow-hidden shadow-sm">
            <div className="banner high-bg">
                <img className="w-full h-full object-cover" src={banner || `${IMAGE_PROXY_BANNER}${DEFAULT_BANNER}`} alt="banner" />
            </div>

            <div className="p-4 text-center">
                <div className="flex justify-center">
                    <div>
                        <h3 className="high-text mb-1 text-base font-bold">
                            {loading ? <Skeleton variant="text" className="mx-auto" width={30} /> : followers || 0}
                        </h3>
                        <p className="low-text text-xs font-medium">Followers</p>
                    </div>

                    <div className="avatar -mt-14 mx-2 rounded-3xl overflow-hidden shadow-sm">
                        <img className="w-full h-full object-cover" src={avatar || DefaultAvatar} alt="avatar" />
                    </div>

                    <div>
                        <h3 className="high-text mb-1 text-base font-bold">
                            {loading ? <Skeleton variant="text" className="mx-auto" width={30} /> : followings || 0}
                        </h3>
                        <p className="low-text text-xs font-medium">Following</p>
                    </div>
                </div>

                <div className="p-4 pt-6 border-b low-border">
                    <h3 className="high-text mb-2 text-base font-bold">{username || shortenAddress(wallet)}</h3>
                    {user.discord && (
                        <p className="low-text flex items-center justify-center text-sm font-medium mb-1">
                            <img className="mr-1" src={DiscordIcon} alt="discord" />
                            {user.discord?.name}#{user.discord?.discriminator}
                        </p>
                    )}
                    {user.twitter && user.twitter.name && (
                        <p className="mid-text flex items-center justify-center text-sm font-medium mb-3">
                            <Twitter className="mr-1" />
                            {user.twitter?.name}
                        </p>
                    )}
                    <p className="mid-text text-sm font-medium leading-6">{user.bio}</p>
                </div>

                <button
                    type="button"
                    className="mid-text high-bg w-full h-11 mt-3 rounded-xl text-sm font-medium shadow-sm duration-300"
                    onClick={() => setShow(true)}
                >
                    Edit Profile
                </button>
            </div>

            <EditDialog
                show={show}
                setShow={setShow}
                loading={loading}
                src={avatar || DefaultAvatar}
                username={username}
                handleUsername={handleUsername}
                bio={bio}
                handleBio={handleBio}
                locale={locale}
                handleLocale={handleLocale}
                handleSave={handleSave}
                handleUploadBanner={handleUploadBanner}
                handleShowSelectNft={handleShowSelectNft}
            />

            <NFTsDialog
                showItems={showSelectNft}
                setShowItems={setShowSelectNft}
                cItem={{
                    items:
                        collections && collections.length > 0
                            ? filter(flatten(map(collections, ({ items }) => items)), ({ listed }) => !listed)
                            : []
                }}
                canView={false}
                hideTitle
                noListing
                showSendAndBurnButton={false}
                cols={6}
            />
        </section>
    );
};

export default ProfileBox;
