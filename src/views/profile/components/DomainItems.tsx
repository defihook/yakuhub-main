/* eslint-disable react-hooks/exhaustive-deps */
import { List, ListItem, Skeleton, Typography } from '@mui/material';
import { DomainByWallet } from 'utils/bonfida';
import CopyAddress from 'components/CopyAddress';

const DomainItems = (props: { domains: DomainByWallet[]; isLoading: boolean }) => {
    const { domains, isLoading } = props;
    return (
        <List>
            <ListItem
                sx={{
                    gap: 1,
                    justifyContent: 'space-between'
                }}
            >
                <Typography component="p" sx={{ width: '30%' }} fontWeight={700} noWrap>
                    Domain Name
                </Typography>
                <Typography component="p" sx={{ width: '30%', textAlign: 'center' }} fontWeight={700} noWrap>
                    Domain Address
                </Typography>
                <Typography component="p" sx={{ width: '40%', textAlign: 'center' }} fontWeight={700} noWrap>
                    Domain Class Address
                </Typography>
            </ListItem>
            {!isLoading
                ? domains.map((item, key) => (
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
                          <Typography component="p" sx={{ width: '30%' }} noWrap>
                              {item.name}
                          </Typography>
                          <Typography component="p" sx={{ width: '30%', display: 'flex', justifyContent: 'center' }}>
                              <CopyAddress address={item.address} length={5} />
                          </Typography>
                          <Typography component="p" sx={{ width: '40%', display: 'flex', justifyContent: 'center' }}>
                              <CopyAddress address={item.class} length={5} />
                          </Typography>
                      </ListItem>
                  ))
                : [1, 2, 3, 4].map((item, key) => (
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
                          <Skeleton variant="rounded" sx={{ width: '30%' }} />
                          <Skeleton variant="rounded" sx={{ width: '30%' }} />
                          <Skeleton variant="rounded" sx={{ width: '40%' }} />
                      </ListItem>
                  ))}
        </List>
    );
};
export default DomainItems;
