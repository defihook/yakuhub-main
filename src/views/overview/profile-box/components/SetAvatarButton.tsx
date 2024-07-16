import { Button, Typography } from '@mui/material';
import { mutations } from '../../../../graphql/graphql';
import useAuthMutation from 'hooks/useAuthMutation';
import { useMeta } from 'contexts/meta/meta';
import { useToasts } from 'hooks/useToasts';
import { useWallet } from '@solana/wallet-adapter-react';
import useAuth from 'hooks/useAuth';

const SetAvatarButton = ({ item }: any) => {
    const { startLoading, stopLoading } = useMeta();
    const wallet = useWallet();
    const { showSuccessToast, showErrorToast } = useToasts();
    const { setUserData, user } = useAuth();

    const [setAvatar] = useAuthMutation(mutations.SET_AVATAR);

    const setAsAvatar = async () => {
        if (item.image) {
            startLoading();
            try {
                await setAvatar({
                    variables: {
                        imageUrl: item.image
                    }
                });
                setUserData({
                    ...user,
                    avatar: item.image
                });
                showSuccessToast('Successfully set your NFT as avatar.');
            } catch (error: any) {
                showErrorToast(error);
            } finally {
                stopLoading();
            }
        }
    };

    return (
        <>
            {item.owner === wallet?.publicKey?.toBase58() && !item.listed && (
                <Button sx={{ borderRadius: 30, mt: 2 }} fullWidth color="secondary" variant="contained" onClick={() => setAsAvatar()}>
                    <Typography component="p" fontSize={20} noWrap>
                        Set as Avatar
                    </Typography>
                </Button>
            )}
        </>
    );
};

export default SetAvatarButton;
