import { Typography } from "@mui/material";
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export const defaultTheme = createTheme();

export function Copyright(props: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="">
                DH3 Shore
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

export const styleModalBox = {
    bgcolor: "#fff9e0",
    position: 'absolute' as 'absolute',
    overflow: 'auto',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "80%",
    height: "80%",
    borderRadius: 5,
    border: '1px solid #f6f6f6',
    boxShadow: 24,
    p: 4,
    color: '#5d13e7',
    marginTop: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
}

export const styleFormBox = {
    marginTop: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
}