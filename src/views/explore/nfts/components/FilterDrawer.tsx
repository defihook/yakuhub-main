import { map } from 'lodash';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NumberInputFilter from 'components/NumberInputFilter';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Checkbox,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    Switch,
    Typography
} from '@mui/material';
import { SyntheticEvent, useState } from 'react';

const FilterDrawer = ({
    open,
    setOpen,
    forceReload,
    priceRange,
    setPriceRange,
    rankRange,
    setRankRange,
    forSale,
    setForSale,
    supply,
    filters,
    handleFilterChange,
    handleRemoveFilter,
    data,
    MIN_PRICE,
    MAX_PRICE,
    tabIdx,
    chain
}: any) => {
    const [expanded, setExpanded] = useState<string | false>(false);

    const handleAccordionChange = (panel: string) => (event: SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };
    return (
        <div style={{ display: open ? 'block' : 'none', width: '320px', marginTop: '12px', marginRight: '8px' }}>
            {chain === 'SOL' && tabIdx === 'items' && (
                <Accordion
                    expanded={false}
                    sx={{
                        borderBottom: '1px solid #2a2a2a',
                        borderRadius: '8px',
                        ':first-of-type': {
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px'
                        }
                    }}
                >
                    <AccordionSummary aria-controls="listingTypebh-content" id="listingTypebh-header">
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>For sale</Typography>
                            <Switch
                                color="secondary"
                                checked={forSale}
                                onChange={() => {
                                    const isSale = !forSale;
                                    setForSale(isSale);
                                    forceReload({ onlyListings: isSale });
                                }}
                                inputProps={{ 'aria-label': 'controlled' }}
                                size="small"
                            />
                        </div>
                    </AccordionSummary>
                </Accordion>
            )}
            {chain === 'SOL' && tabIdx === 'items' && (
                <Accordion
                    expanded={expanded === 'pricerange'}
                    onChange={handleAccordionChange('pricerange')}
                    sx={{
                        borderBottom: '1px solid #2a2a2a',
                        margin: '0 !important',
                        ':before': {
                            backgroundColor: '#2a2a2a'
                        }
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="pricerangebh-content" id="pricerangebh-header">
                        <Typography>Price</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 4, display: 'flex', gap: 2, justifyContent: 'flex-start', alignItems: 'center' }}>
                        <NumberInputFilter
                            min={MIN_PRICE}
                            max={MAX_PRICE}
                            step={0.001}
                            description="Range is inclusive"
                            apply={(minPrice?: number, maxPrice?: number) => {
                                if (!minPrice || !maxPrice) return;
                                if (minPrice >= MIN_PRICE && maxPrice <= MAX_PRICE) {
                                    setPriceRange([minPrice, maxPrice]);
                                    forceReload({ priceFilter: { min: minPrice, max: maxPrice } });
                                }
                            }}
                            isPrice
                        />
                    </AccordionDetails>
                </Accordion>
            )}
            {chain === 'SOL' && tabIdx === 'items' && (
                <Accordion
                    expanded={expanded === 'rank'}
                    onChange={handleAccordionChange('rank')}
                    sx={{
                        borderBottom: '1px solid #2a2a2a',
                        margin: '0 !important',
                        ':before': {
                            backgroundColor: '#2a2a2a'
                        }
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="rankbh-content" id="rankbh-header">
                        <Typography>Rank</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 4, display: 'flex', gap: 2, justifyContent: 'flex-start', alignItems: 'center' }}>
                        <NumberInputFilter
                            min={1}
                            max={supply}
                            step={1}
                            description="Range is inclusive"
                            apply={(minRank?: number, maxRank?: number) => {
                                if (!minRank || !maxRank) return;
                                if (minRank >= 1 && maxRank <= supply) {
                                    setRankRange([minRank, maxRank]);
                                    forceReload({ rankFilter: { min: minRank, max: maxRank } });
                                }
                            }}
                        />
                    </AccordionDetails>
                </Accordion>
            )}
            {/* <Accordion
                expanded={expanded === 'attributes'}
                onChange={handleAccordionChange('attributes')}
                sx={{
                    borderBottom: '1px solid #2a2a2a',
                    margin: '0 !important',
                    ':last-of-type': {
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px'
                    },
                    ':before': {
                        backgroundColor: '#2a2a2a'
                    }
                }}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="attributes-content" id="attributes-header">
                    <Typography sx={{ textTransform: 'capitalize' }}>Attributes</Typography>
                </AccordionSummary>
                <AccordionDetails> */}
            {data?.length > 0 &&
                data[0]?.project?.project_attributes?.map(({ name, type, values }: any, idx: number) => (
                    <Accordion
                        expanded={expanded === name}
                        onChange={handleAccordionChange(name)}
                        sx={{
                            borderBottom: '1px solid #2a2a2a',
                            margin: '0 !important',
                            ':last-of-type': {
                                borderBottomLeftRadius: '8px',
                                borderBottomRightRadius: '8px'
                            },
                            ':before': {
                                backgroundColor: '#2a2a2a'
                            }
                        }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="att-content" id="att-header">
                            <Typography sx={{ textTransform: 'capitalize' }}>{name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormControl sx={{ m: 1, width: 270 }}>
                                <InputLabel id={name} sx={{ textTransform: 'capitalize' }}>
                                    {name}
                                </InputLabel>
                                <Select
                                    labelId={name}
                                    id={name}
                                    multiple
                                    value={filters[name]?.values || []}
                                    onChange={(e) => handleFilterChange(e, name, type)}
                                    input={<OutlinedInput label={name} />}
                                    renderValue={(selected) => selected.join(', ')}
                                    sx={{
                                        width: 250
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 48 * 4.5 + 8,
                                                width: 250
                                            }
                                        }
                                    }}
                                >
                                    {map(values, (v) => (
                                        <MenuItem key={v} value={v}>
                                            <Checkbox checked={filters[name]?.values.indexOf(v) > -1} color="secondary" />
                                            <ListItemText primary={v} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </AccordionDetails>
                    </Accordion>
                ))}
            {/* </AccordionDetails>
            </Accordion> */}
        </div>
    );
};

export default FilterDrawer;
