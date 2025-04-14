// react component for member page
import { useContext, useState } from "react";

// third party imports
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Avatar, Box, Button, FormControl, Grid, InputLabel, MenuItem, Modal, Select, TextField, Typography } from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { MuiTelInput } from "mui-tel-input";
import dayjs from "dayjs";

// local imports
import { btnBox, LoadingBox, MessageBox, styleFormHeadBox, styleModalBox } from "./CommonComponents";
import { CustomClaimsCtx, UserIdTokenCtx } from "../utils/contexts";

import { auth, db } from "../utils/firebaseConfig";
import axios from "axios";
import { cloudServerUrl, localServerUrl } from "../utils/firebaseConfigDetails";


export default function SystemUserAdd(props: { open: boolean, onClose: () => void, sysUsrEmailList: string[] }) {
    const userIdToken: string | undefined = useContext(UserIdTokenCtx)
    const userClaim = useContext(CustomClaimsCtx)
    const summaryDocRef = doc(db, '/system_user/summary')

    const [infoMessage, setInfoMessage] = useState<string | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [firstName, setFirstName] = useState<string>('')
    const [lastName, setLastName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [mobile, setMobile] = useState<string>('')

    const roleLvlPair: { [key: string]: number } = { 'admin': 4, 'manager': 3, 'assistance': 2, }
    const roleOptList: string[] = Object.keys(roleLvlPair)
    const [selectdRole, setSelectedRole] = useState<string>(roleOptList[0])


    const addSysUsr = async () => {
        if (!firstName || !lastName || !email || !mobile) { setErrorMessage('firstName, Last name, e-mail, and mobile are required.'); return }
        // check if email is existed
        if (props.sysUsrEmailList.includes(email)) { setErrorMessage(`Email ${email} is already existed!`); return }
        // check if sufficient permission to add
        if (userClaim!.roleLevel < roleLvlPair[selectdRole]) {
            setErrorMessage(`You do not have sufficient permission to add ${selectdRole} role user!`)
            return
        }
        setIsLoading(true)
        // calaulate the new sysusr id
        let newSysUsrId = ''
        let summaryDocData = {}
        await getDoc(summaryDocRef).then((docSnap) => {
            if (docSnap.exists() && Object.keys(docSnap.data()).length > 0) {
                summaryDocData = docSnap.data()
                let sys_usr_list: string[] | number[] = Object.keys(summaryDocData)
                sys_usr_list = sys_usr_list.map((id) => parseInt(id.split('_')[1]))
                newSysUsrId = `usr_${('000' + (Math.max(...sys_usr_list) + 1)).slice(-4)}`
            } else {
                newSysUsrId = 'usr_001'
            }
        }).catch((error) => {
            setErrorMessage(`Error getting summary document: ${error.message}`)
            return
        })

        // create authentication for user
        await axios.post(`${cloudServerUrl}/addSystemUser`, {
            displayName: `${firstName} ${lastName}`,
            email: email,
            mobile: mobile,
            role: selectdRole,
            roleLevel: roleLvlPair[selectdRole],
        }, {
            headers: { Authorization: `Bearer ${userIdToken}` }
        }).then(async (res) => {
            console.log('res', res.data)
            if (res.status === 200) {
                // add new sys user to the summary doc
                await updateDoc(summaryDocRef, {
                    [newSysUsrId]: {
                        email: email,
                        mobile: mobile,
                        role: selectdRole,
                        roleLevel: roleLvlPair[selectdRole],
                        displayName: `${firstName} ${lastName}`,
                        firstName: firstName,
                        lastName: lastName,
                        CreatedBy: auth.currentUser?.email,
                        CreatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    }
                }).then(() => {
                    setSuccessMessage(`系統使用者 ${email} 已成功創建`)
                }).catch((error) => {
                    setErrorMessage(`Error creating new member: ${error.message}`)
                })
            }
        }).catch((err) => {
            console.log('err', err);
            setErrorMessage(`${err.response.data.error}`);
            return
        })

    }

    const handleCloseAndClear = () => {
        setSuccessMessage(undefined)
        props.onClose()
    }

    return (
        <Modal open={props.open} onClose={props.onClose} >
            <Box sx={styleModalBox}>
                <Box sx={styleFormHeadBox}>
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}> <PersonAddIcon /> </Avatar>
                    <Typography variant="h5">
                        Add New Member
                    </Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='First Name 名字'
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='Last Name 姓氏'
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label={'email 電郵'}
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <MuiTelInput
                            fullWidth={true}
                            defaultCountry='HK'
                            onlyCountries={['AU', 'HK']}
                            forceCallingCode
                            label={'Mobile 手機號碼'}
                            value={mobile}
                            onChange={(inputValue, phoneInfo) => setMobile(phoneInfo.numberValue as string)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Role 角色</InputLabel>
                            <Select
                                label="Role 角色"
                                value={selectdRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                {roleOptList.map((item, index) => (
                                    <MenuItem key={index} value={item}>{item}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='Role level 角色級別'
                            value={roleLvlPair[selectdRole]}
                            disabled
                        />
                    </Grid>
                    <Box sx={btnBox}>
                        <Button variant="contained" onClick={addSysUsr} disabled={!userIdToken}>新增</Button>
                        <Button variant="contained" onClick={props.onClose}>取消</Button>
                    </Box>
                </Grid>
                {isLoading && <LoadingBox open={isLoading} onClose={() => setIsLoading(false)} />}
                {infoMessage && <MessageBox open={infoMessage ? true : false} onClose={() => { setIsLoading(false); setInfoMessage(undefined) }} type='info' message={infoMessage} />}
                {errorMessage && <MessageBox open={errorMessage ? true : false} onClose={() => { setIsLoading(false); setErrorMessage(undefined) }} type='error' message={errorMessage} />}
                {successMessage && <MessageBox open={successMessage ? true : false} onClose={() => handleCloseAndClear()} type='success' message={successMessage} />}

            </Box>
        </Modal >
    );
}
