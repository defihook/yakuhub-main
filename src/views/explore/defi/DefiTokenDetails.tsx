import _ from 'lodash';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { Assignment, Twitter, Language, Reddit } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';

function DefiTokenInformation({ tokenData = {} }: any) {
    const name = _.get(tokenData, 'name');
    const description = _.get(tokenData, 'description.en');
    const id = _.get(tokenData, 'id');
    const officialWebsite = _.get(tokenData, 'links.official_forum_url[0]');
    const reddit = _.get(tokenData, 'links.subreddit_url');

    const geckoUrl = id ? `https://www.coingecko.com/en/coins/${id}` : undefined;
    const twitterUrl = id ? `https://twitter.com/${id}` : undefined;

    const buttonLinks = [
        {
            icon: <Assignment sx={{ fontSize: 20, marginRight: 1 }} />,
            label: 'View on CoinGecko',
            url: geckoUrl
        },
        {
            icon: <Language sx={{ fontSize: 20, marginRight: 1 }} />,
            label: 'Official website',
            url: officialWebsite
        },
        {
            icon: <Reddit sx={{ fontSize: 20, marginRight: 1 }} />,
            label: 'Reddit',
            url: reddit
        },
        {
            icon: <Twitter sx={{ fontSize: 20, marginRight: 1 }} />,
            label: 'Twitter',
            url: twitterUrl
        }
    ];

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
                <MainCard border={false} divider={false} sx={{ height: '100%' }}>
                    <Typography fontSize={20} fontWeight={900} mb={2}>
                        {name} overview
                    </Typography>
                    <Typography mb={2} dangerouslySetInnerHTML={{ __html: description }} />
                    {/* <Typography mb={2}>Category: {category}</Typography> */}
                    <Grid container>
                        {_.map(buttonLinks, (buttonLink) => {
                            if (buttonLink.url) {
                                return (
                                    <Grid item xs={6} sm={3}>
                                        <Button
                                            color="secondary"
                                            key={buttonLink.label}
                                            onClick={() => window.open(buttonLink.url, '_blank')}
                                            sx={{
                                                textAlign: { xs: 'left', sm: 'center' },
                                                my: { xs: '5px', sm: '0px' },
                                                paddingLeft: { xs: '15px', sm: '8px' },
                                                alignItems: { xs: 'start', sm: 'center' },
                                                justifyContent: { xs: 'start', sm: 'center' },
                                                width: '100%'
                                            }}
                                        >
                                            {buttonLink.icon}
                                            {buttonLink.label}
                                        </Button>
                                    </Grid>
                                );
                            }
                            return null;
                        })}
                    </Grid>
                </MainCard>
            </Grid>
            <Grid item xs={12} md={4}>
                <MainCard border={false} divider={false} sx={{ height: '100%' }}>
                    <Typography fontSize={20} fontWeight={900} mb={2}>
                        Social activities to com
                    </Typography>
                    <Typography>{}</Typography>
                </MainCard>
            </Grid>
        </Grid>
    );
}

export default DefiTokenInformation;
