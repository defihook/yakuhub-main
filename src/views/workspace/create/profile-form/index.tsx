import { FormEvent, Dispatch, SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import Resizer from 'react-image-file-resizer';
import { Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Edit, Description, AddLink, Twitter, Key } from '@mui/icons-material';
import DiscordIcon from 'assets/images/workspace/discord-icon.svg';

import { useLazyQuery } from '@apollo/client';
import { queries } from '../../../../graphql/graphql';

interface ProfileFormProps {
    address: string;
    setStep: Dispatch<SetStateAction<number>>;
    name: string;
    setName: Dispatch<SetStateAction<string>>;
    description: string;
    setDescription: Dispatch<SetStateAction<string>>;
    image: any;
    setImage: Dispatch<SetStateAction<any>>;
    website: string;
    setWebsite: Dispatch<SetStateAction<string>>;
    twitter: string;
    setTwitter: Dispatch<SetStateAction<string>>;
    discord: string;
    setDiscord: Dispatch<SetStateAction<string>>;
    token: string;
    setToken: Dispatch<SetStateAction<string>>;
}

const ProfileForm = ({
    address,
    setStep,
    name,
    setName,
    description,
    setDescription,
    image,
    setImage,
    website,
    setWebsite,
    twitter,
    setTwitter,
    discord,
    setDiscord,
    token,
    setToken
}: ProfileFormProps) => {
    const [isNameTaken, setNameTaken] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [images, setImages] = useState<any[]>([]);
    const [isImageLarge, setImageLarge] = useState<boolean>(false);
    const navigate = useNavigate();
    const [getWorkspaceByName] = useLazyQuery(queries.GET_WORKSPACE_BY_NAME);

    const onImageChange = (imageList: ImageListType) => {
        setImages(imageList as never[]);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (images[0]) {
            console.log('IMAGE_SIZE_CHECKING...');
            const size = images[0].file.size;
            if (size > 3 * 1024 * 1024) {
                // larger than 3MB
                console.log('TOO_LARGE! :(');
                setImageLarge(true);
                return;
            }

            console.log('PASSED! :)');
            try {
                console.log('IMAGE_COMPRESSING...');
                Resizer.imageFileResizer(images[0].file, 48, 48, 'JPEG', 80, 0, (result) => {
                    console.log('COMPRESSED_IMAGE: ', result);
                    setImage(result);
                });
            } catch (err) {
                console.error(err);
                return;
            }
        }

        if (name !== '') {
            setLoading(true);
            console.log('NAME_DUPLICATION_CHECKING...');
            try {
                const { data } = await getWorkspaceByName({ variables: { owner: address, name } });
                if (data.getWorkspaceByName && data.getWorkspaceByName.name === name) {
                    console.log('DUPLICATED! :(');
                    setNameTaken(true);
                } else {
                    console.log('PASSED! :)');
                    setStep(2);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="create-box">
            <div className="create-box-header">
                <h3 className="secondary-title pb-4">Create your WorkSpace</h3>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Picture */}
                <div className="flex items-center">
                    <ImageUploading value={images} onChange={onImageChange}>
                        {({ imageList, onImageUpload }) => (
                            <button type="button" className="avatar-img" onClick={onImageUpload}>
                                {imageList[0] && <img src={imageList[0].dataURL} alt="avatar" />}
                            </button>
                        )}
                    </ImageUploading>

                    <div className="form-header ml-4">
                        <h3 className="secondary-title">WorkSpace picture</h3>
                        <p className="detail-text text-muted">Supporting JPEG, PNG or GIF (under 3MB)</p>
                    </div>
                </div>
                {isImageLarge && <p className="mt-1 text-red-400">Too large image</p>}

                {/* Name, Description, Website, Twitter, Discord and Token */}
                <div className="workspace-input mt-5">
                    <i className="input-icon">
                        <Edit />
                    </i>
                    <input
                        type="text"
                        className="input-field"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                        required
                        autoComplete="off"
                    />
                    {isNameTaken && <p className="mt-1 text-red-400">This name has already been taken</p>}
                </div>

                <div className="workspace-input mt-3">
                    <i className="input-icon">
                        <Description />
                    </i>
                    <input
                        type="text"
                        className="input-field"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                        autoComplete="off"
                    />
                </div>

                <div className="lg:flex justify-between">
                    <div className="workspace-input mt-3 flex-grow lg:mr-1">
                        <i className="input-icon">
                            <AddLink />
                        </i>
                        <input
                            type="text"
                            className="input-field"
                            id="website"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="Website"
                            autoComplete="off"
                        />
                    </div>

                    <div className="workspace-input mt-3 flex-grow lg:ml-1">
                        <i className="input-icon">
                            <Twitter />
                        </i>
                        <input
                            type="text"
                            className="input-field"
                            id="twitter"
                            value={twitter}
                            onChange={(e) => setTwitter(e.target.value)}
                            placeholder="Twitter"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="lg:flex justify-between">
                    <div className="workspace-input mt-3 flex-grow lg:mr-1">
                        <i className="input-icon">
                            <img className="mt-1" src={DiscordIcon} width="22" alt="discord" />
                        </i>
                        <input
                            type="text"
                            className="input-field"
                            id="discord"
                            value={discord}
                            onChange={(e) => setDiscord(e.target.value)}
                            placeholder="Discord"
                            autoComplete="off"
                        />
                    </div>

                    <div className="workspace-input mt-3 flex-grow lg:ml-1">
                        <i className="input-icon">
                            <Key />
                        </i>
                        <input
                            type="text"
                            className="input-field"
                            id="token"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Token"
                            autoComplete="off"
                        />
                    </div>
                </div>

                {/* Cancel and Next buttons */}
                <div className="flex mt-5">
                    <Button variant="contained" className="dark-btn flex-1 mr-2" onClick={() => navigate('/home')}>
                        Cancel
                    </Button>
                    <LoadingButton variant="contained" loading={loading} type="submit" className="blue-btn flex-1 ml-2">
                        Next
                    </LoadingButton>
                </div>
            </form>
        </div>
    );
};

export default ProfileForm;
