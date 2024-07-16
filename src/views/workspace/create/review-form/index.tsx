import { FormEvent, Dispatch, SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { AddLink, Twitter, Key, PeopleOutline } from '@mui/icons-material';
import { shortenAddress } from 'utils/utils';
import DiscordIcon from 'assets/images/workspace/discord-icon.svg';

import useAuthMutation from 'hooks/useAuthMutation';
import { mutations } from '../../../../graphql/graphql';
import { useDispatch } from 'store';
import { updateHasWorkspace } from 'store/slices/menu';

interface ReviewFormProps {
    address: string;
    setStep: Dispatch<SetStateAction<number>>;
    name: string;
    description: string;
    image: any;
    website: string;
    twitter: string;
    discord: string;
    token: string;
    users: any[];
}

const ReviewForm = ({ address, setStep, name, description, image, website, twitter, discord, token, users }: ReviewFormProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const [createWorkspace] = useAuthMutation(mutations.CREATE_WORKSPACE);
    const dispatch = useDispatch();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const workspace = {
            owner: address,
            name,
            description,
            image,
            website,
            twitter,
            discord,
            token,
            users
        };
        console.log('NEW_WORKSPACE: ', workspace);

        try {
            setLoading(true);
            console.log('WORKSPACE_CREATING...');
            const { data } = await createWorkspace({ variables: workspace });
            console.log('WORKSPACE_CREATED! :)');
            dispatch(updateHasWorkspace(true));
            navigate(`/workspaces/vault/${data.createWorkspace.id}`);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-box">
            <div className="create-box-header">
                <h3 className="secondary-title pb-6">Review your WorkSpace</h3>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="flex items-center">
                    <div className="avatar-img flex-shrink-0">{image && <img src={image} alt="avatar" />}</div>
                    <div className="form-header ml-5">
                        <h3 className="secondary-title">{name}</h3>
                        <p className="detail-text text-muted">{description}</p>
                    </div>
                </div>

                <div className="lg:flex">
                    <div className="review-box lg:w-2/3 mt-5 lg:mr-2">
                        <p className="detail-text text-muted">
                            <AddLink sx={{ fontSize: 20, marginRight: 1 }} />
                            {website}
                        </p>
                        <p className="detail-text text-muted">
                            <Twitter sx={{ fontSize: 20, marginRight: 1 }} />
                            {twitter}
                        </p>
                        <p className="detail-text text-muted">
                            <img className="inline mr-2" src={DiscordIcon} width="20" alt="discord" />
                            {discord}
                        </p>
                        <p className="detail-text text-muted">
                            <Key sx={{ fontSize: 20, marginRight: 1 }} />
                            {token !== '' && shortenAddress(token, 7)}
                        </p>
                    </div>

                    <div className="review-box lg:w-1/3 mt-5 lg:ml-2">
                        <h3 className="flex items-center justify-between">
                            <span>{users.length}</span>
                            <PeopleOutline />
                        </h3>
                        <p className="detail-text text-muted">Users</p>
                    </div>
                </div>

                {/* Back and Confirm buttons */}
                <div className="flex mt-5">
                    <Button variant="contained" className="dark-btn flex-1 mr-2" onClick={() => setStep(2)}>
                        Back
                    </Button>
                    <LoadingButton variant="contained" loading={loading} type="submit" className="blue-btn flex-1 ml-2">
                        Confirm
                    </LoadingButton>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
