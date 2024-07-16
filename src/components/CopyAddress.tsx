import { CopyOutlined } from '@ant-design/icons';
import { Box } from '@mui/material';
import copy from 'copy-to-clipboard';
import { useState } from 'react';

export default function CopyAddress(props: { address: string; length?: number }) {
    const { address, length = 10 } = props;
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = (text: string) => {
        copy(text);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    };

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                margin: '5px 0'
            }}
            onClick={() => handleCopy(address)}
        >
            {address.slice(0, length)}...{address.slice(-1 * length)}
            <span style={{ paddingLeft: 4 }}>{!isCopied ? <CopyOutlined /> : <span className="copied">Copied!</span>}</span>
        </Box>
    );
}
