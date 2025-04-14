// react component for member page
import React from "react";
import { useContext, useState } from "react";

// third party imports
import { deleteField, doc, getDoc, updateDoc } from "firebase/firestore";
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
import { SystemUserObj } from "../utils/dataInterface";


export default function SystemUserEdit(props: { open: boolean, onClose: () => void, selectedRow: SystemUserObj }) {
    const userIdToken: string | undefined = useContext(UserIdTokenCtx)
    const userClaim = useContext(CustomClaimsCtx)
    const summaryDocRef = doc(db, '/system_user/summary')

    const [infoMessage, setInfoMessage] = useState<string | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [showCfmDelBtn, setShowCfmDelBtn] = useState<boolean>(false)

    const [firstName, setFirstName] = useState<string>(props.selectedRow.firstName)
    const [lastName, setLastName] = useState<string>(props.selectedRow.lastName)
    const [email, setEmail] = useState<string>(props.selectedRow.email)
    const [mobile, setMobile] = useState<string>(props.selectedRow.mobile)

    const roleLvlPair: { [key: string]: number } = { 'admin': 4, 'manager': 3, 'assistance': 2, }
    const roleOptList: string[] = Object.keys(roleLvlPair)
    const [selectdRole, setSelectedRole] = useState<string>(props.selectedRow.role)


    const editSysUsr = async () => {
        if (!firstName || !lastName || !email || !mobile) { setErrorMessage('firstName, Last name, e-mail, and mobile are required.'); return }
        // check if sufficient permission to add
        if (userClaim!.roleLevel < roleLvlPair[selectdRole]) {
            setErrorMessage(`You do not have sufficient permission to edit ${selectdRole} role user!`)
            return
        }
        setIsLoading(true)

        // edit authentication for user
        await axios.post(
            `${localServerUrl}/editSystemUser`,
            // `${cloudServerUrl}/editSystemUser`,
            {
                targetEmail: email,                         // for updateUser()
                displayName: `${firstName} ${lastName}`,    // for updateUser()
                role: selectdRole,                          // for updateUserRole()
                roleLevel: roleLvlPair[selectdRole],        // for updateUserRole()
            },
            { headers: { Authorization: `Bearer ${userIdToken}` } }
        ).then(async (res) => {
            console.log('res', res.data)
            if (res.status === 200) {
                await getDoc(summaryDocRef).then(async (docSnap) => {
                    if (!docSnap.exists()) { setErrorMessage(`Summary document not found`); return }
                    const existingUserData = docSnap.data()[props.selectedRow.id!]
                    if (!existingUserData) { setErrorMessage(`User ${firstName} ${lastName} / ${email} not found in summary document`); return }
                    // edit the sys user in the summary doc
                    await updateDoc(summaryDocRef, {
                        [props.selectedRow.id!]: {
                            ...existingUserData,
                            mobile: mobile,
                            role: selectdRole,
                            roleLevel: roleLvlPair[selectdRole],
                            displayName: `${firstName} ${lastName}`,
                            firstName: firstName,
                            lastName: lastName,
                        }
                    }).then(() => {
                        setSuccessMessage(`系統使用者 ${email} 已成功修改`)
                    }).catch((error) => {
                        setErrorMessage(`Error in updating summary document: ${error.message}`)
                    })
                }).catch((error) => {
                    setErrorMessage(`Error getting summary document: ${error.message}`)
                })
            }
        }).catch((err) => {
            setErrorMessage(`${err.response.data.error}`);
        })
    }

    const deleteSysUsr = async () => {
        if (userClaim!.roleLevel < roleLvlPair[selectdRole]) {
            setErrorMessage(`You do not have sufficient permission to edit ${selectdRole} role user!`)
            return
        }
        setIsLoading(true)
        // delete authentication for user
        await axios.delete(
            `${localServerUrl}/deleteSystemUser`,
            // `${cloudServerUrl}/deleteSystemUser`,
            {
                headers: { Authorization: `Bearer ${userIdToken}` },
                data: { targetEmail: email }
            }
        ).then(async (res) => {
            console.log('res', res.data)
            if (res.status === 200) {
                // delete the sys user in the summary doc
                await updateDoc(summaryDocRef, {
                    [props.selectedRow.id!]: deleteField()
                }).then(() => {
                    setSuccessMessage(`系統使用者 ${email} 已成功刪除`)
                }).catch((error) => {
                    setErrorMessage(`Error creating new member: ${error.message}`)
                })
            }
        }).catch((err) => {
            setErrorMessage(`${err.response.data.error}`);
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
                        更新系統使用者
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
                            disabled
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
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Button variant="contained" sx={{ width: '50%', my: 1 }} onClick={editSysUsr} disabled={!userIdToken}>修改</Button>
                        <Button variant="contained" sx={{ width: '50%', my: 1 }} onClick={props.onClose}>取消</Button>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Button variant="contained" sx={{ width: '50%', my: 1 }} onClick={() => setShowCfmDelBtn(!showCfmDelBtn)} disabled={!userIdToken}>
                            {showCfmDelBtn ? '取消刪除' : '刪除系統使用者'}
                        </Button>
                        {showCfmDelBtn && <Button variant="contained" color='error' onClick={deleteSysUsr} sx={{ width: '50%', my: 1 }}>確定刪除!</Button>}
                    </Grid>
                </Grid>
                {isLoading && <LoadingBox open={isLoading} onClose={() => setIsLoading(false)} />}
                {infoMessage && <MessageBox open={infoMessage ? true : false} onClose={() => { setIsLoading(false); setInfoMessage(undefined) }} type='info' message={infoMessage} />}
                {errorMessage && <MessageBox open={errorMessage ? true : false} onClose={() => { setIsLoading(false); setErrorMessage(undefined) }} type='error' message={errorMessage} />}
                {successMessage && <MessageBox open={successMessage ? true : false} onClose={() => handleCloseAndClear()} type='success' message={successMessage} />}

            </Box>
        </Modal >
    );
}
