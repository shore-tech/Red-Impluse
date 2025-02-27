import { Alert, AppBar, Avatar, Box, Button, CircularProgress, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { AccountCircle, Logout } from '@mui/icons-material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import ReceiptIcon from '@mui/icons-material/Receipt';



import { JSX } from 'react/jsx-runtime';
import { useEffect, useState } from 'react';
import { User, getIdTokenResult, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';

import { auth } from './utils/firebaseConfig';
import { custom_claims } from './utils/dataInterface';

// components
import AuthLogin from './components/AuthLogin';
import Dummy from './components/dummy';


export default function App() {
    // This function will handle the layout of the app, and the initial authentication
    const [view, setView] = useState<JSX.Element>(<CircularProgress />)

    const [loginUser, setLoginUser] = useState<User | undefined>(undefined)
    const [userClaims, setUserClaims] = useState<custom_claims | undefined>(undefined)

    // 1. set up the app bar
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // 2. set up the drawer list
    const [drawOpen, setDrawerOpen] = useState<boolean>(false)
    const drawerWidth = 240;

    const DrawerList = (
        <Box sx={{ width: 250, ml: 1, mt: 1 }} role="presentation" onClick={() => setDrawerOpen(false)}>
            <List>
                <ListItem>{userClaims && `${auth.currentUser?.displayName} (${userClaims.role})`}</ListItem>
                <Divider />
                <ListItem>{auth.currentUser && auth.currentUser.email}</ListItem>
                <Divider />
                <ListItemButton>
                    <ListItemIcon> <EventAvailableIcon /> </ListItemIcon>
                    <ListItemText primary="課堂時間表" />
                </ListItemButton>
                <ListItemButton>
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
                    <ListItemText primary="登出" />
                </ListItemButton>
            </List>
        </Box>
    );


    // 3. determine which is the first page users should reach. 
    function handleLogOut() {
        auth.signOut().then(() => {
            console.log('user signed out');
            window.location.href = '/'
        }).catch((error) => {
            console.log(error.message);
        })
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                getIdTokenResult(user).then((idTokenResult) => {
                    const cunstomClaims: custom_claims = {
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
                setView(<AuthLogin />);
            }
        })
        return () => { unsubscribe(); }
    }, [auth])

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="sticky">
                <Toolbar >
                    <Avatar src="/favicon.ico" sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        赤兔道場-管理系統
                    </Typography>
                    {auth.currentUser && <> {/* if user is logged in, show the menu icon */}
                        <IconButton
                            size="large"
                            edge="end"
                            color="inherit"
                            aria-label="menu"
                            onClick={() => setDrawerOpen(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                    </>}
                </Toolbar>
                {auth.currentUser && <Drawer anchor="right" open={drawOpen} onClose={() => setDrawerOpen(false)}>
                    {DrawerList}
                </Drawer>}
            </AppBar>
            {view}
        </Box>
    );
}
