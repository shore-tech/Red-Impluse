// react component for member page
import { useEffect, useRef, useState } from 'react';
import { JSX } from 'react/jsx-runtime';

// third party imports
import { User, getIdTokenResult, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { Alert, AppBar, Avatar, Box, Button, CircularProgress, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { AccountCircle, Logout } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import MenuIcon from '@mui/icons-material/Menu';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import ReceiptIcon from '@mui/icons-material/Receipt';

// local components
import AuthLogin from './components/AuthLogin';
import Dummy from './components/dummy';
import Member from './components/Member';
import { auth } from './utils/firebaseConfig';
import { CustomClaims } from './utils/dataInterface';
import { CustomClaimsCtx } from './utils/contexts';

// date time
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-hk';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Hong_Kong");


export default function App() {
    // This function will handle the layout of the app, and the initial authentication
    const [view, setView] = useState<JSX.Element>(<CircularProgress />)

    const [userClaims, setUserClaims] = useState<CustomClaims | undefined>(undefined)

    // 1. create ref height from app bar
    const [appBarHeight, setAppBarHeight] = useState<number>(0)
    const appBarRef = useRef<HTMLDivElement>(null);

    // 2. set up the drawer list
    const [drawOpen, setDrawerOpen] = useState<boolean>(false)
    const [drawerWidth, setDrawerWidth] = useState<number>(0)

    const DrawerList = (
        <Box sx={{ width: drawerWidth, ml: 0, mt: 0, display: 'block' }} onClick={() => setDrawerOpen(false)}>
            <List sx={{ backgroundColor: '#1976d2', height: appBarHeight, padding: 0, boxShadow: 3 }} >
                <ListItem >
                    <ListItemIcon> < AccountCircle /> </ListItemIcon>
                    <ListItemText primary={userClaims?.role} sx={{ color: 'white' }} />
                </ListItem>
            </List>
            <List>
                <ListItemButton >
                    <ListItemIcon> <EventAvailableIcon /> </ListItemIcon>
                    <ListItemText primary="課堂時間表" />
                </ListItemButton>
                <ListItemButton onClick={() => setView(<Member />)}>
                    <ListItemIcon> <AccountBoxIcon /> </ListItemIcon>
                    <ListItemText primary="會員管理" />
                </ListItemButton>
                <ListItemButton>
                    <ListItemIcon> <ReceiptIcon /> </ListItemIcon>
                    <ListItemText primary="報表" />
                </ListItemButton>
                <Divider />
                <ListItemButton onClick={() => handleLogOut()}>
                    <ListItemIcon> <Logout /> </ListItemIcon>
                    <ListItemText primary={`登出 ${auth.currentUser?.displayName}`} />
                </ListItemButton>
            </List>
        </Box>
    );


    // 3. determine which is the first page users should reach. 
    function handleLogOut() {
        auth.signOut().then(() => {
            console.log('user signed out');
            setDrawerWidth(0)
        }).catch((error) => {
            console.log(error.message);
        })
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setDrawerWidth(250);
                getIdTokenResult(user).then((idTokenResult) => {
                    const cunstomClaims: CustomClaims = {
                        role: idTokenResult.claims.role as 'super-admin' | 'admin' | 'manager' | 'coach' | 'member',
                        roleLevel: idTokenResult.claims.roleLevel as 5 | 4 | 3 | 2 | 1,
                        createdBy: idTokenResult.claims.createdBy as string,
                    }
                    console.log(cunstomClaims);
                    setUserClaims(cunstomClaims);
                    setView(<Dummy />);
                    console.log(auth.currentUser?.email);
                })
            } else {
                setDrawerWidth(0);
                setView(<AuthLogin />);
            }
        })
        return () => { unsubscribe(); }
    }, [auth])

    useEffect(() => {
        // Get the height of the AppBar after the component mounts
        if (appBarRef.current) {
            setAppBarHeight(appBarRef.current.getBoundingClientRect().height);
        }
    }, [appBarRef]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='zh-hk'>
            <CustomClaimsCtx.Provider value={userClaims}>
                <Box sx={{ width: { md: `calc(100% - ${drawerWidth}px)`, xs: '100%' } }}>
                    <AppBar position="sticky" ref={appBarRef}>
                        <Toolbar >
                            <Avatar src="/favicon.ico" sx={{ mr: 2 }} />
                            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                赤兔道場-管理系統
                            </Typography>
                            {auth.currentUser && <> {/* if user is logged in, show the menu icon */}
                                <IconButton color="inherit" sx={{ display: { md: 'none' } }} onClick={() => setDrawerOpen(true)} >
                                    <MenuIcon />
                                </IconButton>
                            </>}
                        </Toolbar>
                    </AppBar>
                    {view}
                </Box>
                {/* side bar */}
                {auth.currentUser &&
                    <Box>
                        {/* xs view */}
                        <Drawer anchor='right' sx={{ display: { md: 'none' } }} open={drawOpen} onClose={() => setDrawerOpen(false)} >
                            {DrawerList}
                        </Drawer>
                        {/* md view */}
                        <Drawer variant='permanent' anchor='right' sx={{ display: { xs: 'none', md: 'block' } }}>
                            {DrawerList}
                        </Drawer>
                    </Box>
                }

            </CustomClaimsCtx.Provider >
        </LocalizationProvider>
    );
}
