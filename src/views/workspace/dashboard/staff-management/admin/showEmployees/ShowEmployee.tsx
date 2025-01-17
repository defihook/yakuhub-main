/* eslint-disable no-underscore-dangle */
import {
    Grid,
    Button,
    TextField,
    FormControl,
    Select,
    MenuItem,
    SelectChangeEvent,
    IconButton,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    Divider,
    DialogActions,
    OutlinedInput,
    InputLabel,
    Box,
    LinearProgress,
    Chip,
    useTheme,
    Tooltip
} from '@mui/material';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { mutations, queries } from '../../../../../../graphql/graphql';
import { useToasts } from 'hooks/useToasts';
import MainCard from 'components/MainCard';
import { AddOutlined, DeleteOutlined, ListAltOutlined, RefreshOutlined } from '@mui/icons-material';
import { useWallet } from '@solana/wallet-adapter-react';
import { capitalize, each, get, groupBy, isNaN, last, map, sum, toLower } from 'lodash';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import CopyAddress from 'components/CopyAddress';
import EmployCard from './EmployCard';
import { FormattedMessage } from 'react-intl';
import { useSolPrice } from 'contexts/CoinGecko';
import { stringToColor } from '../../../../../../utils/utils';
import { NumberInput } from 'components/NumberInput';
import useAuthQuery from 'hooks/useAuthQuery';
import useAuthMutation from 'hooks/useAuthMutation';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ConfirmDialog from 'components/ConfirmDialog';

