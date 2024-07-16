import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, CircularProgress, Dialog } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Add, ContentCopy, Delete, Person, Work } from '@mui/icons-material';
import { shortenAddress } from 'utils/utils';
import EmptyBox from '../../components/empty-box';
import Sidebar from '../sidebar';
import LogoBlue from 'assets/images/workspace/logo-blue.svg';
import { useToasts } from 'hooks/useToasts';

import { useLazyQuery } from '@apollo/client';
import useAuthMutation from 'hooks/useAuthMutation';
import { queries, mutations } from '../../../../graphql/graphql';

const Users = () => {
    const [workspace, setWorkspace] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const [add, setAdd] = useState<boolean>(false);
    const [address, setAddress] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const [getWorkspaceById] = useLazyQuery(queries.GET_WORKSPACE_BY_ID);
    const [addUser] = useAuthMutation(mutations.ADD_USER);
    const [deleteUser] = useAuthMutation(mutations.DELETE_USER);
    const { showInfoToast } = useToasts();

    const fetchWorkspace = async () => {
        console.log('WORKSPACE_ID: ', id);
        try {
            setLoading(true);
            console.log('WORKSPACE_FETCHING...');
            const { data } = await getWorkspaceById({ variables: { id } });
            console.log('WORKSPACE: ', data.getWorkspaceById);
            setWorkspace(data.getWorkspaceById);
            setUsers(data.getWorkspaceById.users);
        } catch (err) {
            console.error(err);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspace();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (add) {
            if (address !== '' && role !== '') {
                const user = {
                    address,
                    role
                };
                console.log('NEW_USER: ', user);
                try {
                    setSubmitting(true);
                    console.log('USER_ADDING...');
                    const { data } = await addUser({ variables: { id, user } });
                    setUsers(data.addUser.users);
                    console.log('USER_ADDED! :)');
                    setOpen(false);
                } catch (err) {
                    console.error(err);
                } finally {
                    setSubmitting(false);
                }
            }
        } else {
            console.log('DELETE_USER: ', address);
            try {
                setSubmitting(true);
                console.log('USER_DELETING...');
                const { data } = await deleteUser({ variables: { id, address } });
                setUsers(data.deleteUser.users);
                console.log('USER_DELETED! :)');
                setOpen(false);
            } catch (err) {
                console.error(err);
            } finally {
                setSubmitting(false);
            }
        }
    };

    const copyAddress = (text: string) => {
        navigator.clipboard.writeText(text);
        showInfoToast('Copied the user address to the clipboard');
    };

    return (
        <div className="vault-container flex">
            <div className="hidden lg:block">
                <Sidebar workspace={workspace} loading={loading} />
            </div>

            <div className="mid-container mt-0">
                <div className="flex justify-between items-center mt-2 mb-7">
                    <h2 className="primary-title ml-2">Users</h2>
                    <Button
                        variant="contained"
                        className="create-btn blue-btn px-4"
                        onClick={() => {
                            setOpen(true);
                            setAdd(true);
                        }}
                    >
                        <Add sx={{ fontSize: 22 }} />
                        <span className="hidden md:block ml-2 mr-1">Add user</span>
                    </Button>

                    <Dialog className="user-dialog" open={open} onClose={() => setOpen(false)}>
                        <div className="header mb-2 pb-4">
                            <h3 className="text-base font-semibold">{add ? 'Add a user' : 'Delete this user?'}</h3>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="lg:flex justify-between pt-1">
                                <div className="workspace-input mt-3 flex-grow lg:mr-1">
                                    <i className="input-icon">
                                        <Person />
                                    </i>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Address"
                                        required
                                        readOnly={!add}
                                    />
                                </div>

                                <div className="workspace-input mt-3 flex-grow lg:ml-1">
                                    <i className="input-icon">
                                        <Work />
                                    </i>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        placeholder="Role"
                                        required
                                        readOnly={!add}
                                    />
                                </div>
                            </div>

                            <div className="flex mt-5">
                                <Button variant="contained" className="dark-btn flex-1 mr-2" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <LoadingButton variant="contained" loading={submitting} type="submit" className="blue-btn flex-1 ml-2">
                                    {add ? 'Add' : 'Delete'}
                                </LoadingButton>
                            </div>
                        </form>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="mt-20 text-center">
                        <CircularProgress color="secondary" />
                    </div>
                ) : (
                    <>
                        {users.length === 0 ? (
                            <EmptyBox
                                icon={LogoBlue}
                                title="This WorkSpace doesn't have any users yet"
                                detail='Click on "Add User" to add one in a few clicks!'
                            />
                        ) : (
                            <>
                                {users.map((el, idx) => (
                                    <div
                                        key={idx}
                                        className={`vault-box flex justify-between items-center mb-4 py-3 ${idx !== 0 && `top-border`}`}
                                    >
                                        <div className="mr-auto">
                                            <h3 className="secondary-title hidden md:block">{el.address}</h3>
                                            <h3 className="secondary-title md:hidden">{shortenAddress(el.address)}</h3>
                                        </div>

                                        <div className="flex items-center gap-2 md:gap-4">
                                            <Button variant="contained" className="dark-btn" onClick={() => copyAddress(el.address)}>
                                                <ContentCopy sx={{ fontSize: 16 }} />
                                            </Button>
                                            <Button
                                                variant="contained"
                                                className="dark-btn"
                                                onClick={() => {
                                                    setOpen(true);
                                                    setAdd(false);
                                                    setAddress(el.address);
                                                    setRole(el.role);
                                                }}
                                            >
                                                <Delete sx={{ fontSize: 16 }} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Users;
