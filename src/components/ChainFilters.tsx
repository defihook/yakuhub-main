import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import EthereumLogo from 'assets/images/blockchains/ethereum-icon.png';
import SolanaLogo from 'assets/images/icons/solana-logo.png';

const ChainButton = styled(Button)({
    borderRadius: '40px',
    px: 2
});

interface ChainLogos {
    eth: string;
    sol: string;
}

interface ChainFilterProps {
    onFilterChange: (value?: string) => void;
}

function ChainFilters({ onFilterChange }: ChainFilterProps) {
    const [selected, setSelected] = useState('all');
    const createChainIcon = (chain: string) => {
        const chainLogos: ChainLogos = {
            eth: EthereumLogo,
            sol: SolanaLogo
        };
        const chainLogo = chainLogos[chain as keyof ChainLogos];

        return (
            <Avatar
                src={chainLogo}
                sx={{
                    width: 16,
                    height: 16,
                    objectFit: 'contain',
                    ml: 1
                }}
                color="inherit"
            />
        );
    };

    const onClick = (value: string) => {
        setSelected(value);
        if (value === 'all') {
            onFilterChange();
        } else {
            onFilterChange(value);
        }
    };

    return (
        <Stack direction="row" sx={{ borderColor: '#33273f', borderWidth: '0.5px', borderStyle: 'solid', borderRadius: '40px' }}>
            <ChainButton variant={selected === 'all' ? 'contained' : 'text'} onClick={() => onClick('all')} color="secondary">
                All
            </ChainButton>
            <ChainButton
                onClick={() => onClick('sol')}
                startIcon={createChainIcon('sol')}
                variant={selected === 'sol' ? 'contained' : 'text'}
                color="secondary"
            >
                Solana
            </ChainButton>
            <ChainButton
                onClick={() => onClick('eth')}
                startIcon={createChainIcon('eth')}
                variant={selected === 'eth' ? 'contained' : 'text'}
                color="secondary"
            >
                Ethereum
            </ChainButton>
        </Stack>
    );
}

export default ChainFilters;
