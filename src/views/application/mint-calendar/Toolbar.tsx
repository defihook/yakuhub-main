// material-ui
import { Button, Grid, IconButton, Stack, Tooltip, Typography, GridProps, ToggleButtonGroup, ToggleButton, useTheme } from '@mui/material';

// third-party
import { format } from 'date-fns';

// assets
import { IconChevronLeft, IconChevronRight, IconLayoutGrid, IconLayoutList } from '@tabler/icons';
import { RefreshOutlined } from '@mui/icons-material';

// ==============================|| CALENDAR TOOLBAR ||============================== //

interface ToolbarProps {
    date: number | Date;
    onClickNext: () => void;
    onClickPrev: () => void;
    onClickToday: () => void;
    onClickChangeView: (name: string) => void;
    onClickChangeFilter: (val: string) => void;
    onClickRefresh: () => Promise<void>;
    filter: string;
    sx?: GridProps['sx'];
}

const Toolbar = ({
    date,
    onClickNext,
    onClickPrev,
    onClickToday,
    onClickChangeView,
    onClickChangeFilter,
    onClickRefresh,
    filter,
    sx,
    ...others
}: ToolbarProps) => {
    const theme = useTheme();
    return (
        <Grid alignItems="center" container justifyContent="space-between" spacing={3} {...others} sx={{ pb: 3 }}>
            <Grid item>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        sx={{ backgroundColor: 'rgba(36, 24, 47, 0.85)', borderRadius: 30000 }}
                        onClick={onClickToday}
                    >
                        Today
                    </Button>
                    <Tooltip title="Day Grid Month">
                        <IconButton onClick={(e) => onClickChangeView('dayGridMonth')} size="large">
                            <IconLayoutGrid />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="List Week">
                        <IconButton onClick={(e) => onClickChangeView('listWeek')} size="large">
                            <IconLayoutList />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Reload">
                        <IconButton onClick={(e) => onClickRefresh()} size="large">
                            <RefreshOutlined />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Grid>
            <Grid item>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <ToggleButtonGroup
                        sx={{
                            '& .MuiToggleButtonGroup-grouped': { border: 0 },
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(36, 24, 47, 0.85)' : '#fff',
                            borderRadius: 30000,
                            overflow: 'hidden'
                        }}
                        exclusive
                        color="secondary"
                        value={filter}
                        onChange={(_e: any, v: string) => onClickChangeFilter(v)}
                    >
                        <ToggleButton value="all">All Mints</ToggleButton>
                        <ToggleButton value="nft">Favorited Mints</ToggleButton>
                    </ToggleButtonGroup>
                </Stack>
            </Grid>
            <Grid item>
                <Stack direction="row" alignItems="center" spacing={3}>
                    <IconButton onClick={onClickPrev} size="large">
                        <IconChevronLeft />
                    </IconButton>
                    <Typography variant="h3" color="textPrimary">
                        {format(date, 'MMMM yyyy')}
                    </Typography>
                    <IconButton onClick={onClickNext} size="large">
                        <IconChevronRight />
                    </IconButton>
                </Stack>
            </Grid>
        </Grid>
    );
};

export default Toolbar;
