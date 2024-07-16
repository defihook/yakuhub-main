import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Grid, useTheme } from '@mui/material';
import MonetizationOnTwoToneIcon from '@mui/icons-material/MonetizationOnTwoTone';
import AccountBalanceTwoToneIcon from '@mui/icons-material/AccountBalanceTwoTone';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import EqualizerTwoToneIcon from '@mui/icons-material/EqualizerTwoTone';
import Sidebar from '../../sidebar';
import RevenueCard from 'components/cards/RevenueCard';
import ShowEmployee from './showEmployees/ShowEmployee';
import ShowProjects from './showEmployees/ShowProjects';

import { useLazyQuery } from '@apollo/client';
import { queries } from '../../../../../graphql/graphql';

export default function Admin() {
    const [selectedProject, setSelectedProject] = useState<string>();
    const [numOfProjects, setNumberOfProject] = useState(0);
    const [totalUSDCBal, setTotalUSDCBal] = useState(0);
    const [totalSolBal, setTotalSolBal] = useState(0);
    const [monthlyPayout, setMonthlyPayout] = useState(0);
    const [notifyProjects, setNofifyProjects] = useState({});
    const theme = useTheme();
    const [workspace, setWorkspace] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const [getWorkspaceById] = useLazyQuery(queries.GET_WORKSPACE_BY_ID);

    const fetchWorkspace = async () => {
        console.log('WORKSPACE_ID: ', id);
        try {
            setLoading(true);
            console.log('WORKSPACE_FETCHING...');
            const { data } = await getWorkspaceById({ variables: { id } });
            console.log('WORKSPACE: ', data.getWorkspaceById);
            setWorkspace(data.getWorkspaceById);
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

    return (
        <div className="vault-container flex">
            <div className="hidden lg:block">
                <Sidebar workspace={workspace} loading={loading} />
            </div>

            <Grid container spacing={2} justifyContent="center" sx={{ p: 2 }}>
                <Grid container spacing={4} sx={{ pb: 3 }}>
                    <Grid item xs={12} lg={3} sm={6}>
                        <RevenueCard
                            primary={<FormattedMessage id="projects" />}
                            secondary={numOfProjects}
                            content={<FormattedMessage id="projects-desc" />}
                            iconPrimary={AccountBalanceTwoToneIcon}
                            iconSx={{
                                top: 'calc((100% - 48px)/2)',
                                '&> svg': { width: 48, height: 48, opacity: '0.5' },
                                [theme.breakpoints.down('sm')]: {
                                    top: 'calc((100% - 32px)/2)',
                                    '&> svg': { width: 32, height: 32 }
                                }
                            }}
                            color={theme.palette.warning.dark}
                        />
                    </Grid>

                    <Grid item xs={12} lg={3} sm={6}>
                        <RevenueCard
                            primary={<FormattedMessage id="total-usdc" />}
                            secondary={totalUSDCBal.toFixed(2)}
                            content={<FormattedMessage id="total-usdc-desc" />}
                            iconPrimary={MonetizationOnTwoToneIcon}
                            iconSx={{
                                top: 'calc((100% - 48px)/2)',
                                '&> svg': { width: 48, height: 48, opacity: '0.5' },
                                [theme.breakpoints.down('sm')]: {
                                    top: 'calc((100% - 32px)/2)',
                                    '&> svg': { width: 32, height: 32 }
                                }
                            }}
                            color={theme.palette.info.dark}
                        />
                    </Grid>

                    <Grid item xs={12} lg={3} sm={6}>
                        <RevenueCard
                            primary={<FormattedMessage id="total-sol" />}
                            secondary={totalSolBal.toFixed(2)}
                            content={<FormattedMessage id="total-sol-desc" />}
                            iconPrimary={EqualizerTwoToneIcon}
                            iconSx={{
                                top: 'calc((100% - 48px)/2)',
                                '&> svg': { width: 48, height: 48, opacity: '0.5' },
                                [theme.breakpoints.down('sm')]: {
                                    top: 'calc((100% - 32px)/2)',
                                    '&> svg': { width: 32, height: 32 }
                                }
                            }}
                            color={theme.palette.secondary.main}
                        />
                    </Grid>

                    <Grid item xs={12} lg={3} sm={6}>
                        <RevenueCard
                            primary={<FormattedMessage id="monthly-outcome" />}
                            secondary={monthlyPayout.toFixed(2)}
                            content={<FormattedMessage id="monthly-outcome-desc" />}
                            iconPrimary={FormatListBulletedTwoToneIcon}
                            iconSx={{
                                top: 'calc((100% - 48px)/2)',
                                '&> svg': { width: 48, height: 48, opacity: '0.5' },
                                [theme.breakpoints.down('sm')]: {
                                    top: 'calc((100% - 32px)/2)',
                                    '&> svg': { width: 32, height: 32 }
                                }
                            }}
                            color={theme.palette.primary.dark}
                        />
                    </Grid>
                </Grid>
                <ShowProjects
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                    setNumberOfProject={setNumberOfProject}
                    setTotalUSDCBal={setTotalUSDCBal}
                    setTotalSolBal={setTotalSolBal}
                    notifyProjects={notifyProjects}
                />
                <ShowEmployee
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                    setMonthlyPayout={setMonthlyPayout}
                    setNofifyProjects={setNofifyProjects}
                />
            </Grid>
        </div>
    );
}
