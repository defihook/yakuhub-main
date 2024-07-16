/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigate } from 'react-router-dom';

import { Box, Stack, CardContent, CardMedia, Grid, Button, Typography, Chip } from '@mui/material';
import Image from 'mui-image';

// project imports
import MainCard from 'components/MainCard';
import { IMAGE_PROXY } from 'config/config';
import Loading from 'components/Loading';

// third-party
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import Countdown from 'components/Countdown';
import { join, map } from 'lodash';
import { LocalActivityOutlined } from '@mui/icons-material';
import { shortenAddress } from 'utils/utils';

const RaffleCard = ({
    name,
    image,
    raffleKey,
    raffleData: { price, payType, end, tickets, myTickets, maxTickets, isRevealed, winnerCnt, winners }
}: any) => {
    const navigate = useNavigate();

    return (
        <>
            <MainCard
                content={false}
                border={false}
                boxShadow
                sx={{
                    '&:hover': {
                        transform: 'scale3d(1.07, 1.07, 1)',
                        transition: '.15s'
                    },
                    cursor: 'pointer'
                }}
                onClick={() => navigate(`/applications/raffles/${raffleKey}`)}
            >
                <CardMedia sx={{ minHeight: 220, alignItems: 'center', display: 'flex' }}>
                    <Image
                        src={`${IMAGE_PROXY}${image}` || ''}
                        alt={name}
                        showLoading={<Loading />}
                        style={{ aspectRatio: '1 / 1', filter: end <= new Date().getTime() ? 'grayscale(1)' : 'none' }}
                    />
                </CardMedia>
                <CardContent sx={{ p: 2, pb: '16px !important' }}>
                    <Box display="flex" sx={{ justifyContent: 'flex-end' }}>
                        <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '.875rem', lineHeight: '32px' }}>
                            &nbsp;
                        </Typography>
                        {/* <Chip label={getRewardTypeLabel(rewardType)} color={rewardChipColor[rewardType] || 'primary'} /> */}
                        {myTickets.length > 0 && <Chip icon={<LocalActivityOutlined />} label={`${myTickets.length}`} color="primary" />}
                    </Box>
                    {/* name */}
                    <Typography fontWeight="700" color="inherit" sx={{ fontSize: '1.25rem', pb: '4px' }}>
                        {name}
                    </Typography>

                    {/* tickets remaining / price per ticket */}
                    {!isRevealed && (
                        <Box display="flex" justifyContent="space-between">
                            <Stack sx={{ mr: 3 }}>
                                <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '.875rem' }}>
                                    <FormattedMessage id="price" />
                                </Typography>
                                <Typography fontWeight="700" color="inherit" sx={{ fontSize: '1.25rem', pb: '4px' }}>
                                    {price} {payType}
                                </Typography>
                            </Stack>
                            <Stack>
                                <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '.875rem' }}>
                                    <FormattedMessage id="raffle-ticket-remain" />
                                </Typography>
                                {maxTickets - tickets === 0 ? (
                                    <Typography
                                        fontWeight="700"
                                        color="success.dark"
                                        sx={{ fontSize: '1.25rem', pb: '4px', textAlign: 'end' }}
                                    >
                                        <FormattedMessage id="sold-out" />
                                    </Typography>
                                ) : (
                                    <Typography fontWeight="700" color="success" sx={{ fontSize: '1.25rem', pb: '4px', textAlign: 'end' }}>
                                        {maxTickets - tickets} / {maxTickets}
                                    </Typography>
                                )}
                            </Stack>
                        </Box>
                    )}

                    {!isRevealed && (
                        <Box display="flex" justifyContent="flex-end" sx={{ pb: 2 }}>
                            <Stack>
                                <Typography fontWeight="700" sx={{ fontSize: '1rem' }}>
                                    <Countdown
                                        endDateTime={new Date(end)}
                                        renderer={({ days, hours, minutes, seconds, completed }: any) => {
                                            if (completed) {
                                                // Render a completed state
                                                return <FormattedMessage id="closed" />;
                                            }
                                            // Render a countdown
                                            return (
                                                <span>
                                                    <FormattedMessage id="end-in" /> {days} <FormattedMessage id="days" /> {hours}{' '}
                                                    <FormattedMessage id="hrs" /> {minutes} <FormattedMessage id="mins" /> {seconds}{' '}
                                                    <FormattedMessage id="secs" />
                                                </span>
                                            );
                                        }}
                                    />
                                </Typography>
                            </Stack>
                        </Box>
                    )}
                    {isRevealed && winnerCnt > 0 && (
                        <Box
                            sx={{
                                borderWidth: '2px',
                                borderStyle: 'solid',
                                borderColor: 'rgba(245,158,11,1)',
                                py: 1,
                                mb: 2.5,
                                borderRadius: '16px',
                                textAlign: 'center'
                            }}
                        >
                            <Typography component="div" fontWeight={700} sx={{ mb: 1, color: 'rgba(245,158,11,1)' }}>
                                <FormattedMessage id={winnerCnt === 1 ? 'raffle-winner' : 'raffle-winners'} />
                            </Typography>
                            <>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Typography
                                        component="div"
                                        sx={{
                                            fontSize: '0.875rem',
                                            fontWeight: 700,
                                            color: 'inherit'
                                        }}
                                    >
                                        {join(
                                            map(winners, (winner) => shortenAddress(winner?.address ?? '', 4)),
                                            ', '
                                        )}
                                    </Typography>
                                </Box>
                            </>
                        </Box>
                    )}
                    {/* Management Buttons */}
                    <Grid item xs={12}>
                        {moment() > moment(end) ? (
                            <Button variant="outlined" color="primary" sx={{ borderRadius: 3 }} fullWidth>
                                <FormattedMessage id="view-raffle" />
                            </Button>
                        ) : (
                            <Button variant="outlined" color="secondary" sx={{ borderRadius: 3 }} fullWidth>
                                <FormattedMessage id="view-raffle" />
                            </Button>
                        )}
                    </Grid>
                </CardContent>
            </MainCard>
        </>
    );
};

export default RaffleCard;
