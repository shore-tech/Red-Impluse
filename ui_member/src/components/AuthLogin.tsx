import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

import { Dispatch, SetStateAction, useState } from 'react';
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence, browserLocalPersistence, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider, Auth, signInWithRedirect, getRedirectResult, UserCredential, FacebookAuthProvider } from 'firebase/auth';
import { auth, authGoogleProvider } from '../utils/firebaseConfig';
import { Copyright } from './CommonComponents';
import { Alert } from '@mui/material';
import Divider from '@mui/material/Divider';
import { JSX } from 'react/jsx-runtime';
import ClassSchedule from './ClassSchedule';


export default function AuthLogin(props: { setView: Dispatch<SetStateAction<JSX.Element>> }) {
    const [resMessage, setResMessage] = useState<JSX.Element | undefined>(undefined)
    const [isForgetPassword, setIsforgetPassword] = useState<boolean>(false)
    const [isPswResetEmailSent, setIsPswResetEmailSent] = useState<boolean>(false)

    const [login, setLogin] = useState({
        email: '',
        password: ''
    })

    function handleFormchange(e: React.ChangeEvent<HTMLInputElement>) {
        setLogin({
            ...login,
            [e.target.name]: e.target.value
        })
    }

    function handleLogin() {
        console.log('function login is called');
        setPersistence(auth, browserLocalPersistence).then(() => {
            signInWithEmailAndPassword(auth, login.email, login.password).then((result: UserCredential) => {
                console.log('login success with password');
                props.setView(<ClassSchedule setView={props.setView} />)
            }).catch((error) => {
                console.log(error.message);
                setResMessage(<Alert severity="error">email/password incorrect</Alert>);
            });
        });
    }

    function resetPassword() {
        if (login.email === '') {
            setResMessage(<Alert severity="error">Please enter your email address</Alert>)
            return
        } else {
            sendPasswordResetEmail(auth, login.email).then(() => {
                setResMessage(<Alert severity="success">Password reset email has been sent to {login.email}</Alert>)
            }).catch((error) => {
                setResMessage(<Alert severity="error">{error.message}</Alert>)
            })
        }
    }

    function loginWithGoogle() {
        console.log('login with google is called');
        signInWithPopup(auth, authGoogleProvider).then((result: UserCredential) => {
            console.log('login success with google');
            // result.user.getIdToken().then((idToken) => {
            //     console.log('ID Token:', idToken); // Logs the ID token
            // });
        }).catch((error) => {
            console.log(error.message);
            setResMessage(<Alert variant="filled" severity="error"> 你沒有登入權限，請聯絡系統管理員。</Alert>)
        })
    }


    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', }} >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5"> Sign in </Typography>

                {resMessage && resMessage}
                {!isForgetPassword
                    ? <Box>
                        <Box component="form" noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                onChange={handleFormchange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') { handleLogin() }
                                }}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                onChange={handleFormchange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') { handleLogin() }
                                }}
                            />
                            <Button variant="contained" sx={{ width: '50%', display: 'block', margin: 'auto', my: 1 }} onClick={handleLogin} >
                                登入
                            </Button>
                            <Button variant='outlined' sx={{ width: '50%', display: 'block', margin: 'auto', my: 1 }} onClick={() => { setIsforgetPassword(true); setResMessage(undefined) }}>
                                忘記密碼？
                            </Button>
                        </Box>
                        <Divider variant='fullWidth' sx={{ my: 2 }}>Login in with</Divider>
                        <Button variant='contained' sx={{ width: '30%', display: 'block', margin: 'auto', my: 1, borderRadius: '50px', textTransform: 'none' }} onClick={loginWithGoogle}>
                            Google
                        </Button>
                    </Box>
                    : <> {/*reset password*/}
                        {!resMessage && <>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={login.email}
                                onChange={handleFormchange}
                            />
                            <Button variant='outlined' onClick={resetPassword}>
                                Reset Password
                            </Button>
                        </>}
                    </>
                }
            </Box>
            {/* <Copyright sx={{ mt: 8, mb: 4 }} /> */}
        </Container>
    );
}


