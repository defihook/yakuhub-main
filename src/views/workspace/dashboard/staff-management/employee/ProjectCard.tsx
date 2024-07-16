import { Grid, Button, Divider, CardContent, useTheme, Box, Typography, Chip } from '@mui/material';
import { useState } from 'react';
import { mutations } from '../../../../../graphql/graphql';
import { useToasts } from 'hooks/useToasts';
import MainCard from 'components/MainCard';
import SkeletonProductPlaceholder from 'components/cards/Skeleton/CardPlaceholder';
import { FormattedMessage } from 'react-intl';
import useAuthMutation from 'hooks/useAuthMutation';

const ProjectCard = ({ time: datetime, project, wallet, method, amount, period, employer, refresh }: any) => {
    const [clickClaim] = useAuthMutation(mutations.CLAIM);
    const theme = useTheme();
    const now = new Date();
    const time = new Date(datetime);
    const [canClaim, setCanClaim] = useState(true);
    const { showSuccessToast, showErrorToast } = useToasts();
    const onClaim = async () => {
        if (time >= now) {
            showErrorToast("Can't claim until payment date");
            return;
        }
        setCanClaim(false);
        try {
            const res = await clickClaim({
                variables: { project, wallet, method, employer }
            });
            const txHash = res.data.clickClaim;
            if (txHash) {
                console.log('Transaction:', txHash);
                showSuccessToast('Transaction Success');
            }
        } catch (err) {
            showErrorToast(`${project}: Transaction failed.`);
            console.error(err);
        } finally {
            refresh();
            setCanClaim(true);
        }
    };
    return (
        <>
            {project ? (
                <MainCard
                    border={false}
                    divider={false}
                    content={false}
                    boxShadow
                    sx={{
                        background: theme.palette.mode === 'dark' ? '#09080d' : theme.palette.primary.light,
                        '&:hover': {
                            transform: 'scale3d(1.03, 1.03, 1)',
                            transition: '.15s'
                        }
                    }}
                >
                    <CardContent sx={{ p: 2, pb: '16px !important' }}>
                        {/* project */}
                        <Box display="flex" alignItems="center">
                            <Typography
                                fontWeight="800"
                                color="secondary"
                                sx={{ fontSize: '1.175rem', display: 'block', textDecoration: 'none', mr: 'auto' }}
                            >
                                {project}
                            </Typography>
                        </Box>

                        {/* Amount */}
                        <Grid item xs={12} sx={{ mb: '10px', mt: '5px', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Chip label={`${amount} ${method}`} size="small" color={method === 'SOL' ? 'secondary' : 'info'} />
                            <Chip label={`${period}`} size="small" color="success" />
                        </Grid>

                        <Grid item xs={12} sx={{ mb: '10px', mt: '5px', display: 'flex', justifyContent: 'space-between' }}>
                            <Typography component="p">
                                <FormattedMessage id="upcoming-payment-date" />
                            </Typography>
                            <Typography component="p">{time.toLocaleString()}</Typography>
                        </Grid>

                        <Divider sx={{ mb: '10px' }} />

                        {/* Management Buttons */}
                        <Grid item xs={12}>
                            <Grid container spacing={1}>
                                <Grid item xs={12}>
                                    {time < now ? (
                                        <Button variant="contained" onClick={onClaim} sx={{ p: 2 }} fullWidth disabled={!canClaim}>
                                            {canClaim ? <FormattedMessage id="claim" /> : <FormattedMessage id="in-progress" />}
                                        </Button>
                                    ) : (
                                        <Button variant="contained" sx={{ p: 2 }} fullWidth disabled>
                                            <FormattedMessage id="wait-till-upcoming-date" />
                                        </Button>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                </MainCard>
            ) : (
                <SkeletonProductPlaceholder />
            )}
        </>
    );
};

export default ProjectCard;
