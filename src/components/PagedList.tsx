/* eslint-disable react-hooks/exhaustive-deps */
import { Breakpoint, Container, Grid, Pagination, Typography, useTheme } from '@mui/material';
import { filter, map } from 'lodash';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

export default function PagedList(props: {
    component: any;
    pageSize: number;
    masterList: Array<any>;
    pageList: Array<any>;
    isLoading?: boolean;
    spacing?: number;
    disableGutters?: boolean;
    sx?: any;
    contentSx?: any;
    maxWidth?: false | Breakpoint;
    getPage: (page: number, chunked?: Array<Array<any>>) => any;
    currentPage?: number;
}) {
    const theme = useTheme();
    const {
        component,
        masterList,
        pageList,
        getPage,
        currentPage,
        pageSize,
        isLoading = false,
        spacing = 3,
        disableGutters = false,
        sx,
        contentSx,
        maxWidth
    } = props;
    const [page, setPage] = useState(currentPage || 1);
    const CustomComponent = component;

    const handlePageChange = (event: any, value: number) => {
        setPage(value);
        getPage(value);
    };

    useEffect(() => {
        if (masterList && (masterList.length === 0 || masterList.length < page)) {
            setPage(currentPage || 1);
        }
    }, [masterList]);
    return (
        <Container maxWidth={maxWidth === undefined ? 'xl' : maxWidth} disableGutters={disableGutters} sx={sx}>
            <Grid container spacing={spacing} sx={contentSx}>
                {pageList &&
                    pageList.length !== 0 &&
                    map(pageList, (item: any, key: number) => (
                        <CustomComponent
                            {...item}
                            isLoading={isLoading}
                            theme={theme}
                            index={key}
                            page={page}
                            pageSize={pageSize}
                            key={key}
                        />
                    ))}
                <Grid item xl={12}>
                    {!isLoading && masterList && masterList.length === 0 && (
                        <Typography component="p">
                            <FormattedMessage id="wallet-empty" />
                        </Typography>
                    )}
                </Grid>
            </Grid>
            <Pagination
                count={masterList.length}
                color="primary"
                page={page}
                onChange={handlePageChange}
                sx={{
                    justifyContent: 'center',
                    display: 'flex'
                }}
            />
        </Container>
    );
}
