import _ from 'lodash';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import LaunchIcon from '@mui/icons-material/Launch';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

function DefiTokenInformation({ tokenData = {} }: any) {
    const { audit_links, gecko_id, category, description, methodology, url, twitter } = tokenData;
    const auditLink = _.get(audit_links, 0);
    const geckoUrl = gecko_id ? `https://www.coingecko.com/en/coins/${gecko_id}` : undefined;
    const twitterUrl = twitter ? `https://twitter.com/${twitter}` : undefined;
    const buttonLinks = [
        {
            label: 'Audit Link',
            url: auditLink
        },
        {
            label: 'View on CoinGecko',
            url: geckoUrl
        },
        {
            label: 'Website',
            url
        },
        {
            label: 'Twitter',
            url: twitterUrl
        }
    ];

    return (
        <MainCard border={false} divider={false} title="Information">
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Typography fontSize={16} fontWeight={900} mb={2}>
                        Protocol Information
                    </Typography>
                    <Typography mb={2}>{description}</Typography>
                    <Typography mb={2}>Category: {category}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        {_.map(buttonLinks, (buttonLink) => {
                            if (buttonLink.url) {
                                return (
                                    <Button color="secondary" key={buttonLink.label} onClick={() => window.open(buttonLink.url, '_blank')}>
                                        {buttonLink.label}
                                    </Button>
                                );
                            }
                            return null;
                        })}
                    </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography fontSize={16} fontWeight={900} mb={2}>
                        Methodology
                    </Typography>
                    <Typography>{methodology}</Typography>
                </Grid>
            </Grid>
        </MainCard>
    );
}

export default DefiTokenInformation;
