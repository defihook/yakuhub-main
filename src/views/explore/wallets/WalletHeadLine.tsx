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
    createData('ppp', '@maniasetrwgwecartige', 190, 119, 'Bought', 'WTF studios', 159.5, 15, 3582.2, 10.64),
    createData('ppp', '@cactusbiber', 208, 61, 'Listed', 'Taiyo Oil', 1.28, 5, 3582.2, 10.64),
    createData('ppp', '@GoMan2233', 529, 856, 'Listed', 'Lunar', 2.35, 25, 3582.2, 10.64),
    createData('ppp', '@nft_brewer', 3340, 602, 'Bought', 'GMers', 0.1, 15, 3582.2, 10.64),
    createData('ppp', '@GetEm_Sis', 2680, 1574, 'Bought', 'Sorcies', 1.28, 12, 3582.2, 10.64),
    createData('ppp', '@joesol212', 1687, 6374, 'Listed', 'the LostApes', 0.25, 4, 3582.2, 10.64)
];

export default function WalletHeadLine() {
    return (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-cols-1 gap-4">
            <div className="p-4 bg-slate-500 rounded-lg">
                <div className="flex items-center justify-between my-2">
                    <h1 className="text-white">Biggest Whales</h1>
                    <div className="flex">
                        <h2 className="text-white mx-1">1D</h2>
                        <h2 className="text-white mx-1">1W</h2>
                    </div>
                </div>
                <div className="my-4">
                    {rows.map((row) => (
                        <div className="my-2">
                            <div className="my-1 flex items-center justify-between">
                                <h1 className="text-white text-ellipsis overflow-hidden">{row.name}</h1>
                                <div className="flex">
                                    <h1 className="text-slate-200">PV </h1>
                                    <h1 className="text-white">${row.nftvalue}</h1>
                                </div>
                            </div>
                            <h3 className="text-slate-200 text-[10px]">
                                {row.status} {row.to} for {row.tail} ◎
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4 bg-slate-500 rounded-lg">
                <div className="flex items-center justify-between my-2">
                    <h1 className="text-white">Top Traders</h1>
                    <div className="flex">
                        <h2 className="text-white mx-1">1D</h2>
                        <h2 className="text-white mx-1">1W</h2>
                    </div>
                </div>
                <div className="my-4">
                    {rows.map((row) => (
                        <div className="my-2">
                            <div className="my-1 flex items-center justify-between">
                                <h1 className="text-white text-ellipsis overflow-hidden">{row.name}</h1>
                                <div className="flex">
                                    <h1 className="text-slate-200">PV </h1>
                                    <h1 className="text-white">${row.nftvalue}</h1>
                                </div>
                            </div>
                            <h3 className="text-slate-200 text-[10px]">
                                {row.status} {row.to} for {row.tail} ◎
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4 bg-slate-500 rounded-lg">
                <div className="flex items-center justify-between my-2">
                    <h1 className="text-white">Most Followed</h1>
                    <div className="flex">
                        <h2 className="text-white mx-1">1D</h2>
                        <h2 className="text-white mx-1">1W</h2>
                    </div>
                </div>
                <div className="my-4">
                    {rows.map((row) => (
                        <div className="my-2">
                            <div className="my-1 flex items-center justify-between">
                                <h1 className="text-white text-ellipsis overflow-hidden">{row.name}</h1>
                                <div className="flex">
                                    <h1 className="text-slate-200">PV </h1>
                                    <h1 className="text-white">${row.nftvalue}</h1>
                                </div>
                            </div>
                            <h3 className="text-slate-200 text-[10px]">
                                {row.status} {row.to} for {row.tail} ◎
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4 bg-slate-500 rounded-lg">
                <div className="flex items-center justify-between my-2">
                    <h1 className="text-white">Recent Wash Trades</h1>
                    <div className="flex">
                        <h2 className="text-white mx-1">1D</h2>
                        <h2 className="text-white mx-1">1W</h2>
                    </div>
                </div>
                <div className="my-4">
                    {rows.map((row) => (
                        <div className="my-2">
                            <div className="my-1 flex items-center justify-between">
                                <h1 className="text-white text-ellipsis overflow-hidden">{row.name}</h1>
                                <div className="flex">
                                    <h1 className="text-slate-200">PV </h1>
                                    <h1 className="text-white">${row.nftvalue}</h1>
                                </div>
                            </div>
                            <h3 className="text-slate-200 text-[10px]">
                                {row.status} {row.to} for {row.tail} ◎
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
