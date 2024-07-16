import { useState, ReactElement } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Avatar, CardContent, Button, Grid, Dialog, Tooltip } from '@mui/material';
import { AddCircle } from '@mui/icons-material';

// project imports
import { useToasts } from 'hooks/useToasts';
import { abbreviateValue } from 'utils/utils';
import SkeletonProductPlaceholder from 'components/cards/Skeleton/CardPlaceholder';
import MainCard from 'components/MainCard';
import ProposalCard from './ProposalCard';
import AddProposalForm from './AddProposalForm';

// graphql
import { mutations, queries } from '../../graphql/graphql';
import { useWallet } from '@solana/wallet-adapter-react';

// third party
import { FormikValues } from 'formik';
import moment from 'moment';
import useAuthQuery from 'hooks/useAuthQuery';
import useAuthMutation from 'hooks/useAuthMutation';

const SpacePage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { symbol } = useParams();
    const { publicKey } = useWallet();
    const { showInfoToast, showErrorToast } = useToasts();

    // GRAPHQL QUERIES
    // eslint-disable-next-line object-shorthand
    const { data, loading } = useAuthQuery(queries.GET_SPACE, { variables: { symbol: symbol }, fetchPolicy: 'cache-and-network' });
    const { data: proposals } = useAuthQuery(queries.GET_PROPOSALS_FOR_SPACE, {
        variables: { id: data.space.id },
        fetchPolicy: 'cache-and-network'
    });

    // GRAPHQL MUTATIONS
    const [CreateProposal] = useAuthMutation(mutations.CREATE_PROPOSAL);

    // modal/dialog related shit
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleProposalCreate = async (projectData: FormikValues) => {
        const { title, description, discussion } = projectData;
        const author = publicKey?.toBase58();
        const postedIn = data.space.id;

        const type = data.space.owner === author || false;
        const status = true;
        const endsAt = moment().add('days', 5);

        CreateProposal({
            variables: { author, title, description, discussion, status, type, postedIn, endsAt }
        }).then(
            (res) => {
                navigate(`/spaces/${symbol}/proposal/${res.data.createProposal.id}`);
            },
            (err) => {
                showErrorToast('An error has occured while submitting your proposal, please try again.');
            }
        );

        showInfoToast(`You have added a new proposal: ${projectData.title}`);
        handleModalClose();
    };

    const handleAddProposal = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    let spaceProposals: ReactElement | ReactElement[] = <></>;
    if (proposals && proposals.proposalsIn && proposals.proposalsIn.length > 0) {
        spaceProposals = proposals.proposalsIn.map((proposal: any, index: any) => (
            <Grid key={index} item xs={12}>
                <ProposalCard space={data.space} proposal={proposal} image={null} />
            </Grid>
        ));
    } else {
        spaceProposals = (
            <Grid container sx={{ mt: 5, mb: 5 }}>
                <Grid item xs={12}>
                    <Box sx={{ maxWidth: 720, m: '0 auto', textAlign: { xs: 'left', sm: 'center' } }}>
                        <Grid container justifyContent="center" spacing={2}>
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography variant="h1" color="inherit" component="div">
                                            There are no proposals, create one.
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            color="secondary"
                                            variant="contained"
                                            sx={{ borderRadius: '4px' }}
                                            onClick={handleAddProposal}
                                        >
                                            <AddCircle fontSize="small" sx={{ mr: 0.75 }} />
                                            New Proposal
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        );
    }

    return (
        <>
            {loading ? (
                <SkeletonProductPlaceholder />
            ) : (
                <>
                    <Grid item sx={{ mb: 3 }}>
                        <MainCard
                            sx={{
                                color: theme.palette.primary.light
                            }}
                        >
                            <CardContent sx={{ p: '0 !important', justifyContent: 'center' }}>
                                {/* avatar */}
                                <Box display="flex" justifyContent="flex-start">
                                    <Tooltip title="Click to create a Proposal" arrow onClick={handleAddProposal}>
                                        <Avatar
                                            src={data.space.avatar}
                                            sx={{
                                                borderRadius: '16px',
                                                width: '182px !important',
                                                height: '182px !important',
                                                '&:hover': {
                                                    cursor: 'pointer'
                                                }
                                            }}
                                            color="inherit"
                                        />
                                    </Tooltip>

                                    {/* space name/members */}
                                    <Box display="flex" flexDirection="column" justifyContent="flex-start" sx={{ pl: 2, pt: 2 }}>
                                        <Typography
                                            variant="h2"
                                            fontWeight="600"
                                            color="inherit"
                                            sx={{ display: 'block', marginBottom: '5px !important' }}
                                        >
                                            {data.space.name}
                                        </Typography>

                                        <Typography
                                            variant="body1"
                                            color="inherit"
                                            sx={{ display: 'block', marginBottom: '5px !important', flexShrink: 1 }}
                                        >
                                            {data.space.description}
                                        </Typography>

                                        <Typography
                                            variant="h4"
                                            fontWeight="500"
                                            color="primary"
                                            sx={{ lineHeight: '24px', display: 'block', marginBottom: '12px !important' }}
                                        >
                                            {abbreviateValue(data.space.members.length)} MEMBER(S)
                                        </Typography>

                                        {/* <Button
                                            color="secondary"
                                            variant="contained"
                                            sx={{ borderRadius: '4px' }}
                                            onClick={handleAddProposal}
                                        >
                                            <AddCircle fontSize="small" sx={{ mr: 0.75 }} />
                                            New Proposal
                                        </Button> */}
                                    </Box>
                                </Box>
                            </CardContent>

                            {/* Dialog renders its body even if not open */}
                            <Dialog
                                maxWidth="sm"
                                fullWidth
                                onClose={handleModalClose}
                                open={isModalOpen}
                                sx={{ '& .MuiDialog-paper': { p: 0 } }}
                            >
                                {isModalOpen && (
                                    <AddProposalForm space={data.space} onCancel={handleModalClose} handleCreate={handleProposalCreate} />
                                )}
                            </Dialog>
                        </MainCard>
                    </Grid>

                    {loading
                        ? [1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                              <Grid key={item} item xs={12} sm={6} md={4} lg={3}>
                                  <SkeletonProductPlaceholder />
                              </Grid>
                          ))
                        : spaceProposals}
                </>
            )}
        </>
    );
};

export default SpacePage;
