/* eslint-disable */
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';

// material-ui
import { CardContent, CardMedia, Box, Typography } from '@mui/material';

// project-imports
import { KeyedObject } from 'types';
import MainCard from 'components/MainCard';
import SkeletonProductPlaceholder from 'components/cards/Skeleton/CardPlaceholder';
import { IMAGE_PROXY } from 'config/config';

interface ProjectCardProps extends KeyedObject {
    image: string;
    name: string;
    description: string;
    onClick?: Function;
    children?: any;
}

const ProjectCard = ({ image, name, description, onClick, children }: ProjectCardProps) => {
    const theme = useTheme();

    const [isLoading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <>
            {isLoading ? (
                <SkeletonProductPlaceholder />
            ) : (
                <MainCard
                    border={false}
                    content={false}
                    sx={{
                        color: theme.palette.primary.light,
                        '&:hover': {
                            cursor: 'pointer',
                            transform: 'scale3d(1.05, 1.05, 1)',
                            transition: '.15s'
                        }
                    }}
                    onClick={onClick}
                >
                    <CardMedia sx={{ height: 250 }} image={`${IMAGE_PROXY}${image}`} title={name} />
                    <CardContent sx={{ p: 2 }}>
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography fontWeight="800" color="secondary" sx={{ mb: 1, fontSize: '1.25rem' }}>
                                {name}
                            </Typography>

                            <Typography color="textSecondary" variant="h6" sx={{ maxHeight: '38px', overflow: 'hidden' }}>
                                {description}
                            </Typography>
                            {children}
                        </Box>
                    </CardContent>
                </MainCard>
            )}
        </>
    );
};

export default ProjectCard;
