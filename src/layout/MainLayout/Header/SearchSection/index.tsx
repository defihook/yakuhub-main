/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useCallback } from 'react';
import { debounce, filter, get, lowerCase, map, omit, toLower, uniqWith, isEqual } from 'lodash';
// material-ui
import { useTheme, styled } from '@mui/material/styles';
import { Autocomplete, Avatar, Box, Card, CircularProgress, Grid, InputAdornment, Popper } from '@mui/material';

// third-party
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';

// project imports
import Transitions from 'components/@extended/Transitions';

// assets
import { IconSearch } from '@tabler/icons';
import { shouldForwardProp } from '@mui/system';
import useAuthQuery from 'hooks/useAuthQuery';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import { queries } from '../../../../graphql/graphql';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'store';
import { activeItem } from 'store/slices/menu';
import { PublicKey } from '@solana/web3.js';
import OutlinedInputStyle from 'components/OutlinedInputStyle';
import SearchBox from 'components/SearchBox';
import { useMECollections } from 'contexts/MECollectionsContext';
import SearchResultView from 'components/SearchResultView';
import { BonfidaFetched } from 'types/bonfida';
import { useToasts } from 'hooks/useToasts';
import useConnections from 'hooks/useConnetions';
import { resolveBonfida } from 'utils/bonfida/handle';

// styles
const PopperStyle = styled(Popper, { shouldForwardProp })(({ theme }) => ({
    zIndex: 1500,
    width: '99%',
    top: '-55px !important',
    padding: '0 12px',
    [theme.breakpoints.down('sm')]: {
        padding: '0 10px'
    }
}));

const HeaderAvatarStyle = styled(Avatar, { shouldForwardProp })(({ theme }) => ({
    ...theme.typography.commonAvatar,
    ...theme.typography.mediumAvatar,
    background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.light,
    color: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.dark,
    '&:hover': {
        background: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.dark,
        color: theme.palette.secondary.light
    }
}));

interface Props {
    value: string;
    setValue: (value: string) => void;
    handleSearch: (value: string) => void;
    popupState: any;
    [key: string]: any;
}

// ==============================|| SEARCH INPUT - MOBILE||============================== //

const MobileSearch = ({ value, setValue, handleSearch, popupState, isLoading, options, navigate, setOpen, open }: Props) => (
    <Autocomplete
        freeSolo
        disablePortal
        autoHighlight
        inputValue={value}
        loading={isLoading}
        options={options}
        open={open}
        onOpen={() => {
            setOpen(true);
        }}
        onClose={() => {
            setOpen(false);
        }}
        onInputChange={(e, val) => {
            setValue(val);
            handleSearch(val);
        }}
        renderOption={(props: object, option: any) => (
            <SearchResultView
                {...props}
                project={{
                    project_id: option.project_id,
                    img_url: option.image,
                    display_name: option.label,
                    mint: option.mint,
                    type: option.type
                }}
                navigate={navigate}
                index={option.project_id}
                key={option.project_id}
            />
        )}
        renderInput={(params) => (
            <SearchBox
                params={params}
                popupState={popupState}
                value={value}
                placeholder="Search by collection, wallet address, domain..."
            />
        )}
    />
);

// ==============================|| SEARCH INPUT ||============================== //

