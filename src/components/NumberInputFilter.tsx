import { Button, Tooltip, Typography, InputAdornment, FormControl, OutlinedInput } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import { useState } from 'react';

const NumberInputFilter = ({ isPrice = false, apply, min, max, step, description }: any) => {
    const [minValue, setMinValue] = useState<Number>(min);
    const [maxValue, setMaxValue] = useState<Number>(max === 0 ? 10000 : max);

    return (
        <div>
            <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                <div>
                    <Typography variant="body1" component="body">
                        Min
                    </Typography>
                    <FormControl variant="outlined" sx={{ paddingTop: '8px' }}>
                        <OutlinedInput
                            id="outlined-adornment-weight"
                            type="number"
                            value={minValue}
                            onChange={(e) => setMinValue(+e.target.value)}
                            startAdornment={isPrice && <InputAdornment position="start">◎</InputAdornment>}
                            aria-describedby="outlined-weight-helper-text"
                            size="small"
                            inputProps={{
                                inputMode: 'numeric',
                                pattern: '[0-9]*',
                                step
                            }}
                        />
                    </FormControl>
                </div>
                <Typography variant="body1" component="body" sx={{ padding: '24px 4px 0 4px' }}>
                    to
                </Typography>
                <div>
                    <Typography variant="body1" component="body">
                        Max
                    </Typography>
                    <FormControl variant="outlined" sx={{ paddingTop: '8px' }}>
                        <OutlinedInput
                            id="outlined-adornment-weight"
                            type="number"
                            value={maxValue}
                            onChange={(e) => setMaxValue(+e.target.value)}
                            startAdornment={isPrice && <InputAdornment position="start">◎</InputAdornment>}
                            aria-describedby="outlined-weight-helper-text"
                            size="small"
                            inputProps={{
                                inputMode: 'numeric',
                                pattern: '[0-9]*',
                                step
                            }}
                        />
                    </FormControl>
                </div>
            </Typography>
            <Typography
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    float: 'left',
                    paddingTop: '12px',
                    gap: '12px'
                }}
            >
                <Button
                    sx={{ ml: 'auto', borderRadius: 30 }}
                    color="secondary"
                    variant="contained"
                    onClick={() => apply(minValue, maxValue)}
                >
                    <Typography component="p" noWrap>
                        Apply
                    </Typography>
                </Button>
                <Tooltip title={description}>
                    <HelpOutline />
                </Tooltip>
            </Typography>
        </div>
    );
};

export default NumberInputFilter;
