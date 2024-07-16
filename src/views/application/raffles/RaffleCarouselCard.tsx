/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigate } from 'react-router-dom';

import { Box, Stack, CardContent, CardMedia, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Image from 'mui-image';

// web3
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

// project imports
import MainCard from 'components/MainCard';
import { RewardCardProps } from 'types/raffles';

// third-party
import { IMAGE_PROXY, RAFFLE_REWARD_TYPES, TOKEN_PAY_TYPE } from 'config/config';
import { FormattedMessage } from 'react-intl';
import Loading from 'components/Loading';
import Countdown from 'components/Countdown';
import { each, round } from 'lodash';

const RaffleCarouselCard = ({
    name,
    image,
    family,
    raffleKey,
    raffleData: { price, payType, end, tickets, rewardType, maxTickets }
}: any) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const getRewardTypeLabel = (rwType: number) => {
        let rewardTypeKey = 'nft';
        each(Object.keys(RAFFLE_REWARD_TYPES), (key) => {
            if (RAFFLE_REWARD_TYPES[key] === rwType) {
                rewardTypeKey = key;
                return false;
            }
            return true;
        });
        const labelMapping: Record<string, string> = {
            nft: 'NFT',
            whitelist: 'WL',
            spl: TOKEN_PAY_TYPE
        };
        return labelMapping[rewardTypeKey];
    };
    const rewardChipColor: Array<'default' | 'primary' | 'secondary' | 'info' | 'warning' | 'error' | 'success'> = [
        'primary',
        'secondary',
        'info'
    ];

    return (
        <>
            <MainCard
                content={false}
                border={false}
                boxShadow
                sx={{
                    border: `4px solid transparent !important`,
                    '&:hover': {
                        transition: 'all .2s ease-in-out',
                        border: `4px solid ${theme.palette.secondary.dark} !important`
                    }
                }}
                onClick={() => navigate(`/applications/raffles/${raffleKey}`)}
            >
                <CardMedia sx={{ minHeight: 220, alignItems: 'center', display: 'flex' }}>
                    <Image
                        src={`${IMAGE_PROXY}${image}`}
                        alt={name}
                        showLoading={<Loading />}
                        style={{ aspectRatio: '1 / 1', filter: end <= new Date().getTime() ? 'grayscale(1)' : 'none' }}
                    />
                </CardMedia>
                <CardContent sx={{ p: 2, pb: '16px !important' }}>
                    {/* collection family */}
                    <Box display="flex" sx={{ justifyContent: 'space-between' }}>
                        <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '.875rem' }}>
                            {family}
                        </Typography>

                        <Chip label={getRewardTypeLabel(rewardType)} color={rewardChipColor[rewardType] || 'primary'} />
                    </Box>

                    {/* name */}
                    <Typography fontWeight="700" color="inherit" sx={{ fontSize: '1.25rem', pb: '4px' }}>
                        {name}
                    </Typography>

                    {/* tickets remaining / price per ticket */}
                    <Box display="flex" justifyContent="space-between">
                        <Stack sx={{ mr: 3 }}>
                            <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '.875rem' }}>
                                <FormattedMessage id="raffle-ticket-remain" />
                            </Typography>
                            {maxTickets - tickets === 0 ? (
                                <Typography fontWeight="700" color="success.dark" sx={{ fontSize: '1.25rem', pb: '4px' }}>
                                    <FormattedMessage id="sold-out" />
                                </Typography>
                            ) : (
                                <Typography fontWeight="700" color="success" sx={{ fontSize: '1.25rem', pb: '4px' }}>
                                    {maxTickets - tickets} / {maxTickets}
                                </Typography>
                            )}
                        </Stack>
                        <Stack sx={{ mr: 3 }}>
                            <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '.875rem' }}>
                                <FormattedMessage id="price" />
                            </Typography>
                            <Typography fontWeight="700" color="inherit" sx={{ fontSize: '1.25rem', pb: '4px' }}>
                                {price} {payType}
                            </Typography>
                        </Stack>
                    </Box>

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
                </CardContent>
            </MainCard>
        </>
    );
};

export default RaffleCarouselCard;