const SearchSection = () => {
    const { showErrorToast } = useToasts();
    const theme = useTheme();
    const { chain } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { MECollections, fetchCollections } = useMECollections();
    const [value, setValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<any[]>([]);

    const [getCoinInfo] = useAuthLazyQuery(queries.GET_COIN_INFO, {
        variables: {
            coinId: lowerCase(value)
        }
    });
    const { data: tokenState, refetch: refetchTokenState } = useAuthQuery(queries.GET_TOKEN_STATE, {
        skip: !value,
        variables: {
            condition: {
                tokenAddresses: [value]
            }
        }
    });

    // Bonfida search
    const { connection } = useConnections();

    // eslint-disable-next-line @typescript-eslint/no-shadow
    const handleBonfidaResolve = async (domains: string) => {
        let names: BonfidaFetched[] = domains
            .split(/[\s,]+/)
            .map((e) => e.split('.sol')[0].replace(/["|']/g, ''))
            .filter((e) => !!e && e !== '.sol')
            .map((e) => ({
                name: e,
                registered: false,
                fixedPrice: false,
                tokenized: false,
                auction: false,
                owner: ''
            }));
        names = uniqWith(names, isEqual);

        if (names.length > 100) {
            showErrorToast('Cannot resolve more than 100 domains');
            return;
        }

        names = await Promise.all(names.map((e) => resolveBonfida(connection, e)));
        // eslint-disable-next-line consistent-return
        return names;
    };

    const handleSearch = async (keyword: string) => {
        setOptions([]);
        if (!keyword || keyword.length < 2) {
            return;
        }
        setIsLoading(true);
        setOpen(true);
        let collections = MECollections;
        if (!collections || !collections.length) {
            collections = await fetchCollections();
        }
        const foundCollections = filter(
            collections,
            ({ symbol, name }) => toLower(name)?.includes(toLower(keyword)) || toLower(symbol)?.includes(toLower(keyword))
        );

        let newOptions = map(foundCollections, ({ name, symbol, image }: any) => ({
            label: name,
            image,
            project_id: symbol,
            type: 'collection'
        }));
        setOptions(newOptions);

        try {
            // if (keyword.toLowerCase().split('.sol').length > 1) {
            const names = await handleBonfidaResolve(keyword);
            if (names && names.length !== 0) {
                const domainOptions = {
                    mint: names[0].owner,
                    label: keyword,
                    image: '',
                    project_id: '',
                    type: 'domain'
                };
                newOptions = [domainOptions];
                setOptions(newOptions);
            }
            // }
        } catch (error) {
            console.log(error);
            console.debug(keyword, 'is not a domain');
        }

        try {
            const { data: tokenStateNewData }: any = await refetchTokenState({
                condition: {
                    tokenAddresses: [keyword]
                }
            });
            if (tokenStateNewData?.getTokenState[0]?.market_place_states[0]) {
                const { project_id, full_img, meta_data_img, name } = tokenStateNewData?.getTokenState[0]?.market_place_states[0];
                const nftOptions = {
                    mint: tokenStateNewData?.getTokenState[0].tokenAddress,
                    label: name,
                    image: meta_data_img || full_img,
                    project_id,
                    type: 'nft'
                };
                newOptions = [nftOptions, ...newOptions];
                setOptions(newOptions);
            }
        } catch (error) {
            console.debug(keyword, 'is not NFT token');
        }

        try {
            const isSolscanAccount: any = await findOnSolscan('account', keyword);
            if (isSolscanAccount && isSolscanAccount?.account) {
                const accountOptions = {
                    mint: isSolscanAccount?.account,
                    label: isSolscanAccount?.account,
                    image: '',
                    project_id: isSolscanAccount?.account,
                    type: 'account'
                };
                newOptions = [accountOptions, ...newOptions];
                setOptions(newOptions);
            }
        } catch (error) {
            console.debug(keyword, 'is not an account');
        }

        try {
            const isSolescanToken: any = await findOnSolscan('token', keyword);
            if (isSolescanToken) {
                const tokenOptions = {
                    mint: keyword,
                    label: isSolescanToken?.name,
                    image: '',
                    project_id: isSolescanToken?.symbol,
                    type: 'token'
                };
                newOptions = [tokenOptions, ...newOptions];
                setOptions(newOptions);
            }
        } catch (error) {
            console.debug(keyword, 'is not a token');
        }

        try {
            const isSolscanTransaction: any = await findOnSolscan('transaction', keyword);
            if (isSolscanTransaction) {
                const txOptions = {
                    mint: isSolscanTransaction?.txHash,
                    label: isSolscanTransaction?.txHash,
                    image: '',
                    project_id: isSolscanTransaction?.txHash,
                    type: 'transaction'
                };
                newOptions = [txOptions, ...newOptions];
                setOptions(newOptions);
            }
        } catch (error) {
            console.debug(keyword, 'is not a transaction signature');
        }

        try {
            const coinInfoResult = await getCoinInfo();
            const responseCode = get(coinInfoResult, 'data.fetchCoin.code');
            const coinData = get(coinInfoResult, 'data.fetchCoin.data', {});
            if (responseCode === 200) {
                const coinOption = {
                    label: coinData.name,
                    image: get(coinData, 'image.large'),
                    project_id: coinData.id,
                    type: 'coin'
                };
                newOptions = [coinOption, ...newOptions];
                setOptions(newOptions);
            }
        } catch (e) {
            console.debug(keyword, 'is not a coin');
        }

        setOptions(newOptions);
        setIsLoading(false);
    };

    const findOnSolscan = (type: string, str: string) =>
        new Promise((resolve, reject) => {
            const url =
                type === 'token'
                    ? `https://public-api.solscan.io/token/meta?tokenAddress=${str}`
                    : `https://public-api.solscan.io/${type}/${str}`;
            fetch(url)
                .then((res: any) => {
                    if (res.status === 400) {
                        return resolve(false);
                    }
                    return res.json();
                })
                .then((v) => resolve(v));
        });

    const handleNavigate = ({ type, project_id, mint }: any) => {
        switch (type) {
            case 'coin':
                navigate(`/explore/token/${chain}/${project_id}`);
                dispatch(activeItem(['token']));
                break;
            case 'collection':
                navigate(`/explore/collection/${chain}/${project_id}`);
                dispatch(activeItem(['collection']));
                break;
            case 'nft':
                navigate(`/explore/collection/${chain}/${project_id}/${mint}`);
                dispatch(activeItem(['collection']));
                break;
            case 'account':
                navigate(`/account/${mint}`);
                break;
            case 'domain':
                navigate(`/account/${mint}`);
                break;
            case 'token':
                window.open(`https://solscan.io/token/${mint}`);
                break;
            case 'transaction':
                window.open(`https://solscan.io/tx/${mint}`);
                break;
        }
        setOpen(false);
    };

    const handleSearchDebounced = debounce(handleSearch, 500);
    const handleSearchCallback = useCallback((v) => handleSearchDebounced(v), []);

    return (
        <>
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <PopupState variant="popper" popupId="demo-popup-popper">
                    {(popupState) => (
                        <>
                            <Box sx={{ ml: 2 }}>
                                <HeaderAvatarStyle variant="rounded" {...bindToggle(popupState)}>
                                    <IconSearch stroke={1.5} size="1.2rem" />
                                </HeaderAvatarStyle>
                            </Box>
                            <PopperStyle {...bindPopper(popupState)} transition>
                                {({ TransitionProps }) => (
                                    <>
                                        <Transitions type="zoom" {...TransitionProps} sx={{ transformOrigin: 'center left' }}>
                                            <Card
                                                sx={{
                                                    background: theme.palette.mode === 'dark' ? theme.palette.dark[900] : '#fff',
                                                    [theme.breakpoints.down('sm')]: {
                                                        border: 0,
                                                        boxShadow: 'none'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ p: 2 }}>
                                                    <Grid container alignItems="center" justifyContent="space-between">
                                                        <Grid item xs>
                                                            <MobileSearch
                                                                open={open}
                                                                setOpen={setOpen}
                                                                navigate={handleNavigate}
                                                                options={options}
                                                                isLoading={isLoading && !options.length}
                                                                value={value}
                                                                setValue={setValue}
                                                                handleSearch={handleSearchCallback}
                                                                popupState={popupState}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            </Card>
                                        </Transitions>
                                    </>
                                )}
                            </PopperStyle>
                        </>
                    )}
                </PopupState>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Autocomplete
                    freeSolo
                    disablePortal
                    autoHighlight
                    open={open}
                    onOpen={() => {
                        setOpen(true);
                    }}
                    onClose={() => {
                        setOpen(false);
                    }}
                    openOnFocus
                    loading={isLoading && !options.length}
                    options={options}
                    inputValue={value}
                    onInputChange={(e, val) => {
                        setValue(val);
                        handleSearchCallback(val);
                    }}
                    renderOption={(props: object, option: any) => (
                        <SearchResultView
                            {...props}
                            project={{
                                project_id: option.project_id,
                                img_url: option.image,
                                display_name: option.label,
                                mint: option.mint,
                                type: option.type
                            }}
                            navigate={handleNavigate}
                            index={option.project_id}
                            key={option.project_id}
                        />
                    )}
                    renderInput={(params) => (
                        <OutlinedInputStyle
                            {...omit(params, ['InputProps', 'InputLabelProps'])}
                            {...params.InputProps}
                            id="input-search-header"
                            placeholder="Search by collection, wallet address, domain..."
                            startAdornment={
                                <>
                                    <InputAdornment position="start">
                                        <IconSearch stroke={1.5} size="1rem" color={theme.palette.grey[500]} />
                                    </InputAdornment>
                                    {params.InputProps.startAdornment}
                                </>
                            }
                            endAdornment={
                                <>
                                    {isLoading && <CircularProgress color="inherit" size={20} />}
                                    {params.InputProps.endAdornment}
                                </>
                            }
                            aria-describedby="search-helper-text"
                            inputProps={{ ...params.inputProps, 'aria-label': 'weight' }}
                        />
                    )}
                />
            </Box>
        </>
    );
};

export default SearchSection;
