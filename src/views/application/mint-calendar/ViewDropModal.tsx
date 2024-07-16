// material-ui
import {
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Stack,
    Avatar,
    Typography,
    Box,
    IconButton,
    useTheme
} from '@mui/material';

// project imports
import { gridSpacing } from 'store/constant';
import SupplyStat from './SupplyStat';
import PriceStat from './PriceStat';

// assets
import LanguageIcon from '@mui/icons-material/Language';
import { IconBrandDiscord, IconTrash, IconPencil, IconBrandTwitter } from '@tabler/icons';
import moment from 'moment';
import { mutations } from '../../../graphql/graphql';
import useAuthMutation from 'hooks/useAuthMutation';
import { useToasts } from 'hooks/useToasts';

// ==============================|| CALENDAR EVENT ADD / EDIT / DELETE ||============================== //

interface AddDropFormProps {
    drop: any;
    onCancel: () => void;
    reload: () => void;
    edit: () => void;
}

const DEFAULT_IMAGE_URL = `https://ik.imagekit.io/g1noocuou2/Yakushima_Studios/tr:w-200/Logo4K.png?ik-sdk-version=javascript-1.4.3&updatedAt=1657556475258`;

const ViewDropModal = ({ drop, onCancel, reload, edit }: AddDropFormProps) => {
    const theme = useTheme();
    const [RemoveUserMint] = useAuthMutation(mutations.REMOVE_USER_MINT);
    const { showSuccessToast } = useToasts();
    const isUserMint = (!drop?.name && drop?.title && true) || false;
    const mintTitle = drop?.name || drop?.title;

    const handleDelete = (e: any) => {
        e.preventDefault();
        if (!mintTitle) return;
        RemoveUserMint({
            variables: { title: mintTitle }
        }).then(() => {
            onCancel();
            showSuccessToast(`Mint "${mintTitle}" deleted successfully.`);
            reload();
        });
    };

    const handleEdit = (e: any) => {
        e.preventDefault();
        edit();
    };

    return (
        <>
            <DialogTitle>
                <Grid container alignItems="center">
                    <Grid item xs={8}>
                        <Box display="flex" justifyContent="flex-start">
                            {(isUserMint && (
                                <>
                                    {drop?.title} ({moment(drop?.date).utc().format('HH:mm')} UTC)
                                </>
                            )) || (
                                <>
                                    {drop?.name} ({drop?.time})
                                </>
                            )}
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box display="flex" justifyContent="flex-end">
                            {isUserMint && (
                                <>
                                    <IconButton aria-label="edit" onClick={handleEdit}>
                                        <IconPencil />
                                    </IconButton>
                                    <IconButton aria-label="delete" color="error" onClick={handleDelete}>
                                        <IconTrash />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 3 }}>
                <Grid container spacing={gridSpacing}>
                    {/* Collection Image */}
                    <Grid item xs={4}>
                        <Avatar
                            alt={drop?.name}
                            src={drop?.image || drop?.logo || DEFAULT_IMAGE_URL}
                            sx={{
                                borderRadius: '16px',
                                width: { xs: 72, sm: 100, md: 172 },
                                height: { xs: 72, sm: 100, md: 172 }
                            }}
                        />
                    </Grid>

                    {/* Stats */}
                    <Grid item xs={8}>
                        <SupplyStat value={drop?.nft_count || drop.supply} />
                        <PriceStat value={drop?.price} />
                    </Grid>
                    {/* <Grid item xs={4}>
                    <PriceStat value={drop?.price} />
                </Grid> */}
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography variant="body2">{drop?.extra}</Typography>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Grid container justifyContent="center" alignItems="center">
                    <Grid item>
                        <Stack direction="row" spacing={2} alignItems="center">
                            {drop?.twitter && (
                                <a href={drop?.twitter} target="_blank" rel="noreferrer">
                                    <Avatar
                                        variant="rounded"
                                        sx={{
                                            ...theme.typography.commonAvatar,
                                            ...theme.typography.mediumAvatar,
                                            transition: 'all .2s ease-in-out',
                                            background:
                                                theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.light,
                                            color: '#00acee',
                                            '&[aria-controls="menu-list-grow"],&:hover': {
                                                background: '#00acee',
                                                color:
                                                    theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.secondary.light
                                            }
                                        }}
                                        color="inherit"
                                    >
                                        <IconBrandTwitter />
                                    </Avatar>
                                </a>
                            )}
                            {drop?.website && (
                                <a href={drop?.website} target="_blank" rel="noreferrer">
                                    <Avatar
                                        variant="rounded"
                                        sx={{
                                            ...theme.typography.commonAvatar,
                                            ...theme.typography.mediumAvatar,
                                            transition: 'all .2s ease-in-out',
                                            background:
                                                theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.light,
                                            color: '#f38aff',
                                            '&[aria-controls="menu-list-grow"],&:hover': {
                                                background: '#f38aff',
                                                color:
                                                    theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.secondary.light
                                            }
                                        }}
                                        color="inherit"
                                    >
                                        <LanguageIcon />
                                    </Avatar>
                                </a>
                            )}
                            {drop?.discord && (
                                <a href={drop?.discord} target="_blank" rel="noreferrer">
                                    <Avatar
                                        variant="rounded"
                                        sx={{
                                            ...theme.typography.commonAvatar,
                                            ...theme.typography.mediumAvatar,
                                            transition: 'all .2s ease-in-out',
                                            background:
                                                theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.light,
                                            color: '#7289da',
                                            '&[aria-controls="menu-list-grow"],&:hover': {
                                                background: '#7289da',
                                                color:
                                                    theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.secondary.light
                                            }
                                        }}
                                        color="inherit"
                                    >
                                        <IconBrandDiscord />
                                    </Avatar>
                                </a>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </DialogActions>
        </>
    );
};

export default ViewDropModal;
