import { Box, Button, Card, CardContent, CardMedia, Skeleton, Typography } from '@mui/material';

const NFTCardSkeleton = () => (
    <>
        <Card sx={{ width: '100%' }}>
            <CardMedia sx={{ minHeight: 120, display: 'flex', position: 'relative' }}>
                <Skeleton sx={{ aspectRatio: '1 / 1', width: '100%', minHeight: 240 }} variant="rectangular" />
            </CardMedia>
            <CardContent>
                <Skeleton sx={{ width: '100%', height: 18 }} variant="rounded" />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
                    <Skeleton width={18} height={18} variant="circular" />
                    <Skeleton sx={{ width: 80, height: 18 }} variant="rounded" />
                    <Button sx={{ ml: 'auto', borderRadius: 30 }} color="secondary" variant="contained" disabled>
                        <Typography component="p" noWrap>
                            Buy
                        </Typography>
                    </Button>
                </Box>
            </CardContent>
        </Card>
    </>
);

export default NFTCardSkeleton;
