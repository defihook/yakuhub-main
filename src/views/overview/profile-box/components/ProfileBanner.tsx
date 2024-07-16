import { Box, Dialog, DialogActions, DialogContent, IconButton, Slider } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { FileUpload } from '@mui/icons-material';
import Loading from 'components/Loading';
import { DEFAULT_BANNER, IMAGE_PROXY_BANNER } from 'config/config';
import useAuth from 'hooks/useAuth';
import { useToasts } from 'hooks/useToasts';
import Image from 'mui-image';
import { useCallback, useState } from 'react';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import Cropper from 'react-easy-crop';
import getCroppedImg from 'utils/cropImage';
import { useTheme } from '@mui/styles';

const CropDialogContent = ({ theme, image, crop, zoom, setCrop, onCropComplete, setZoom }: any) => (
    <>
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: 400,
                background: '#333',
                [theme.breakpoints.up('sm')]: {
                    height: 600
                }
            }}
        >
            <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={308 / 124}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
            />
        </div>
        <div
            style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                [theme.breakpoints.up('sm')]: {
                    flexDirection: 'row',
                    alignItems: 'center'
                }
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flex: '1',
                    alignItems: 'center',
                    marginTop: 8,
                    marginBottom: 8
                }}
            >
                <Slider
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    color="secondary"
                    sx={{
                        root: {
                            padding: '22px 0px',
                            marginLeft: 32,
                            [theme.breakpoints.up('sm')]: {
                                flexDirection: 'row',
                                alignItems: 'center',
                                margin: '0 16px'
                            }
                        }
                    }}
                    onChange={(e, _zoom) => setZoom(_zoom)}
                />
            </div>
        </div>
    </>
);

const ProfileBanner = ({ height = 360, editable = false, upload, url }: any) => {
    const { user } = useAuth();
    const theme = useTheme();
    const [images, setImages] = useState<ImageListType>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { showErrorToast, showSuccessToast } = useToasts();
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCrop, setShowCrop] = useState(false);
    const uploadImage = async () => {
        setIsLoading(true);
        try {
            const croppedImage = await getCroppedImg(images[0].dataURL!, croppedAreaPixels, 0);
            await upload(croppedImage);
            showSuccessToast('Successfully updated banner.');
            setShowCrop(false);
        } catch (error) {
            showErrorToast('There is some error when uploading, please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const onCropComplete = useCallback((croppedArea: any, _croppedAreaPixels: any) => {
        setCroppedAreaPixels(_croppedAreaPixels);
    }, []);

    const onChange = async (imageList: ImageListType, addUpdateIndex?: number[]) => {
        setImages(imageList);
        setShowCrop(true);
    };

    return (
        <Box sx={{ m: '-20px', backgroundColor: '#000', zIndex: 1, position: 'relative' }}>
            <Image style={{ width: '100%', height }} src={user.banner || url || `${IMAGE_PROXY_BANNER}${DEFAULT_BANNER}`} fit="cover" />
            {editable && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        top: 0,
                        right: 0,
                        backgroundColor: '#00000066',
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        p: 2,
                        zIndex: 20
                    }}
                >
                    <ImageUploading value={images} onChange={onChange} acceptType={['jpg', 'gif', 'png']} maxFileSize={3.5 * 1024 * 1024}>
                        {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps, errors }) => (
                            <>
                                {!isLoading ? (
                                    <>
                                        <IconButton
                                            sx={{
                                                backgroundColor: '#00000066'
                                            }}
                                            onClick={onImageUpload}
                                        >
                                            <FileUpload />
                                        </IconButton>
                                        <div style={{ color: 'red', marginLeft: 1 }}>
                                            {errors && errors.maxFileSize && 'Image should be less than 3.5MB.'}
                                        </div>
                                    </>
                                ) : (
                                    <Loading />
                                )}

                                {imageList && imageList[0] && (
                                    <Dialog open={showCrop} onClose={() => setShowCrop(false)} fullWidth maxWidth="md">
                                        <DialogContent>
                                            <CropDialogContent
                                                theme={theme}
                                                image={imageList[0].dataURL}
                                                onCropComplete={onCropComplete}
                                                crop={crop}
                                                zoom={zoom}
                                                setCrop={setCrop}
                                                setZoom={setZoom}
                                            />
                                        </DialogContent>
                                        <DialogActions>
                                            <LoadingButton
                                                variant="contained"
                                                color="secondary"
                                                loading={isLoading}
                                                className="w-20 mr-4 bg-gray-600 text-white rounded-xl shadow-sm duration-300 hover:bg-gray-900"
                                                onClick={uploadImage}
                                            >
                                                Confirm
                                            </LoadingButton>
                                        </DialogActions>
                                    </Dialog>
                                )}
                            </>
                        )}
                    </ImageUploading>
                </Box>
            )}
        </Box>
    );
};

export default ProfileBanner;
