import { useState, FormEvent, Dispatch, SetStateAction } from 'react';
import { Button } from '@mui/material';
import { Person, Work, Add, Delete } from '@mui/icons-material';

interface UsersFormProps {
    setStep: Dispatch<SetStateAction<number>>;
    users: any[];
    setUsers: Dispatch<SetStateAction<any[]>>;
}

const UsersForm = ({ setStep, users, setUsers }: UsersFormProps) => {
    const [isNew, setNew] = useState<boolean>(false);
    const [address, setAddress] = useState<string>('');
    const [role, setRole] = useState<string>('');

    const deleteUser = (idx: number) => {
        users.splice(idx, 1);
        setUsers([...users]);
    };

    const onAddUser = () => {
        if (isNew) {
            if (address !== '' && role !== '') {
                setUsers([
                    ...users,
                    {
                        address,
                        role
                    }
                ]);
                setAddress('');
                setRole('');
            }
        } else {
            setNew(true);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isNew) {
            if (address !== '' && role !== '') {
                setUsers([
                    ...users,
                    {
                        address,
                        role
                    }
                ]);
                setStep(3);
            }
        } else {
            setStep(3);
        }
    };

    return (
        <div className="create-box">
            <div className="create-box-header">
                <h3 className="secondary-title pb-4">Add users</h3>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="users-box">
                    <div className="form-header ml-4">
                        <h3 className="secondary-title">Add initial WorkSpace users</h3>
                        <p className="detail-text text-muted">Add users</p>
                    </div>

                    {/* Existing users */}
                    {users.map((el, idx) => (
                        <div key={idx} className="lg:flex justify-between pt-1">
                            <div className="workspace-input mt-3 flex-grow lg:mr-1">
                                <i className="input-icon">
                                    <Person />
                                </i>
                                <input type="text" className="input-field" value={el.address} placeholder="Address" readOnly />
                            </div>

                            <div className="workspace-input mt-3 flex-grow lg:ml-1">
                                <i className="input-icon">
                                    <Work />
                                </i>
                                <input type="text" className="input-field" value={el.role} placeholder="Role" readOnly />
                                <button type="button" className="input-icon-right bg-transparent" onClick={() => deleteUser(idx)}>
                                    <Delete />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* New user */}
                    {isNew && (
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
                                />
                                <button type="button" className="input-icon-right bg-transparent" onClick={() => setNew(false)}>
                                    <Delete />
                                </button>
                            </div>
                        </div>
                    )}

                    <Button variant="contained" className="dark-btn w-full mt-5" onClick={onAddUser}>
                        <Add sx={{ fontSize: 22 }} />
                        <span className="ml-2">Add User</span>
                    </Button>
                </div>

                {/* Back and Next buttons */}
                <div className="flex mt-5">
                    <Button variant="contained" className="dark-btn flex-1 mr-2" onClick={() => setStep(1)}>
                        Back
                    </Button>
                    <Button variant="contained" type="submit" className="blue-btn flex-1 ml-2">
                        Next
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default UsersForm;
