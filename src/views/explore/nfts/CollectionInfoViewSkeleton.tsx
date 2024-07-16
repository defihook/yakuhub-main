import { VerifiedSharp } from '@mui/icons-material';
import { Badge, Box, Grid, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import { IconBrandDiscord, IconBrandTwitter, IconLink } from '@tabler/icons';

const CollectionInfoViewSkeleton = () => (
    <>
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 3,
                flexDirection: { md: 'row', sm: 'row', xs: 'column' }
            }}
        >
            <Badge
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
                badgeContent={<VerifiedSharp color="info" />}
            >
                <Skeleton variant="circular" sx={{ width: { sm: 80, md: 80, xs: 200 }, height: { sm: 80, md: 80, xs: 200 } }} />
            </Badge>
            <Stack>
                <Grid container alignItems="center" columnSpacing={1} sx={{ flexDirection: { md: 'row', sm: 'row', xs: 'column' } }}>
                    <Grid item>
                        <Skeleton variant="rounded" width={120} height={28} />
                    </Grid>
                    <Grid item>
                        <Grid container>
                            <Grid item>
                                <IconButton size="small">
                                    <IconBrandDiscord />
                                </IconButton>
                            </Grid>
                            <Grid item>
                                <IconButton size="small">
                                    <IconBrandTwitter />
                                </IconButton>
                            </Grid>
                            <Grid item>
                                <IconButton size="small">
                                    <IconLink />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid
                    container
                    columnSpacing={4}
                    alignItems="center"
                    sx={{ mt: { md: 1, sm: 1, xs: 1 } }}
                    className="max-sm:items-center max-sm:justify-center"
                >
                    <Grid
                        item
                        xs={5}
                        sm={3}
                        md={3}
                        sx={{
                            m: { md: 0, sm: 1, xs: 1 },
                            borderRadius: 1,
                            p: 0.5
                        }}
                    >
                        <Typography
                            component="h6"
                            fontSize={14}
                            fontWeight={300}
                            sx={{ textAlign: { md: 'left', sm: 'center', xs: 'center' }, whiteSpace: 'nowrap' }}
                        >
                            Listed
                        </Typography>
                        <Skeleton variant="rounded" width={60} sx={{ height: { xs: 16, sm: 18, md: 20 }, m: 'auto' }} />
                    </Grid>
                    <Grid
                        item
                        xs={5}
                        sm={3}
                        md={3}
                        sx={{
                            m: { md: 0, sm: 1, xs: 1 },
                            borderRadius: 1,
                            p: 0.5
                        }}
                    >
                        <Typography
                            component="h6"
                            fontSize={14}
                            fontWeight={300}
                            sx={{ textAlign: { md: 'left', sm: 'center', xs: 'center' }, whiteSpace: 'nowrap' }}
                        >
                            1 Day Volume
                        </Typography>
                        <Skeleton variant="rounded" width={60} sx={{ height: { xs: 16, sm: 18, md: 20 }, m: 'auto' }} />
                    </Grid>
                    <Grid
                        item
                        xs={5}
                        sm={3}
                        md={3}
                        sx={{
                            m: { md: 0, sm: 1, xs: 1 },
                            borderRadius: 1,
                            p: 0.5
                        }}
                    >
                        <Typography
                            component="h6"
                            fontSize={14}
                            fontWeight={300}
                            sx={{ textAlign: { md: 'left', sm: 'center', xs: 'center' }, whiteSpace: 'nowrap' }}
                        >
                            Floor price
                        </Typography>
                        <Skeleton variant="rounded" width={60} sx={{ height: { xs: 16, sm: 18, md: 20 }, m: 'auto' }} />
                    </Grid>
                    <Grid
                        item
                        xs={5}
                        sm={3}
                        md={3}
                        sx={{
                            m: { md: 0, sm: 1, xs: 1 },
                            borderRadius: 1,
                            p: 0.5
                        }}
                    >
                        <Typography
                            component="h6"
                            fontSize={14}
                            fontWeight={300}
                            sx={{ textAlign: { md: 'left', sm: 'center', xs: 'center' }, whiteSpace: 'nowrap' }}
                        >
                            Unique Owners
                        </Typography>
                        <Skeleton variant="rounded" width={60} sx={{ height: { xs: 16, sm: 18, md: 20 }, m: 'auto' }} />
                    </Grid>
                </Grid>
            </Stack>
        </Box>
    </>
);

export default CollectionInfoViewSkeleton;
