import { Dialog, DialogTitle, DialogContent, Box, Avatar, IconButton } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { FileUpload, Person, Article, LocationOn } from '@mui/icons-material';
import ProfileBanner from './ProfileBanner';
import '../../overview.scss';

const EditDialog = ({
    src,
    show,
    setShow,
    handleSave,
    handleUploadBanner,
    loading,
    handleShowSelectNft,
    username,
    handleUsername,
    bio,
    handleBio,
    locale,
    handleLocale
}: any) => (
    <Dialog open={show} onClose={() => setShow(false)} fullWidth maxWidth="md">
        <DialogTitle>
            <div className="flex items-center justify-between pb-2">
                <h2 className="text-2xl">Edit Profile</h2>
                <LoadingButton
                    variant="contained"
                    color="secondary"
                    loading={loading}
                    className="w-20 bg-gray-600 text-white rounded-xl shadow-sm duration-300 hover:bg-gray-900"
                    onClick={handleSave}
                >
                    Save
                </LoadingButton>
            </div>
        </DialogTitle>
        <DialogContent>
            <ProfileBanner height={240} editable upload={handleUploadBanner} />

            <Box
                sx={{
                    mt: { xs: '-50px', md: '-75px' },
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative'
                }}
            >
                <Avatar
                    src={src}
                    sx={{
                        width: { xs: 100, md: 150 },
                        height: { xs: 100, md: 150 },
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
                        width: { xs: 100, md: 150 },
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
                        <FileUpload />
                    </IconButton>
                </Box>
            </Box>

            <div className="mt-8 flex flex-col gap-4">
                <div className="workspace-input">
                    <i className="input-icon">
                        <Person />
                    </i>
                    <input
                        type="text"
                        className="input-field"
                        value={username}
                        onChange={(e) => handleUsername(e.target.value)}
                        placeholder="Vanity"
                        maxLength={30}
                        autoComplete="off"
                    />
                </div>
                <div className="workspace-input">
                    <i className="input-icon">
                        <Article />
                    </i>
                    <input
                        type="text"
                        className="input-field"
                        value={bio}
                        onChange={(e) => handleBio(e.target.value)}
                        placeholder="Bio"
                        maxLength={600}
                        autoComplete="off"
                    />
                </div>
                <div className="workspace-input">
                    <i className="input-icon">
                        <LocationOn />
                    </i>
                    <input
                        type="text"
                        className="input-field"
                        value={locale}
                        onChange={(e) => handleLocale(e.target.value)}
                        placeholder="Location"
                        maxLength={30}
                        autoComplete="off"
                    />
                </div>
            </div>
        </DialogContent>
    </Dialog>
);

export default EditDialog;
