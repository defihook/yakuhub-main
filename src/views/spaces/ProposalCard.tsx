import { Link } from 'react-router-dom';

// material ui
import { useTheme } from '@mui/material/styles';
import { Box, CardContent, Chip, Typography, Stack, Avatar, Tooltip } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

// project imports
import SkeletonProductPlaceholder from 'components/cards/Skeleton/CardPlaceholder';
import MainCard from 'components/cards/MainCard';
import { shortenAddress } from 'utils/utils';

// types
import { KeyedObject } from 'types';

// constants
const MAX_LENGTH = 310;

interface ProposalCardProps extends KeyedObject {
    space: any;
    proposal: any;
    image: string | null;
}

const ProposalCard = ({ space, proposal, image, loading }: ProposalCardProps) => {
    const theme = useTheme();

    return (
        <>
            {loading ? (
                <SkeletonProductPlaceholder />
            ) : (
                <Link
                    to={{
                        pathname: `/spaces/${space.symbol}/proposal/${proposal.id}`
                    }}
                    style={{ textDecoration: 'none' }}
                >
                    <MainCard
                        content={false}
                        sx={{
                            mb: 3,
                            backgroundColor: '#030614',
                            color: theme.palette.primary.light,
                            '&:hover': {
                                transform: 'scale3d(1.02, 1.02, 1)',
                                transition: 'all .4s ease-in-out'
                            }
                        }}
                    >
                        <CardContent sx={{ p: '16px !important' }}>
                            <Box display="flex" alignItems="center">
                                <Stack direction="row" justifyContent="space-around" alignItems="center" sx={{ mr: 'auto' }}>
                                    <Avatar
                                        src={space.avatar}
                                        sx={{
                                            width: '28px !important',
                                            height: '28px !important'
                                        }}
                                        color="inherit"
                                    />
                                    <Typography
                                        variant="subtitle1"
                                        color="primary"
                                        sx={{ ml: 1, display: 'block', textDecoration: 'none' }}
                                    >
                                        {space.symbol} by
                                        <strong>
                                            <Link
                                                to="/under-construction"
                                                // to={`/account/${proposal.author}/portfolio`}
                                                style={{ textDecoration: 'none', marginLeft: 5, color: '#ffffff' }}
                                            >
                                                {shortenAddress(proposal.author, 7)}
                                            </Link>
                                        </strong>
                                    </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                    {proposal.type ? (
                                        <Tooltip title="Proposed by the Core Team" arrow>
                                            <Chip
                                                color="info"
                                                label={<span>Core</span>}
                                                icon={<CheckCircle fontSize="small" />}
                                                sx={{ borderRadius: '40px !important' }}
                                            />
                                        </Tooltip>
                                    ) : (
                                        <Chip color="secondary" label={<span>Community</span>} sx={{ borderRadius: '40px !important' }} />
                                    )}
                                    <Chip
                                        color={proposal.status ? 'success' : 'primary'}
                                        label={<span>{proposal.status ? 'Open' : 'Closed'}</span>}
                                        sx={{ borderRadius: '40px !important' }}
                                    />
                                </Stack>
                            </Box>

                            {/* name */}
                            <Box display="flex" alignItems="center" sx={{ my: 1 }}>
                                <Typography variant="h3" color="inherit" sx={{ display: 'block', textDecoration: 'none' }}>
                                    {proposal.title}
                                </Typography>
                            </Box>

                            {/* creation date */}
                            {/* <Box display="flex" alignItems="center">
                                <Typography color="inherit" sx={{ display: 'block', textDecoration: 'none', mr: 'auto' }}>
                                    {moment(proposal.createdAt).format('MMMM DD, yyyy')}
                                </Typography>
                            </Box> */}

                            {/* Description */}
                            <Box display="flex" alignItems="center">
                                {proposal.description.length > MAX_LENGTH ? (
                                    <Typography
                                        variant="subtitle1"
                                        color="primary"
                                        sx={{ display: 'block', textDecoration: 'none', mr: 'auto' }}
                                    >
                                        {`${proposal.description.substring(0, MAX_LENGTH)}...`}
                                    </Typography>
                                ) : (
                                    <Typography
                                        variant="subtitle1"
                                        color="primary"
                                        sx={{ display: 'block', textDecoration: 'none', mr: 'auto' }}
                                    >
                                        {proposal.description}
                                    </Typography>
                                )}
                            </Box>
                        </CardContent>
                    </MainCard>
                </Link>
            )}
        </>
    );
};

export default ProposalCard;
