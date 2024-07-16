/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';

// material-ui
import {
    Grid,
    Typography,
    Stack,
    OutlinedInput,
    TextField,
    Button,
    DialogContent,
    DialogTitle,
    Divider,
    Avatar,
    DialogActions
} from '@mui/material';
import { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import moment from 'moment';
import { mutations } from '../../../graphql/graphql';
import useAuthMutation from 'hooks/useAuthMutation';
import { useToasts } from 'hooks/useToasts';

// assets
import { IconDeviceFloppy, IconPhoto, IconX } from '@tabler/icons';

// ==============================|| CALENDAR EVENT ADD / EDIT / DELETE ||============================== //

const CreateDropModal = ({ drop, onCancel, reload, selectedDate }: any) => {
    const [mintTitle, setMintTitle] = useState<string>('');
    const [mintSupply, setMintSupply] = useState<string>('');
    const [mintDatetime, setMintDatetime] = useState<Dayjs | null>(null);
    const [mintLogo, setMintLogo] = useState<any>();
    const [previousLogo, setPreviousLogo] = useState<string>('');
    const [previousTitle, setPreviousTitle] = useState<string>('');
    const [isValidFileSize, setIsValidFileSize] = useState<boolean>(true);
    const [CreateUserMint] = useAuthMutation(mutations.CREATE_USER_MINT);
    const [UpdateUserMint] = useAuthMutation(mutations.UPDATE_USER_MINT);
    const { showSuccessToast } = useToasts();
    const FILE_SIZE_LIMIT = 100 * 1024; // 100kb

    const getBase64Size = (image: any): number => {
        let y = 1;
        if (image.endsWith('==')) {
            y = 2;
        }
        const x_size = image.length * (3 / 4) - y;
        return x_size;
    };

    const toBase64 = (file: any) =>
        new Promise((resolve, reject) => {
            if (!file) resolve('');
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const str: any = reader.result;
                const size: number = getBase64Size(str);
                setIsValidFileSize(size < FILE_SIZE_LIMIT);
                resolve(str);
            };
            reader.onerror = (error) => reject(error);
        });

    useEffect(() => {
        if (drop) {
            setMintTitle(drop.title);
            setPreviousTitle(drop.title);
            setMintSupply(drop.supply);
            setMintDatetime(drop.date);
            setPreviousLogo(drop.logo);
        }
    }, []);

    useEffect(() => {
        if (mintLogo) {
            setIsValidFileSize(mintLogo.size < FILE_SIZE_LIMIT);

            const reader = new FileReader();
            reader.readAsDataURL(mintLogo);
            reader.onload = () => {
                const str: any = reader.result;
                const size: number = getBase64Size(str);
                setIsValidFileSize(size < FILE_SIZE_LIMIT);
            };
        }
    }, [mintLogo]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!mintTitle || !mintSupply || !mintDatetime || !isValidFileSize) {
            return;
        }

        if (!drop) {
            const imageUrl = await toBase64(mintLogo);
            const d = moment(`${moment(selectedDate).format('YYYY-MM-DD')} ${mintDatetime?.format('HH:mm:ss')}`).format();
            CreateUserMint({
                variables: { title: mintTitle, supply: mintSupply, date: d, logo: imageUrl }
            }).then(() => {
                onCancel();
                showSuccessToast(`New mint "${mintTitle}" created.`);
                reload();
            });
        } else {
            const imageUrl = mintLogo ? await toBase64(mintLogo) : previousLogo;
            const d = mintDatetime.format
                ? moment(mintDatetime.format('YYYY-MM-DD HH:mm:ss')).format()
                : moment(mintDatetime.toString()).format();
            UpdateUserMint({
                variables: { previousTitle, title: mintTitle, supply: mintSupply, date: d, logo: imageUrl }
            }).then(() => {
                onCancel();
                showSuccessToast(`Mint updated successfully.`);
                reload();
            });
        }
    };

    const handleCancel = () => {
        onCancel();
    };

    return (
        <>
            <DialogTitle>Create NFT Mint</DialogTitle>
            <Divider />
            <DialogContent>
                <OutlinedInput
                    placeholder="Title"
                    style={{ width: '100%', marginBottom: 7, marginTop: 7 }}
                    autoFocus
                    value={mintTitle}
                    onChange={(e) => setMintTitle(e.target.value)}
                />
                <OutlinedInput
                    placeholder="Supply"
                    style={{ width: '100%', marginBottom: 7, marginTop: 7 }}
                    type="number"
                    value={mintSupply}
                    onChange={(e) => setMintSupply(e.target.value)}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                        renderInput={(props) => (
                            <TextField
                                style={{ width: '100%', marginBottom: 7, marginTop: 7 }}
                                {...props}
                                variant="outlined"
                                error={false}
                            />
                        )}
                        value={mintDatetime}
                        onChange={(newValue) => setMintDatetime(newValue)}
                    />
                </LocalizationProvider>
                <Button
                    component="label"
                    variant="outlined"
                    color="primary"
                    startIcon={<IconPhoto />}
                    style={{
                        width: '100%',
                        marginBottom: 7,
                        marginTop: 7
                    }}
                >
                    {previousLogo ? 'Choose Different Logo/Icon' : 'Choose Logo/Icon'}
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => setMintLogo(e.target?.files?.length === 1 ? e.target?.files[0] : null)}
                    />
                </Button>
                <Typography variant="caption" color={isValidFileSize ? 'text' : 'error'} mt={2}>
                    File size should be less then 100KB
                </Typography>
                {previousLogo && (
                    <Stack direction="row" alignItems="center" justifyContent="center">
                        <Avatar
                            alt=""
                            src={previousLogo}
                            sx={{
                                borderRadius: '16px',
                                width: 100,
                                height: 100
                            }}
                        />
                    </Stack>
                )}
            </DialogContent>
            <Divider />
            <DialogActions>
                <Grid container justifyContent="center" alignItems="center">
                    <Grid item>
                        <Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
                            <Button
                                onClick={handleCancel}
                                variant="outlined"
                                color="primary"
                                startIcon={<IconX />}
                                style={{
                                    width: '100%',
                                    marginBottom: 7,
                                    marginTop: 7
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                variant="outlined"
                                color="primary"
                                startIcon={<IconDeviceFloppy />}
                                style={{
                                    width: '100%',
                                    marginBottom: 7,
                                    marginTop: 7
                                }}
                            >
                                Save
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </DialogActions>
        </>
    );
};

export default CreateDropModal;
