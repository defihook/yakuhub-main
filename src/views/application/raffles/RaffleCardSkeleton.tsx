/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Stack, CardContent, CardMedia, Grid, Button, Typography, Chip, Skeleton } from '@mui/material';
import Image from 'mui-image';

// web3
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

// project imports
import MainCard from 'components/MainCard';
import { YAKU_DECIMALS } from 'config';
import { DEFAULT_PAY_TYPE, IMAGE_PROXY, RAFFLE_REWARD_TYPES, TOKEN_PAY_TYPE } from 'config/config';
import Loading from 'components/Loading';
import { useToasts } from 'hooks/useToasts';
import { RewardCardProps } from 'types/raffles';

// third-party
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import Countdown from 'components/Countdown';
import { each, join, map } from 'lodash';
import { LocalActivityOutlined } from '@mui/icons-material';

const RaffleCardSkeleton = () => (
    <>
        <MainCard
            content={false}
            border={false}
            boxShadow
            sx={{
                '&:hover': {
                    transform: 'scale3d(1.07, 1.07, 1)',
                    transition: '.15s'
                }
            }}
        >
            <CardMedia sx={{ minHeight: 220, alignItems: 'center', display: 'flex' }}>
                <Skeleton height={360} sx={{ width: '100%', aspectRatio: '1 / 1' }} variant="rounded" />
            </CardMedia>
            <CardContent sx={{ p: 2, pb: '16px !important' }}>
                <Box display="flex" sx={{ justifyContent: 'flex-end' }}>
                    <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '.875rem', lineHeight: '32px' }}>
                        &nbsp;
                    </Typography>
                </Box>
                {/* name */}
                <Skeleton width="100%" height={36} />

                {/* tickets remaining / price per ticket */}
                <Box display="flex" justifyContent="space-between">
                    <Stack sx={{ mr: 3 }}>
                        <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '.875rem' }}>
                            <FormattedMessage id="price" />
                        </Typography>
                        <Skeleton width="100%" height={24} />
                    </Stack>
                    <Stack>
                        <Typography fontWeight="700" color="secondary.dark" sx={{ fontSize: '.875rem' }}>
                            <FormattedMessage id="raffle-ticket-remain" />
                        </Typography>

                        <Skeleton width="100%" height={24} />
                    </Stack>
                </Box>

                <Skeleton width="100%" height={32} />
            </CardContent>
        </MainCard>
    </>
);

export default RaffleCardSkeleton;
