// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, Grid, Tooltip, Typography } from '@mui/material';

// assets
import { IconBrandTwitter, IconBrandDiscord, IconMail, IconBook2 } from '@tabler/icons';

// ==============================|| SOCIAL ICONS ||============================== //

const SocialButton = ({ title, link, icon, label, theme }: any) => (
    <Tooltip title={title}>
        <Button
            sx={{
                ...theme.typography.commonAvatar,
                ...theme.typography.mediumAvatar,
                width: '100%',
                transition: 'all .2s ease-in-out',
                background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.light,
                color: theme.palette.mode === 'dark' ? 'white' : theme.palette.secondary.dark,
                '&[aria-controls="menu-list-grow"],&:hover': {
                    background: theme.palette.mode === 'dark' ? 'white' : theme.palette.secondary.dark,
                    color: theme.palette.mode === 'dark' ? theme.palette.secondary.dark : theme.palette.secondary.light
                }
            }}
            color="inherit"
            onClick={() => window.open(link)}
            startIcon={icon}
        >
            <Typography>{label}</Typography>
        </Button>
    </Tooltip>
);

const SocialSection = () => {
    const theme = useTheme();

    return (
        <>
            <Box
                sx={{
                    mx: 2
                }}
            >
                <Grid container spacing={1}>
                    <Grid item xs={6}>
                        <SocialButton
                            title="Submit feedback"
                            link="https://yaku.canny.io/"
                            icon={<IconMail stroke={1.5} size="1.3rem" />}
                            label="Feedback"
                            theme={theme}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <SocialButton
                            title="Yaku's Twitter"
                            link="https://twitter.com/YakuCorp"
                            icon={<IconBrandTwitter stroke={1.5} size="1.3rem" />}
                            label="Twitter"
                            theme={theme}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <SocialButton
                            title="Yaku's Discord"
                            link="https://discord.com/invite/yakucorp"
                            icon={<IconBrandDiscord stroke={1.5} size="1.3rem" />}
                            label="Discord"
                            theme={theme}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <SocialButton
                            title="Yaku's Docs"
                            link="https://docs.yaku.ai/"
                            icon={<IconBook2 stroke={1.5} size="1.3rem" />}
                            label="Docs"
                            theme={theme}
                        />
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};

export default SocialSection;
