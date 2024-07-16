import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import { Add } from '@mui/icons-material';
import EmptyBox from './components/empty-box';
import WorkSpaceBox from './components/workspace-box';
import LogoBlue from 'assets/images/workspace/logo-blue.svg';

import { useLazyQuery } from '@apollo/client';
import { queries } from '../../graphql/graphql';

const WorkSpaces = () => {
    const [workspaces, setWorkspaces] = useState<any[]>();
    const [loading, setLoading] = useState<boolean>(false);
    const [getAllWorkspaces] = useLazyQuery(queries.GET_ALL_WORKSPACES);

    const fetchWorkspaces = async () => {
        const address = JSON.parse(localStorage.getItem('address') || '{}');
        console.log('CURRENT_USER: ', address);
        try {
            setLoading(true);
            console.log('ALL_WORKSPACES_FETCHING...');
            const { data } = await getAllWorkspaces({ variables: { owner: address } });
            console.log('WORKSPACES: ', data.getAllWorkspaces);
            setWorkspaces(data.getAllWorkspaces);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    return (
        <div className="mid-container">
            <div className="flex justify-between items-center">
                <h2 className="primary-title">Your WorkSpaces</h2>
                <Link to="/workspaces/create">
                    <Button variant="contained" className="create-btn blue-btn px-4">
                        <Add sx={{ fontSize: 22 }} />
                        <span className="hidden md:block ml-2 mr-1">Create WorkSpace</span>
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="mt-20 text-center">
                    <CircularProgress color="secondary" />
                </div>
            ) : (
                <>
                    {workspaces && workspaces.length === 0 ? (
                        <EmptyBox
                            icon={LogoBlue}
                            title="You don't have any WorkSpaces yet"
                            detail='Click on "Create WorkSpace" to set one up in a few clicks!'
                        />
                    ) : (
                        <div className="mt-6">
                            {workspaces &&
                                workspaces.map((el, idx) => (
                                    <Link key={idx} to={`/workspaces/vault/${el.id}`}>
                                        <WorkSpaceBox
                                            key={idx}
                                            name={el.name}
                                            description={el.description}
                                            image={el.image}
                                            users={el.users.length}
                                            balance={el.balance || '0.03'}
                                        />
                                    </Link>
                                ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default WorkSpaces;
