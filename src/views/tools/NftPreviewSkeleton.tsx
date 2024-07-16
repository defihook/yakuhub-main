/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable import/prefer-default-export */
import { Card, CardMedia, CardContent, Typography, Skeleton } from '@mui/material';

export function NftPreviewSkeleton() {
    return (
        <Card sx={{ width: '100%', height: '100%' }}>
            <CardMedia sx={{ minHeight: 128, display: 'flex', position: 'relative' }}>
                <Skeleton sx={{ aspectRatio: '1 / 1', width: '100%', minHeight: 240 }} variant="rectangular" />
            </CardMedia>
            <CardContent
                sx={{
                    backgroundColor: 'transparent'
                }}
            >
                <Skeleton sx={{ width: '100%', height: 18 }} variant="rounded" />
            </CardContent>
        </Card>
    );
}
