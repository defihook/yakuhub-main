/* eslint-disable react-hooks/exhaustive-deps */
import { ReactNode, useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { CircularProgress, Divider, Typography, Grid } from '@mui/material';

// project imports
import NavItem from '../NavItem';
import NavCollapse from '../NavCollapse';
import { GenericCardProps } from 'types';
import { useAccess } from 'hooks/useAccess';
import { useWallet } from '@solana/wallet-adapter-react';
import { YAKU_COLLECTION_CREATORS } from 'config/config';
import useAuth from 'hooks/useAuth';
import { IconChevronDown, IconChevronUp } from '@tabler/icons';
import Collapsible from 'react-collapsible';

// ==============================|| SIDEBAR MENU LIST GROUP ||============================== //

export interface NavGroupProps {
    item: {
        id?: string;
        type?: string;
        icon?: GenericCardProps['iconPrimary'];
        children?: NavGroupProps['item'][];
        title?: ReactNode | string;
        caption?: ReactNode | string;
        checkAccess?: boolean;
        color?: 'primary' | 'secondary' | 'default';
        defaultOpen?: boolean;
    };
    openIdx: any;
    setOpenIdx: React.Dispatch<any>;
}

const NavGroup = ({ item, openIdx, setOpenIdx }: NavGroupProps) => {
    const theme = useTheme();
    const { checkAccess } = useAccess();
    const { publicKey } = useWallet();
    const [loading, setLoading] = useState(false);
    const [canAccess, setCanAccess] = useState(false);
    const { pass, yakuPass } = useAuth();

    // menu list collapse & items
    const items = item.children?.map((menu) => {
        switch (menu.type) {
            case 'collapse':
                return <NavCollapse key={menu.id} menu={menu} level={1} />;
            case 'item':
                return <NavItem key={menu.id} item={menu} level={1} />;
            default:
                return (
                    <Typography key={menu.id} variant="h6" color="error" align="center">
                        Menu Items Error
                    </Typography>
                );
        }
    });

    const updateSection = async () => {
        if (item.checkAccess) {
            setLoading(true);
            if (publicKey) {
                const hasAccess = await checkAccess(publicKey, YAKU_COLLECTION_CREATORS);
                setCanAccess(hasAccess);
                if (hasAccess) {
                    pass();
                }
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        if (item && item.defaultOpen) {
            setOpenIdx(item.id);
        }
        if (!yakuPass) {
            updateSection();
        } else {
            setCanAccess(yakuPass);
        }
    }, []);

    const ListComponentHeader = ({ open }: any) => {
        const Icon = item?.icon!;
        return (
            (item.title && (
                <Typography
                    variant="caption"
                    sx={{ ...theme.typography.menuCaption, my: '10px', cursor: 'pointer' }}
                    display="block"
                    gutterBottom
                >
                    <Grid
                        container
                        sx={{
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <Grid
                            item
                            xs={2}
                            sx={{
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {item?.icon && <Icon stroke={1.5} size="24px" />}
                        </Grid>
                        <Grid
                            item
                            xs={9}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}
                        >
                            {item.title}
                            {item.caption && (
                                <Typography variant="caption" sx={{ ...theme.typography.subMenuCaption }} display="block" gutterBottom>
                                    {item.caption}
                                </Typography>
                            )}
                        </Grid>
                        <Grid
                            item
                            xs={1}
                            sx={{
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {open ? <IconChevronUp /> : <IconChevronDown />}
                        </Grid>
                    </Grid>
                </Typography>
            )) || <></>
        );
    };

    const ListSection = ({ children, groupId }: any) => (
        <Collapsible
            transitionTime={100}
            transitionCloseTime={100}
            easing="ease-in-out"
            open={groupId === openIdx}
            trigger={<ListComponentHeader open={groupId === openIdx} />}
            triggerWhenOpen={<ListComponentHeader open={groupId === openIdx} />}
            onOpen={() => setOpenIdx(groupId)}
            onClose={() => setOpenIdx(-1)}
        >
            {children}
        </Collapsible>
    );

    return (
        <>
            {item.checkAccess ? (
                <>
                    {canAccess ? (
                        <>
                            {!loading ? (
                                <>
                                    <ListSection groupId={item.id}>{items}</ListSection>

                                    {/* group divider */}
                                    {/* <Divider sx={{ mt: 0.25, mb: 1.25 }} /> */}
                                </>
                            ) : (
                                <></>
                            )}
                        </>
                    ) : (
                        <>
                            {!loading ? (
                                <></>
                            ) : (
                                <>
                                    <ListSection groupId={item.id}>
                                        <Typography
                                            variant="caption"
                                            sx={{ ...theme.typography.subMenuCaption }}
                                            display="block"
                                            gutterBottom
                                        >
                                            <CircularProgress size="small" /> Checking your NFT
                                        </Typography>
                                    </ListSection>
                                    {/* group divider */}
                                    {/* <Divider sx={{ mt: 0.25, mb: 1.25 }} /> */}
                                </>
                            )}
                        </>
                    )}
                </>
            ) : (
                <>
                    <ListSection groupId={item.id}>{items}</ListSection>

                    {/* group divider */}
                    {/* <Divider sx={{ mt: 0.25, mb: 1.25 }} /> */}
                </>
            )}
        </>
    );
};

export default NavGroup;
