import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Link, Typography } from '@mui/material';
import { useState } from 'react';
import WalletHeadLine from './WalletHeadLine';

function createData(
    avatar: string,
    name: string,
    following: number,
    follow: number,
    status: string,
    to: string,
    tail: number,
    time: number,
    nftvalue: number,
    splvalue: number
) {
    return { avatar, name, following, follow, status, to, tail, time, nftvalue, splvalue };
}

const rows = [
    createData('ppp', '@maniacartige', 190, 119, 'Bought', 'WTF studios', 159.5, 15, 3582.2, 10.64),
    createData('ppp', '@cactusbiber', 208, 61, 'Listed', 'Taiyo Oil', 1.28, 5, 3582.2, 10.64),
    createData('ppp', '@GoMan2233', 529, 856, 'Listed', 'Lunar', 2.35, 25, 3582.2, 10.64),
    createData('ppp', '@nft_brewer', 3340, 602, 'Bought', 'GMers', 0.1, 15, 3582.2, 10.64),
    createData('ppp', '@GetEm_Sis', 2680, 1574, 'Bought', 'Sorcies', 1.28, 12, 3582.2, 10.64),
    createData('ppp', '@HumioNFTs', 340, 5431, 'Delisted', 'Liberty Square', 0, 19, 3582.2, 10.64),
    createData('ppp', '@joesol212', 1687, 6374, 'Listed', 'the LostApes', 0.25, 4, 3582.2, 10.64),
    createData('ppp', '@SolCultures', 5342, 1523, 'Delisted', 'The Orcs', 0, 25, 3582.2, 10.64),
    createData('ppp', '@WRD3420', 353, 1251, 'Bought', 'Baked Beavers', 0.5, 67, 3582.2, 10.64),
    createData('ppp', '@Kev1n111', 14, 645, 'Listed', 'Lunar', 2.6, 2, 3582.2, 10.64)
];

export default function BasicTable() {
    const [rowData, setRowData] = useState(rows);
    const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
    const sortArray = (arr: any[], orderBy: string) => {
        switch (orderBy) {
            case 'asc':
            default:
                return arr.sort((a: any, b: any) => {
                    if (a.time > b.time) {
                        return 1;
                    }
                    if (b.time > a.time) {
                        return -1;
                    }
                    return 0;
                });
            case 'desc':
                return arr.sort((a: any, b: any) => {
                    if (a.time < b.time) {
                        return 1;
                    }
                    if (b.time < a.time) {
                        return -1;
                    }
                    return 0;
                });
        }
    };
    const handleSortRequest = () => {
        setRowData(sortArray(rows, orderDirection));
        setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
    };
    return (
        <>
            <WalletHeadLine />
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ color: '#fff' }}>Twitter handle</TableCell>
                            <TableCell align="right" style={{ color: '#fff' }}>
                                Lastest transaction
                            </TableCell>
                            <TableCell align="right" onClick={handleSortRequest}>
                                <TableSortLabel active direction={orderDirection} style={{ color: '#fff' }}>
                                    Date&nbsp;
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right" style={{ color: '#fff' }}>
                                NFT Portfolio Value
                            </TableCell>
                            <TableCell align="right" style={{ color: '#fff' }}>
                                SPL Portfolio Value
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <>
                                <TableRow key={row.name}>
                                    <TableCell component="th" scope="row" style={{ color: '#fff' }}>
                                        <Link>{row.name}</Link>
                                        <Typography>
                                            {row.following} following • {row.follow} followers
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" style={{ color: '#fff' }}>
                                        {row.status} <Link>{row.to}</Link>
                                        {row.status !== 'Delisted' && ` for ${row.tail} ◎`}
                                    </TableCell>
                                    <TableCell align="right" style={{ color: '#fff' }}>
                                        {row.time} m ago
                                    </TableCell>
                                    <TableCell align="right" style={{ color: '#fff' }}>
                                        ${row.nftvalue}
                                    </TableCell>
                                    <TableCell align="right" style={{ color: '#fff' }}>
                                        ${row.splvalue}
                                    </TableCell>
                                </TableRow>
                            </>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}