function SelectProject({ projects, setProjects, address }: any) {
    const { data } = useAuthQuery(queries.GET_WALLETS, { variables: { wallet: address } });

    const onProjects = ({ target: { value } }: SelectChangeEvent) => {
        setProjects(value);
    };

    return (
        <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
                <InputLabel id="project-select-label">
                    <FormattedMessage id="project" />
                </InputLabel>
                <Select id="project-select-label" input={<OutlinedInput label="Project" />} value={projects} onChange={onProjects}>
                    {data &&
                        data.getWallets.length > 0 &&
                        data.getWallets.map((item: any, key: any) => (
                            <MenuItem value={item.project} key={key}>
                                {item.project}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>
        </Grid>
    );
}

export default function ShowEmployee({ selectedProject, setSelectedProject, setMonthlyPayout, setNofifyProjects }: any) {
    const { publicKey } = useWallet();
    const theme = useTheme();
    const [period, setPeriod] = useState('Daily');
    const [method, setMethod] = useState('SOL');
    const [isLoading, setIsLoading] = useState(false);

    const { data: allData, refetch: refetchAllData } = useAuthQuery(queries.GET_CLAIMERS, { variables: { wallet: publicKey?.toBase58() } });
    const { data, refetch } = useAuthQuery(queries.GET_EMPLOYEES, {
        variables: { project: selectedProject || '', employer: publicKey?.toBase58() }
    });
    const [data1, setData1] = useState<any[]>([]);

    const [deleteClaimer] = useAuthMutation(mutations.DELETE_CLAIMER);

    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);

    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [wallet, setWallet] = useState('');
    const [time, setTime] = useState('');
    const [projects, setProjects] = useState('');
    const [delData, setDelData] = useState<any>();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [createClaimer] = useAuthMutation(mutations.ADD_CLAIMER);

    const { showInfoToast, showErrorToast } = useToasts();
    const adminWallet = useWallet();
    const solPrice = useSolPrice();

    const onPeriod = ({ target: { value } }: SelectChangeEvent) => {
        setPeriod(value);
    };
    const onMethod = ({ target: { value } }: SelectChangeEvent) => {
        setMethod(value);
    };

    const updatePage = async () => {
        try {
            setIsLoading(true);
            if (selectedProject) {
                const {
                    data: projectData = {
                        getEmployees: []
                    }
                } = await refetch();
                setData1(projectData.getEmployees);
            } else {
                const {
                    data: projectData = {
                        getClaimers: []
                    }
                } = await refetchAllData();
                setData1(projectData.getClaimers);
                setMonthlyPayout(
                    sum(
                        map(projectData.getClaimers, ({ amount: amt, method: cur, period: per }: any) => {
                            const Weekly = moment().endOf('month').isoWeek() - moment().startOf('month').isoWeek() + 1;
                            const multiplier: Record<string, number> = {
                                Daily: moment().daysInMonth(),
                                Weekly,
                                Biweeky: Weekly / 2,
                                Monthly: 1
                            };
                            return +amt * (cur === 'SOL' ? solPrice : 1) * (multiplier[per] || 1);
                        })
                    )
                );
                const projectGrp = groupBy(projectData.getClaimers, 'project');
                const after1days: any = {};
                const after3days: any = {};
                const after7days: any = {};
                const after30days: any = {};
                const employees: any = {};
                each(Object.keys(projectGrp), (key) => {
                    map(projectGrp[key], ({ name: employeeName, user, amount: amt, method: met, time: datetime }) => {
                        if (!after1days[key]) {
                            after1days[key] = {};
                        }
                        if (after1days[key][met] === undefined) {
                            after1days[key][met] = 0;
                        }
                        if (!after3days[key]) {
                            after3days[key] = {};
                        }
                        if (after3days[key][met] === undefined) {
                            after3days[key][met] = 0;
                        }
                        if (!after7days[key]) {
                            after7days[key] = {};
                        }
                        if (after7days[key][met] === undefined) {
                            after7days[key][met] = 0;
                        }
                        if (!after30days[key]) {
                            after30days[key] = {};
                        }
                        if (after30days[key][met] === undefined) {
                            after30days[key][met] = 0;
                        }
                        if (moment(datetime).diff(moment(), 'days') <= 1) {
                            after1days[key][met] += +amt;
                        }
                        if (moment(datetime).diff(moment(), 'days') <= 3) {
                            after3days[key][met] += +amt;
                        }
                        if (moment(datetime).diff(moment(), 'days') <= 7) {
                            after7days[key][met] += +amt;
                        }
                        if (moment(datetime).diff(moment(), 'days') <= 30) {
                            after30days[key][met] += +amt;
                        }
                        if (!employees[key]) {
                            employees[key] = [];
                        }
                        employees[key].push({
                            avatar: get(user, '0.avatar'),
                            vanity: get(user, '0.vanity'),
                            _id: get(user, '0._id'),
                            name: employeeName
                        });
                    });
                });
                setNofifyProjects({
                    after1days,
                    after3days,
                    after7days,
                    after30days,
                    employees
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        updatePage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allData, data, selectedProject]);

    const deleteFunc = async (delObj: any) => {
        setDelData(delObj);
        setConfirmOpen(true);
    };

    const confirmedDelete = async () => {
        try {
            setIsLoading(true);
            await deleteClaimer({
                variables: { project: delData.project, name: delData.name, wallet: delData.wallet, employer: publicKey?.toBase58() }
            });
        } catch (err) {
            console.error(err);
            showErrorToast('Error occured');
        } finally {
            setIsLoading(false);
            updatePage();
        }
    };

    const onSave = async () => {
        if (!projects || !name || !method || !wallet || !amount || !time || !period) {
            showInfoToast('fields must be required.');
            return;
        }
        try {
            setIsLoading(true);
            await createClaimer({
                variables: { project: projects, name, method, amount, wallet, period, time, employer: publicKey?.toBase58() }
            });
            updatePage();
            setShowAddEmployeeModal(false);
            setName('');
            setAmount('');
            setWallet('');
            setPeriod('');
            setTime('');
        } catch (err) {
            console.error(err);
            showErrorToast('Already employed on that project OR ERROR!');
        } finally {
            setIsLoading(false);
        }
    };
    const columns: GridColDef[] = [
        {
            field: 'project',
            headerName: 'Project',
            flex: 1,
            renderCell: (params: GridRenderCellParams) => (
                <Typography component="p" fontSize={12}>
                    {capitalize(params.row.project)}
                </Typography>
            )
        },
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
            renderCell: (params: GridRenderCellParams) => (
                <Typography component="p" fontSize={12}>
                    {capitalize(params.row.name)}
                </Typography>
            )
        },
        {
            field: 'wallet',
            headerName: 'Wallet',
            flex: 3,
            renderCell: (params: GridRenderCellParams) => (
                <Typography component="p" fontSize={12}>
                    <CopyAddress address={params.row.wallet} />
                </Typography>
            )
        },
        {
            field: 'amount',
            headerName: 'Budget',
            flex: 3,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                        label={`${params.row.amount} ${params.row.method}`}
                        color={params.row.method === 'SOL' ? 'secondary' : 'info'}
                        size="small"
                        sx={{ fontSize: 12 }}
                    />
                    <Chip
                        label={params.row.period}
                        sx={{ bgcolor: stringToColor(toLower(params.row.period)), color: '#333', fontSize: 12 }}
                        size="small"
                    />
                </Box>
            )
        },
        {
            field: 'time',
            headerName: 'Next Payment',
            flex: 2,
            renderCell: (params: GridRenderCellParams) => (
                <Typography component="p" fontSize={12}>
                    {new Date(params.row.time).toLocaleString()}
                </Typography>
            )
        },
        {
            field: 'claimed',
            headerName: 'Status',
            flex: 1,
            renderCell: (params: GridRenderCellParams) => {
                if (!params.row.transactionHash.length) {
                    return <Chip label="Hasn't Claimed" color="primary" size="small" sx={{ fontSize: 12 }} />;
                }
                return (
                    <Chip
                        sx={{ fontSize: 12 }}
                        label={moment(get(last(params.row.transactionHash), 'date', '')).format('YYYY-MM-DD')}
                        onClick={() =>
                            window.open(
                                `https://solscan.io/tx/${get(last(params.row.transactionHash), 'txHash', '')}`,
                                '_blank',
                                'noreferrer'
                            )
                        }
                        color="success"
                        size="small"
                    />
                );
            }
        },
        {
            field: 'delete',
            headerName: 'Action',
            flex: 1,
            renderCell: (params: GridRenderCellParams) => (
                <IconButton
                    color="error"
                    onClick={() => deleteFunc({ project: params.row.project, name: params.row.name, wallet: params.row.wallet })}
                >
                    <DeleteOutlined />
                </IconButton>
            )
        }
    ];
    const EmployeeListCard = ({ children, sx }: any) => (
        <MainCard
            border={false}
            divider={false}
            title={selectedProject ? `Current Employees in ${selectedProject}` : 'Current Employees'}
            contentSX={sx}
            secondary={
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Add an Employee">
                        <IconButton
                            sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#09080d' : theme.palette.primary.light }}
                            onClick={() => setShowAddEmployeeModal(true)}
                        >
                            <AddOutlined />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh">
                        <IconButton
                            sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#09080d' : theme.palette.primary.light }}
                            onClick={() => updatePage()}
                        >
                            <RefreshOutlined />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Show All">
                        <IconButton
                            sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#09080d' : theme.palette.primary.light }}
                            onClick={() => setSelectedProject(undefined)}
                        >
                            <ListAltOutlined />
                        </IconButton>
                    </Tooltip>
                </Box>
            }
            sx={{
                width: '100%',
                '.MuiCardContent-root:last-child': {
                    pb: { md: 0 }
                }
            }}
        >
            {children}
        </MainCard>
    );
    return (
        <>
            <Box sx={{ display: { md: 'none' }, width: '100%' }}>
                <EmployeeListCard>
                    {!isLoading ? (
                        <>
                            {data1 && data1.length > 0 ? (
                                <Grid container spacing={2}>
                                    {map(data1, (item: any, i: number) => (
                                        <Grid item xs={12} sm={6}>
                                            <EmployCard key={i} index={i} {...item} onDelete={(params: any) => deleteFunc(params)} />
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Grid item sx={{ p: 2 }}>
                                    <Typography component="h2" sx={{ textAlign: 'center' }}>
                                        <FormattedMessage id="no-employees-found" />
                                    </Typography>
                                </Grid>
                            )}
                        </>
                    ) : (
                        <Grid item sx={{ p: 2 }}>
                            <LinearProgress color="secondary" />
                        </Grid>
                    )}
                </EmployeeListCard>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'block' }, width: '100%' }}>
                <EmployeeListCard sx={{ p: 0 }}>
                    {!isLoading ? (
                        <DataGrid
                            sx={{
                                width: '100%',
                                border: 'none',
                                '.MuiDataGrid-columnSeparator': { display: 'none' }
                            }}
                            getRowId={(row) => row.name}
                            rows={data1}
                            columns={columns}
                            pageSize={10}
                            autoHeight
                            rowsPerPageOptions={[10]}
                            disableColumnFilter
                            disableColumnMenu
                            disableColumnSelector
                            disableDensitySelector
                            disableSelectionOnClick
                            hideFooterSelectedRowCount
                            rowSpacingType="margin"
                        />
                    ) : (
                        <Grid item sx={{ p: 2 }}>
                            <LinearProgress color="secondary" />
                        </Grid>
                    )}
                </EmployeeListCard>
            </Box>
            <Dialog
                open={showAddEmployeeModal}
                onClose={() => {
                    setShowAddEmployeeModal(false);
                }}
                maxWidth="xl"
            >
                <DialogTitle>
                    <FormattedMessage id="add-an-employee" />
                </DialogTitle>
                <DialogContent>
                    <Grid container justifyContent="center" sx={{ py: 4 }}>
                        <Grid container spacing={2}>
                            <SelectProject projects={projects} setProjects={setProjects} address={adminWallet.publicKey?.toBase58()} />
                            <Grid item xs={12} md={6}>
                                <FormattedMessage id="staff-name">
                                    {(msg) => (
                                        <TextField
                                            fullWidth
                                            id="standard-basic"
                                            label={`${msg}`}
                                            variant="outlined"
                                            onChange={({ target: { value } }: any) => {
                                                setName(value);
                                            }}
                                        />
                                    )}
                                </FormattedMessage>
                            </Grid>
                            <Grid item xs={6}>
                                <FormattedMessage id="budget">
                                    {(msg) => (
                                        <NumberInput
                                            className="number-control"
                                            name="depositAmount"
                                            value={+amount}
                                            min={0.01}
                                            step={0.01}
                                            precision={2}
                                            fullWidth
                                            onChange={(value?: number) => {
                                                if (!value) return;
                                                if (value >= 0.01) {
                                                    setAmount(value.toFixed(2));
                                                }
                                            }}
                                            placeholder={`${msg}`}
                                        />
                                    )}
                                </FormattedMessage>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth variant="outlined">
                                    <Select value={method} onChange={onMethod}>
                                        <MenuItem value="SOL">SOL</MenuItem>
                                        <MenuItem value="USDC">USDC</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormattedMessage id="wallet-addr">
                                    {(msg) => (
                                        <TextField
                                            fullWidth
                                            id="standard-basic"
                                            label={`${msg}`}
                                            variant="outlined"
                                            onChange={(e) => {
                                                setWallet(e.target.value);
                                            }}
                                        />
                                    )}
                                </FormattedMessage>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth variant="outlined">
                                    <Select value={period} onChange={onPeriod}>
                                        <MenuItem value="Daily">
                                            <FormattedMessage id="Daily" />
                                        </MenuItem>
                                        <MenuItem value="Weekly">
                                            <FormattedMessage id="Weekly" />
                                        </MenuItem>
                                        <MenuItem value="Biweekly">
                                            <FormattedMessage id="Biweekly" />
                                        </MenuItem>
                                        <MenuItem value="Monthly">
                                            <FormattedMessage id="Monthly" />
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <FormattedMessage id="datetime">
                                        {(msg) => (
                                            <DateTimePicker
                                                renderInput={(props: any) => (
                                                    <TextField fullWidth {...props} helperText="" InputLabelProps={{ shrink: true }} />
                                                )}
                                                label={`${msg}`}
                                                value={new Date(time)}
                                                onChange={(newValue: Date | null) => {
                                                    if (newValue && !isNaN(newValue?.getTime())) {
                                                        setTime(newValue?.toISOString() ?? '');
                                                    }
                                                }}
                                            />
                                        )}
                                    </FormattedMessage>
                                </LocalizationProvider>
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ pt: 3, px: 2 }}>
                    <Button variant="outlined" color="primary" onClick={() => setShowAddEmployeeModal(false)}>
                        <FormattedMessage id="cancel" />
                    </Button>
                    <Button variant="contained" color="secondary" onClick={onSave}>
                        <FormattedMessage id="save" />
                    </Button>
                </DialogActions>
            </Dialog>
            <ConfirmDialog title="Confirm to delete employee?" open={confirmOpen} setOpen={setConfirmOpen} onConfirm={confirmedDelete} />
        </>
    );
}
