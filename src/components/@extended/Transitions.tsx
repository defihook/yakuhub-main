import React, { Ref, ExoticComponent, ReactElement } from 'react';

// material-ui
import { Collapse, Fade, Box, Grow, Slide, Zoom } from '@mui/material';

// ==============================|| TRANSITIONS ||============================== //

interface TSProps {
    children?: ReactElement;
    position?: string;
    sx?: React.CSSProperties;
    in?: boolean;
    type?: string;
    direction?: 'up' | 'right' | 'left' | 'down';
    [others: string]: any;
}

const Transitions = React.forwardRef(({ children, position, sx, type, direction, ...others }: TSProps, ref: Ref<ExoticComponent>) => {
    const transformOriginMap: any = {
        'top-right': 'top right',
        top: 'top',
        'bottom-left': 'bottom left',
        'bottom-right': 'bottom right',
        bottom: 'bottom',
        'top-left': '0 0 0'
    };
    const positionSX = {
        transformOrigin: transformOriginMap[position || ''] || '0 0 0'
    };

    return (
        <Box ref={ref}>
            {type === 'grow' && (
                <Grow {...others}>
                    <Box sx={positionSX}>{children}</Box>
                </Grow>
            )}
            {type === 'collapse' && (
                <Collapse {...others} sx={positionSX}>
                    {children}
                </Collapse>
            )}
            {type === 'fade' && (
                <Fade
                    {...others}
                    timeout={{
                        appear: 500,
                        enter: 600,
                        exit: 400
                    }}
                >
                    <Box sx={positionSX}>{children}</Box>
                </Fade>
            )}
            {type === 'slide' && (
                <Slide
                    {...others}
                    timeout={{
                        appear: 0,
                        enter: 400,
                        exit: 200
                    }}
                    direction={direction}
                >
                    <Box sx={positionSX}>{children}</Box>
                </Slide>
            )}
            {type === 'zoom' && (
                <Zoom {...others}>
                    <Box sx={positionSX}>{children}</Box>
                </Zoom>
            )}
        </Box>
    );
});

Transitions.defaultProps = {
    type: 'grow',
    position: 'top-left',
    direction: 'up'
};

export default Transitions;