import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Container, Tab } from '@mui/material';
import { useEffect, useState, lazy } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';
import Loadable from 'components/Loadable';

const TokenCreation = Loadable(lazy(() => import('views/application/token-creation/index')));
const TokenMetadata = Loadable(lazy(() => import('views/tools/TokenMetadata')));
const NftMints = Loadable(lazy(() => import('views/tools/NftMints')));
const HolderSnapshot = Loadable(lazy(() => import('views/tools/HolderSnapshot')));
const MintNft = Loadable(lazy(() => import('views/tools/MintNft')));
const UpdateNft = Loadable(lazy(() => import('views/tools/UpdateNft')));
const ArweaveUpload = Loadable(lazy(() => import('views/tools/ArweaveUpload')));
const UpdateToken = Loadable(lazy(() => import('views/tools/UpdateToken')));

export default function NFTTools() {
    const navigate = useNavigate();
    const { tab } = useParams();
    const [tabIdx, setTabIdx] = useState<string>(tab || 'token-metadata');
    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setTabIdx(newValue);
        navigate(`/tools/${newValue}`);
    };

    useEffect(() => {
        if (tab) {
            setTabIdx(tab);
        }
    }, [tab]);
    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <TabContext value={tabIdx}>
                {/* <TabList
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        width: '100%',
                        '.MuiTabs-root': {
                            width: '100%'
                        },
                        '.MuiTabs-flexContainer': { borderBottom: 'none', justifyContent: { xs: 'flex-start', md: 'center' } }
                    }}
                    textColor="secondary"
                    indicatorColor="secondary"
                >
                    <Tab label={<FormattedMessage id="token-metadata" />} id="tokenMetadataTab" value="token-metadata" />
                    <Tab label={<FormattedMessage id="nft-mints" />} id="nftMintsTab" value="nft-mints" />
                    <Tab label={<FormattedMessage id="holder-snapshot" />} id="holderSnapshotTab" value="holder-snapshot" />
                    <Tab label={<FormattedMessage id="update-nft" />} id="updateNftTab" value="update-nft" />
                    <Tab label={<FormattedMessage id="arweave-upload" />} id="arweaveUploadTab" value="arweave-upload" />
                    <Tab label={<FormattedMessage id="mint-nft" />} id="mintNftTab" value="mint-nft" />
                    <Tab label={<FormattedMessage id="token-creation" />} id="tokenCreationTab" value="token-creation" />
                    <Tab label={<FormattedMessage id="update-token" />} id="updateTokenTab" value="update-token" />
                </TabList> */}
                <TabPanel value="token-metadata">
                    <TokenMetadata />
                </TabPanel>
                <TabPanel value="nft-mints">
                    <NftMints />
                </TabPanel>
                <TabPanel value="holder-snapshot">
                    <HolderSnapshot />
                </TabPanel>
                <TabPanel value="update-nft">
                    <UpdateNft />
                </TabPanel>
                <TabPanel value="arweave-upload">
                    <ArweaveUpload />
                </TabPanel>
                <TabPanel value="mint-nft">
                    <MintNft />
                </TabPanel>
                <TabPanel value="token-creation">
                    <TokenCreation />
                </TabPanel>
                <TabPanel value="update-token">
                    <UpdateToken />
                </TabPanel>
            </TabContext>
        </Container>
    );
}
