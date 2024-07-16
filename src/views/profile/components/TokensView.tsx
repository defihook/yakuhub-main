/* eslint-disable react-hooks/exhaustive-deps */
import { queries } from '../../../graphql/graphql';
import { useEffect, useState } from 'react';
import { Avatar, Box, List, ListItem, Skeleton, Typography } from '@mui/material';
import { IMAGE_PROXY } from 'config/config';
import { get, includes, map, orderBy, round, toLower } from 'lodash';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import TokenChart from 'components/TokenChart';
import { useYakuUSDCPrice } from 'contexts/JupitarContext';
import { useNavigate } from 'react-router-dom';
import { ArrowDownwardOutlined } from '@mui/icons-material';

const SortingArrow = ({ fieldNames, orderField, ordering }: any) => (
    <>
        {includes(fieldNames, orderField) ? (
            <ArrowDownwardOutlined sx={{ fontSize: 14, transform: ordering === 'ASC' ? 'rotate(180deg)' : 'none' }} />
        ) : (
            <></>
        )}
    </>
);
const TokensView = ({ wallet, tabIdx }: any) => {
    const navigate = useNavigate();
    const yakuUSDCPrice = useYakuUSDCPrice();
    const [tokenList, setTokenList] = useState<any[]>([]);
    const [priceList, setPriceList] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [orderField, setOrderField] = useState<string>('estValue');
    const [ordering, setOrdering] = useState<boolean | 'asc' | 'desc'>('desc');
    const coinIdSymbols: Record<string, string> = {
        usdc: 'usd-coin',
        usdt: 'tether',
        dust: 'dust-protocol'
    };
    const [getAccountTokens] = useAuthLazyQuery(queries.GET_ACCOUNT_TOKENS, {
        variables: {
            account: wallet
        }
    });
    const [getSimplePrice] = useAuthLazyQuery(queries.GET_SIMPLE_PRICE);

    const handleFilterChange = (event: any) => {
        const {
            target: { value }
        } = event;
        if (value === orderField) {
            const newOrdering = ordering === 'desc' ? 'asc' : 'desc';
            setOrdering(newOrdering);
            setTokenList(orderBy(tokenList, value, newOrdering));
            return;
        }
        setOrderField(value);
        setOrdering('desc');
        setTokenList(orderBy(tokenList, value, 'desc'));
    };
    const updateView = async () => {
        setIsLoading(true);
        setTokenList([]);
        try {
            const { data } = await getAccountTokens({
                variables: {
                    account: wallet
                }
            });

            if (data && data?.getAccountTokens) {
                const { data: priceData } = await getSimplePrice({
                    variables: {
                        params: {
                            ids: map(
                                data?.getAccountTokens,
                                ({ tokenSymbol }) => coinIdSymbols[toLower(tokenSymbol)] || toLower(tokenSymbol)
                            ),
                            vs_currencies: ['usd']
                        }
                    }
                });
                const prices = priceData?.simplePrice?.data;
                setPriceList(prices);
                const tokens = map(data?.getAccountTokens, ({ tokenIcon, tokenName, tokenAmount, tokenSymbol }: any) => ({
                    coinId: coinIdSymbols[toLower(tokenSymbol)] || toLower(tokenSymbol),
                    tokenIcon,
                    tokenName,
                    amount: Number(tokenAmount?.uiAmount),
                    estValue:
                        Number(tokenAmount?.uiAmount) * +getCoinPrice(coinIdSymbols[toLower(tokenSymbol)] || toLower(tokenSymbol), prices)
                }));
                setTokenList(orderBy(tokens, orderField, ordering));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCoinPrice = (coinId: string, prices = priceList) => {
        if (coinId === 'yaku') {
            return yakuUSDCPrice;
        }
        return get(prices, [coinId, 'usd'], 0);
    };

    useEffect(() => {
        if (wallet) {
            updateView();
        }
    }, [wallet, tabIdx]);
    return (
        <List>
            <ListItem
                sx={{
                    gap: 1,
                    justifyContent: 'space-between'
                }}
            >
                <Box sx={{ width: 40 }} />
                <Typography component="p" sx={{ width: '18%' }} fontWeight={700} noWrap>
                    Name
                </Typography>
                <Typography component="p" sx={{ width: '40%', textAlign: 'end' }} fontWeight={700} noWrap />
                <Typography
                    component="p"
                    sx={{ width: '18%', textAlign: 'end' }}
                    fontWeight={700}
                    noWrap
                    onClick={() => handleFilterChange({ target: { value: 'amount' } })}
                >
                    Amount <SortingArrow {...{ orderField, fieldNames: ['amount'], ordering }} />
                </Typography>
                <Typography
                    component="p"
                    sx={{ width: '24%', textAlign: 'end' }}
                    fontWeight={700}
                    noWrap
                    onClick={() => handleFilterChange({ target: { value: 'estValue' } })}
                >
                    Est. Value (USD) <SortingArrow {...{ orderField, fieldNames: ['estValue'], ordering }} />
                </Typography>
            </ListItem>
            {!isLoading
                ? map(tokenList, ({ coinId, tokenIcon, tokenName, amount, estValue }) => (
                      <ListItem
                          sx={{
                              gap: 1,
                              justifyContent: 'space-between',
                              '&:hover': {
                                  backgroundColor: '#d329ff15'
                              }
                              //   cursor: 'pointer'
                          }}
                          //   onClick={() =>
                          //       navigate(`/explore/token/${coinIdSymbols[toLower(tokenSymbol)] || toLower(tokenSymbol)}`)
                          //   }
                      >
                          <Avatar src={`${IMAGE_PROXY}${tokenIcon}`} />
                          <Typography component="p" sx={{ width: '18%' }} noWrap>
                              {tokenName}
                          </Typography>
                          <Box sx={{ width: '40%' }}>
                              <TokenChart coinId={coinId} />
                          </Box>
                          <Typography component="p" sx={{ width: '18%', textAlign: 'end' }} noWrap>
                              {round(amount, 4).toLocaleString()}
                          </Typography>
                          <Typography component="p" sx={{ width: '18%', textAlign: 'end' }} noWrap>
                              ${round(estValue, 4).toLocaleString()}
                          </Typography>
                      </ListItem>
                  ))
                : map([1, 2, 3, 4, 5, 6, 7, 8], (idx, key) => (
                      <ListItem
                          key={key}
                          sx={{
                              gap: 1,
                              justifyContent: 'space-between',
                              '&:hover': {
                                  backgroundColor: '#d329ff15'
                              }
                          }}
                      >
                          <Skeleton variant="circular" width={24} height={24} />
                          <Skeleton variant="rounded" sx={{ width: '18%' }} />
                          <Skeleton variant="rounded" sx={{ width: '40%' }} />
                          <Skeleton variant="rounded" sx={{ width: '18%' }} />
                          <Skeleton variant="rounded" sx={{ width: '18%' }} />
                      </ListItem>
                  ))}
        </List>
    );
};

export default TokensView;
