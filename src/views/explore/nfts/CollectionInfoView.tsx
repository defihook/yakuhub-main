import { useParams } from 'react-router-dom';
import { VerifiedSharp } from '@mui/icons-material';
import { Avatar, Badge, Box, Grid, IconButton, Stack, Typography } from '@mui/material';
import { IconBrandDiscord, IconBrandTwitter, IconLink } from '@tabler/icons';
import { IMAGE_PROXY } from 'config/config';
import { round } from 'lodash';

const CollectionInfoView = ({ project, num_of_token_listed, volume_1day, floor_price, num_of_token_holders }: any) => {
    const { chain } = useParams();
    return (
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
                    <Avatar
                        src={`${chain === 'SOL' ? IMAGE_PROXY : ''}${project?.img_url}`}
                        sx={{ width: { sm: 80, md: 80, xs: 200 }, height: { sm: 80, md: 80, xs: 200 } }}
                    />
                </Badge>
                <Stack sx={{ width: { sm: '100%', md: 'auto' } }}>
                    <Grid container alignItems="center" columnSpacing={1} sx={{ flexDirection: { md: 'row', sm: 'row', xs: 'column' } }}>
                        <Grid item>
                            <Typography component="h3" fontWeight={900} sx={{ fontSize: { sm: 18, xs: 24, md: 28 } }}>
                                {project?.display_name}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Grid container>
                                {project?.discord && (
                                    <Grid item>
                                        <IconButton size="small" onClick={() => window.open(project?.discord, '_blank')}>
                                            <IconBrandDiscord />
                                        </IconButton>
                                    </Grid>
                                )}
                                {project?.twitter && (
                                    <Grid item>
                                        <IconButton size="small" onClick={() => window.open(project?.twitter, '_blank')}>
                                            <IconBrandTwitter />
                                        </IconButton>
                                    </Grid>
                                )}
                                {project?.website && (
                                    <Grid item>
                                        <IconButton size="small" onClick={() => window.open(project?.website, '_blank')}>
                                            <IconLink />
                                        </IconButton>
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid
                        container
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
                                mr: { md: 1, sm: 1 },
                                flexBasis: { md: 0 },
                                maxWidth: '100% !important',
                                background: { xs: '#24182f', sm: 'transparent', md: 'transparent' },
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
                            <Typography
                                component="p"
                                sx={{
                                    textAlign: { md: 'left', sm: 'center', xs: 'center' },
                                    whiteSpace: 'nowrap',
                                    fontSize: { md: 20, sm: 18, xs: 18 }
                                }}
                            >
                                {Number(num_of_token_listed).toLocaleString()}/{Number(project?.supply).toLocaleString()}
                            </Typography>
                        </Grid>
                        <Grid
                            item
                            xs={5}
                            sm={3}
                            md={3}
                            sx={{
                                m: { md: 0, sm: 1, xs: 1 },
                                mr: { md: 1, sm: 1 },
                                flexBasis: { md: 0 },
                                maxWidth: '100% !important',
                                background: { xs: '#24182f', sm: 'transparent', md: 'transparent' },
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
                            <Typography
                                component="p"
                                sx={{
                                    textAlign: { md: 'left', sm: 'center', xs: 'center' },
                                    whiteSpace: 'nowrap',
                                    fontSize: { md: 20, sm: 18, xs: 18 }
                                }}
                            >
                                {chain === 'SOL' ? '$' : ''}
                                {Number(volume_1day).toLocaleString()}
                                {chain === 'SOL' ? '' : ' ETH'}
                            </Typography>
                        </Grid>
                        <Grid
                            item
                            xs={5}
                            sm={3}
                            md={3}
                            sx={{
                                m: { md: 0, sm: 1, xs: 1 },
                                mr: { md: 1, sm: 1 },
                                flexBasis: { md: 0 },
                                maxWidth: '100% !important',
                                background: { xs: '#24182f', sm: 'transparent', md: 'transparent' },
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
                            <Typography
                                component="p"
                                sx={{
                                    textAlign: { md: 'left', sm: 'center', xs: 'center' },
                                    whiteSpace: 'nowrap',
                                    fontSize: { md: 20, sm: 18, xs: 18 }
                                }}
                            >
                                {round(Number(floor_price), 3).toLocaleString()} {chain}
                            </Typography>
                        </Grid>
                        {num_of_token_holders && (
                            <Grid
                                item
                                xs={5}
                                sm={3}
                                md={3}
                                sx={{
                                    m: { md: 0, sm: 1, xs: 1 },
                                    mr: { md: 1, sm: 1 },
                                    flexBasis: { md: 0 },
                                    maxWidth: '100% !important',
                                    background: { xs: '#24182f', sm: 'transparent', md: 'transparent' },
                                    borderRadius: 1,
                                    p: 0.5
                                }}
                            >
                                <Typography
                                    component="h6"
                                    fontSize={14}
                                    fontWeight={300}
                                    sx={{
                                        textAlign: { md: 'left', sm: 'center', xs: 'center' },
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Unique Owners
                                </Typography>
                                <Typography
                                    component="p"
                                    sx={{
                                        textAlign: { md: 'left', sm: 'center', xs: 'center' },
                                        whiteSpace: 'nowrap',
                                        fontSize: { md: 20, sm: 18, xs: 18 }
                                    }}
                                >
                                    {Number(num_of_token_holders).toLocaleString()}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Stack>
            </Box>
        </>
    );
};
export default CollectionInfoView;
