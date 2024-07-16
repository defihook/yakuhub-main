/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate, useParams } from 'react-router-dom';
import { queries } from '../../../graphql/graphql';
import {
    Avatar,
    Box,
    Button,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Tab,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { ArrowDownwardOutlined, RefreshOutlined } from '@mui/icons-material';
import MainCard from 'components/MainCard';
import { TabContext, TabList } from '@mui/lab';
import { useState, useEffect } from 'react';
import _, { includes, map } from 'lodash';
import PagedList from 'components/PagedList';
import NFTProjectRow from 'components/NFTProjectRow';
import { IconSortAscending, IconSortDescending } from '@tabler/icons';
import SolanaLogo from 'assets/images/icons/solana-logo.png';
import EthLogo from 'assets/images/blockchains/ethereum-icon.png';
import NFTProjectRowSkeleton from 'components/NFTProjectRowSkeleton';
import { useSelector } from 'store';
import { useMeta } from 'contexts/meta/meta';
import { useLazyQuery } from '@apollo/client';

const SortingArrow = ({ fieldNames, orderBy, ordering }: any) => (
    <>
        {includes(fieldNames, orderBy) ? (
            <ArrowDownwardOutlined sx={{ fontSize: 14, transform: ordering === 'ASC' ? 'rotate(180deg)' : 'none' }} />
        ) : (
            <></>
        )}
    </>
);

function NFTsHome() {
    const theme = useTheme();
    const { sticky } = useMeta();
    const navigate = useNavigate();
    const { chain } = useParams();
    const [tabIdx, setTabIdx] = useState('All');
    const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));
    const defaultVariables = {
        field_name: 'market_cap',
        sort_order: 'DESC',
        page_number: 1,
        page_size: 50,
        chain
    };
    const orderFieldsList = [
        {
            label: 'Market Cap.',
            value: 'market_cap'
        },
        {
            label: 'Volume (7D)',
            value: 'volume_7day'
        },
        {
            label: 'Volume Change (1D)',
            value: 'volume_1day_change'
        },
        {
            label: 'Floor Price',
            value: 'floor_price'
        },
        {
            label: 'Floor Price Change (1D)',
            value: 'floor_price_1day_change'
        },
        {
            label: 'Average Price',
            value: 'average_price'
        },
        {
            label: 'Average Price Change (1D)',
            value: 'average_price_1day_change'
        },
        {
            label: 'Number of Listed',
            value: 'num_of_token_listed'
        },
        {
            label: '% of Listed',
            value: 'percentage_of_token_listed'
        },
        {
            label: 'Volume (1D)',
            value: 'volume_1day'
        }
    ];
    const orderFieldsListETH = [
        {
            label: 'All Time Volume',
            value: 'allTimeVolume'
        },
        {
            label: '1 Day Volume',
            value: '1DayVolume'
        },
        {
            label: '7 Day Volume',
            value: '7DayVolume'
        },
        {
            label: '30DayVolume',
            value: '30DayVolume'
        },
        {
            label: 'Created At',
            value: 'createdAt'
        }
    ];
    const [isLoading, setIsLoading] = useState(true);
    const [variables, setVariables] = useState<any>({ ...defaultVariables });
    const [projects, setProjects] = useState<any>([]);
    const [masterProjects, setMasterProjects] = useState<any>([[]]);
    const [orderBy, setOrderBy] = useState<string>(chain === 'SOL' ? 'market_cap' : 'allTimeVolume');
    const [ordering, setOrdering] = useState('DESC');
    const { drawerOpen } = useSelector((state: any) => state.menu);
    const [getProjectStats] = useLazyQuery(queries.GET_PROJECTS_STATS, {
        variables: defaultVariables
    });

    useEffect(() => {
        chain === 'SOL' ? setOrderBy('market_cap') : setOrderBy('allTimeVolume');
    }, [chain]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setMasterProjects([[]]);
        setProjects([]);
        if (newValue !== 'All') {
            setVariables({ ...defaultVariables, tags: [newValue] });
        } else {
            setVariables({ ...defaultVariables });
        }
        setTabIdx(newValue);
    };
    const handleFilterChange = (event: any) => {
        const {
            target: { value }
        } = event;
        if (value === variables.field_name) {
            setVariables({ ...variables, sort_order: ordering === 'DESC' ? 'ASC' : 'DESC' });
            setOrdering(ordering === 'DESC' ? 'ASC' : 'DESC');
            return;
        }
        setVariables({ ...variables, field_name: value, sort_order: 'DESC' });
        setOrderBy(value);
        setOrdering('DESC');
    };

    const updatePage = async (page = variables.page_number, forceReload = false) => {
        console.log('update', page);
        setIsLoading(true);

        const { data: refreshData } = await getProjectStats({
            variables: {
                ...variables,
                chain,
                field_name: orderBy,
                sort_order: ordering,
                page_number: page
            }
        });

        if (refreshData?.getProjectStats) {
            const { pagination_info, project_stats } = refreshData?.getProjectStats;
            if (forceReload) {
                const master = [...Array(pagination_info.total_page_number).keys()].map((i) => Array(pagination_info.current_page_size));
                master[page - 1] = project_stats;
                setProjects([...project_stats]);
                setMasterProjects(master);
                console.log('force reload');
            } else if (masterProjects.length !== pagination_info.total_page_number) {
                console.log('reset master list');
                setProjects([]);
                const master = [...Array(pagination_info.total_page_number).keys()].map((i) => Array(pagination_info.current_page_size));
                master[page - 1] = project_stats;
                setMasterProjects(master);
                setProjects([...project_stats]);
            } else {
                masterProjects[page - 1] = project_stats;
                setMasterProjects([...masterProjects]);
                setProjects([...project_stats]);
            }
        }
        setIsLoading(false);
    };

    const toggleOrdering = () => {
        setOrdering(ordering === 'DESC' ? 'ASC' : 'DESC');
    };

    const getPage = (page: number) => {
        setVariables({
            ...variables,
            page_number: page
        });
        updatePage(page);
    };
    useEffect(() => {
        setIsLoading(true);
        updatePage(1, true);
    }, [ordering, orderBy, tabIdx, chain]);

    const defaultBgColor = theme.palette.mode === 'dark' ? '#120c18' : '#fff';
    const header = (
        <Grid
            container
            sx={{
                marginLeft: '-8px',
                alignItems: 'center',
                justifyContent: 'flex-end',
                display: { xs: 'none', md: 'flex' },
                position: sticky > 108 ? 'fixed' : 'initial',
                top: 77,
                backgroundColor: sticky > 108 ? defaultBgColor : 'transparent',
                left: drawerOpen ? 260 : 70,
                paddingLeft: sticky > 108 ? '20px' : 0,
                right: 0,
                paddingRight: sticky > 108 ? '20px' : '8px',
                width: sticky > 108 ? `calc(100% - ${drawerOpen ? '260px' : '70px'} - 12px)` : '100%',
                zIndex: 400
            }}
        >
            <Grid item xs={1} sm={1} md={1} lg={0.5} xl={0.5} sx={{ textAlign: 'center', p: 1 }}>
                #
            </Grid>
            <Grid item xs={8} sm={4} md={4} lg={2.5} xl={3.5} sx={{ p: 1 }}>
                <Typography component="h6" fontWeight={700}>
                    Collection and supply
                </Typography>
            </Grid>
            <Grid
                item
                xs={4}
                sm={2}
                md={1}
                lg={1}
                xl={1}
                sx={{ p: 1, textAlign: { xs: 'end', sm: 'start' }, cursor: chain === 'SOL' ? 'pointer' : 'initial' }}
                onClick={() => chain === 'SOL' && handleFilterChange({ target: { value: 'floor_price' } })}
            >
                <Typography
                    component="p"
                    sx={{ fontSize: 12, alignItems: 'center', display: 'flex', justifyContent: 'flex-start', gap: 0.5 }}
                    noWrap
                >
                    Floor Price <SortingArrow {...{ orderBy, fieldNames: ['floor_price'], ordering }} />
                </Typography>
            </Grid>
            <Grid
                item
                xs={8}
                sm={2}
                md={2}
                lg={2}
                xl={1}
                sx={{ textAlign: { xs: 'end', sm: 'start' }, p: 1, cursor: 'pointer' }}
                onClick={() => handleFilterChange({ target: { value: chain === 'ETH' ? 'allTimeVolume' : 'market_cap' } })}
            >
                <Typography
                    component="p"
                    sx={{ fontSize: 12, alignItems: 'center', display: 'flex', justifyContent: 'center', gap: 0.5 }}
                    noWrap
                >
                    Market Cap. <SortingArrow {...{ orderBy, fieldNames: ['market_cap', 'allTimeVolume'], ordering }} />
                </Typography>
            </Grid>
            <Grid
                item
                xs={4}
                sm={2}
                md={2}
                lg={1}
                xl={1}
                sx={{ textAlign: { xs: 'end', md: 'center' }, p: 1, cursor: chain === 'SOL' ? 'pointer' : 'initial' }}
                onClick={() => handleFilterChange({ target: { value: 'floor_price_1day_change' } })}
            >
                <Typography
                    component="p"
                    sx={{ fontSize: 12, alignItems: 'center', display: 'flex', justifyContent: 'center', gap: 0.5 }}
                    noWrap
                >
                    Floor 24h % <SortingArrow {...{ orderBy, fieldNames: ['floor_price_1day_change'], ordering }} />
                </Typography>
            </Grid>
            <Grid
                item
                xs={4}
                sm={2}
                md={1}
                lg={1}
                xl={1}
                sx={{ p: 1, textAlign: { xs: 'end', sm: 'center' }, cursor: chain === 'SOL' ? 'pointer' : 'initial' }}
                onClick={() => chain === 'SOL' && handleFilterChange({ target: { value: 'average_price' } })}
            >
                <Typography
                    component="p"
                    sx={{ fontSize: 12, alignItems: 'center', display: 'flex', justifyContent: 'center', gap: 0.5 }}
                    noWrap
                >
                    Avg. Price <SortingArrow {...{ orderBy, fieldNames: ['average_price'], ordering }} />
                </Typography>
            </Grid>
            <Grid
                item
                xs={4}
                sm={2}
                md={1}
                lg={1}
                xl={1}
                sx={{ textAlign: { xs: 'end', sm: 'center' }, p: 1, cursor: chain === 'SOL' ? 'pointer' : 'initial' }}
                onClick={() => chain === 'SOL' && handleFilterChange({ target: { value: 'average_price_1day_change' } })}
            >
                <Typography
                    component="p"
                    sx={{ fontSize: 12, alignItems: 'center', display: 'flex', justifyContent: 'center', gap: 0.5 }}
                    noWrap
                >
                    Avg 24h % <SortingArrow {...{ orderBy, fieldNames: ['average_price_1day_change'], ordering }} />
                </Typography>
            </Grid>
            <Grid
                item
                xs={4}
                sm={2}
                md={2}
                lg={1}
                xl={1}
                sx={{ textAlign: { xs: 'end', sm: 'center' }, p: 1, cursor: 'pointer' }}
                onClick={() => handleFilterChange({ target: { value: chain === 'ETH' ? '7DayVolume' : 'volume_7day' } })}
            >
                <Typography
                    component="p"
                    sx={{ fontSize: 12, alignItems: 'center', display: 'flex', justifyContent: 'center', gap: 0.5 }}
                    noWrap
                >
                    Vol (7D) <SortingArrow {...{ orderBy, fieldNames: ['volume_7day', '7DayVolume'], ordering }} />
                </Typography>
            </Grid>
            <Grid
                item
                xs={4}
                sm={2}
                md={2}
                lg={1}
                xl={1}
                sx={{ textAlign: { xs: 'end', sm: 'center' }, p: 1, cursor: 'pointer' }}
                onClick={() => handleFilterChange({ target: { value: chain === 'ETH' ? '1DayVolume' : 'volume_1day_change' } })}
            >
                <Typography
                    component="p"
                    sx={{ fontSize: 12, alignItems: 'center', display: 'flex', justifyContent: 'center', gap: 0.5 }}
                    noWrap
                >
                    Vol 24h % <SortingArrow {...{ orderBy, fieldNames: ['volume_1day_change', '1DayVolume'], ordering }} />
                </Typography>
            </Grid>
            <Grid
                item
                xs={4}
                sm={2}
                md={2}
                lg={1}
                xl={1}
                sx={{
                    textAlign: { xs: 'end', sm: 'center' },
                    px: { xs: 1, sm: 2, lg: 1 },
                    py: 1,
                    cursor: chain === 'SOL' ? 'pointer' : 'initial'
                }}
                onClick={() => handleFilterChange({ target: { value: 'num_of_token_listed' } })}
            >
                <Typography
                    component="p"
                    sx={{ fontSize: 12, alignItems: 'center', display: 'flex', justifyContent: 'center', gap: 0.5 }}
                    noWrap
                >
                    Listed <SortingArrow {...{ orderBy, fieldNames: ['num_of_token_listed'], ordering }} />
                </Typography>
            </Grid>
        </Grid>
    );
    return (
        <>
            {!matchUpMd && (
                <div className="nft-collection">
                    <div
                        style={{
                            borderColor: 'rgba(51, 39, 63, 1)',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            borderRadius: 30000,
                            gap: 4,
                            display: 'flex'
                        }}
                    >
                        <Button
                            sx={{ borderRadius: 30000 }}
                            variant={chain === 'SOL' ? 'contained' : 'text'}
                            color="secondary"
                            onClick={() => navigate(`/explore/collection/SOL`)}
                            startIcon={
                                <Avatar
                                    src={SolanaLogo}
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        objectFit: 'contain',
                                        backgroundColor: 'transparent'
                                    }}
                                    color="inherit"
                                />
                            }
                        >
                            SOL
                        </Button>
                        <Button
                            sx={{ borderRadius: 30000 }}
                            variant={chain === 'ETH' ? 'contained' : 'text'}
                            color="secondary"
                            onClick={() => navigate(`/explore/collection/ETH`)}
                            startIcon={
                                <Avatar
                                    src={EthLogo}
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        objectFit: 'contain'
                                    }}
                                    color="inherit"
                                />
                            }
                        >
                            ETH
                        </Button>
                    </div>
                </div>
            )}
            <TabContext value={tabIdx}>
                <MainCard
                    border={false}
                    divider={false}
                    titleSX={{
                        '.MuiCardHeader-content': {
                            width: '100%'
                        }
                    }}
                    sx={{
                        '.MuiCardHeader-root': {
                            overflowX: 'auto',
                            flexDirection: { xs: 'column', md: 'row' }
                        }
                    }}
                    title={
                        <Box
                            sx={{
                                display: 'flex',
                                width: '100%'
                            }}
                        >
                            {!matchUpMd && (
                                <TabList
                                    onChange={handleTabChange}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    sx={{
                                        marginTop: '-12px',
                                        mb: { xs: 2, md: 0 },
                                        width: '100%',
                                        '.MuiTabs-root': {
                                            width: '100%'
                                        },
                                        '.MuiTabs-flexContainer': { borderBottom: 'none' }
                                    }}
                                    textColor="secondary"
                                    indicatorColor="secondary"
                                >
                                    <Tab label="All" id="allTab" value="All" />
                                    <Tab label="PFP" id="pfpTab" value="PFP" />
                                    <Tab label="Gaming" id="gamingTab" value="Gaming" />
                                    <Tab label="Generative Art" id="generativeArtTab" value="Generative Art" />
                                    <Tab label="Utility" id="utilityTab" value="Utility" />
                                    <Tab label="Virtual World" id="virtualWorldTab" value="Virtual World" />
                                    <Tab label="New listing" id="virtualWorldTab" value="NEW" />
                                </TabList>
                            )}
                            {matchUpMd && (
                                <div className="nft-collection">
                                    <div
                                        style={{
                                            borderColor: 'rgba(51, 39, 63, 1)',
                                            borderWidth: 1,
                                            borderStyle: 'solid',
                                            borderRadius: 30000,
                                            gap: 4,
                                            display: 'flex'
                                        }}
                                    >
                                        {map(['All', 'PFP', 'Gaming', 'Generative Art', 'Utility', 'Virtual World', 'NEW'], (tab) => (
                                            <Button
                                                key={tab}
                                                sx={{ borderRadius: 30000, px: 2 }}
                                                variant={tabIdx === tab ? 'contained' : 'text'}
                                                color="secondary"
                                                onClick={(e) => handleTabChange(e, tab)}
                                            >
                                                {tab === 'NEW' ? 'New Listing' : tab}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Box>
                    }
                    secondary={
                        <>
                            {!matchUpMd && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <FormControl
                                        sx={{
                                            width: '100%',
                                            '.MuiInputLabel-root.Mui-focused': {
                                                color: theme.palette.mode === 'dark' ? '#fff !important' : '#000 !important'
                                            },
                                            '.MuiOutlinedInput-root': {
                                                pr: 0
                                            }
                                        }}
                                    >
                                        <InputLabel id="orderFieldLbl">Sort by</InputLabel>
                                        <Select
                                            labelId="orderFieldLbl"
                                            id="orderField"
                                            value={orderBy}
                                            onChange={(e) => handleFilterChange(e)}
                                            input={<OutlinedInput label="Sort By" />}
                                            sx={{
                                                pr: 5,
                                                pl: 1,
                                                minWidth: 180,
                                                fieldset: {
                                                    borderColor: theme.palette.mode === 'dark' ? '#fff !important' : '#000 !important'
                                                }
                                            }}
                                            MenuProps={{
                                                PaperProps: {
                                                    style: !matchUpMd
                                                        ? {
                                                              maxHeight: 48 * 4.5 + 8
                                                          }
                                                        : {}
                                                }
                                            }}
                                        >
                                            {_.map(chain === 'SOL' ? orderFieldsList : orderFieldsListETH, ({ label, value }: any) => (
                                                <MenuItem key={value} value={value}>
                                                    {label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <IconButton onClick={() => toggleOrdering()}>
                                        {ordering === 'DESC' ? <IconSortDescending /> : <IconSortAscending />}
                                    </IconButton>
                                    <IconButton onClick={() => updatePage(1, true)}>
                                        <RefreshOutlined />
                                    </IconButton>
                                </Box>
                            )}
                            {matchUpMd && (
                                <div className="nft-collection">
                                    <div
                                        style={{
                                            borderColor: 'rgba(51, 39, 63, 1)',
                                            borderWidth: 1,
                                            borderStyle: 'solid',
                                            borderRadius: 30000,
                                            gap: 4,
                                            display: 'flex'
                                        }}
                                    >
                                        <Button
                                            sx={{ borderRadius: 30000 }}
                                            variant={chain === 'SOL' ? 'contained' : 'text'}
                                            color="secondary"
                                            onClick={() => navigate(`/explore/collection/SOL`)}
                                            startIcon={
                                                <Avatar
                                                    src={SolanaLogo}
                                                    sx={{
                                                        width: 20,
                                                        height: 20,
                                                        objectFit: 'contain',
                                                        backgroundColor: 'transparent'
                                                    }}
                                                    color="inherit"
                                                />
                                            }
                                        >
                                            SOL
                                        </Button>
                                        <Button
                                            sx={{ borderRadius: 30000 }}
                                            variant={chain === 'ETH' ? 'contained' : 'text'}
                                            color="secondary"
                                            onClick={() => navigate(`/explore/collection/ETH`)}
                                            startIcon={
                                                <Avatar
                                                    src={EthLogo}
                                                    sx={{
                                                        width: 20,
                                                        height: 20,
                                                        objectFit: 'contain'
                                                    }}
                                                    color="inherit"
                                                />
                                            }
                                        >
                                            ETH
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    }
                    contentSX={{
                        p: 0
                    }}
                >
                    {/* Content */}

                    {isLoading ? (
                        <Grid container spacing={0} sx={{ mt: '8px', position: 'relative' }}>
                            {header}
                            {_.map(Array(50), (v, i) => (
                                <NFTProjectRowSkeleton key={i} index={i + variables.page_size * (variables.page_number - 1)} />
                            ))}
                        </Grid>
                    ) : (
                        <Grid container spacing={0}>
                            <Box sx={{ mt: '8px', width: '100%', position: 'relative' }}>
                                {header}
                                <PagedList
                                    disableGutters
                                    sx={{ px: '0px' }}
                                    maxWidth={false}
                                    component={NFTProjectRow}
                                    pageSize={variables.page_size}
                                    masterList={masterProjects}
                                    pageList={projects}
                                    getPage={getPage}
                                    isLoading={isLoading}
                                    spacing={1}
                                    currentPage={variables.page_number}
                                />
                            </Box>
                        </Grid>
                    )}
                </MainCard>
            </TabContext>
        </>
    );
}

export default NFTsHome;
