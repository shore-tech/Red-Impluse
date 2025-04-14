// react component for member page
import { useContext, useEffect, useState } from "react";

// third party imports
import { deleteDoc, deleteField, doc, updateDoc } from "firebase/firestore";
import { Avatar, Box, Button, FormControl, Grid, InputLabel, MenuItem, Modal, Select, TextField, Typography } from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { DatePicker } from "@mui/x-date-pickers";
import { MuiTelInput } from "mui-tel-input";
import dayjs from "dayjs";

// local imports
import { LoadingBox, MessageBox, styleFormHeadBox, styleModalBox } from "./CommonComponents";
import { MemberObj } from "../utils/dataInterface";
import { db } from "../utils/firebaseConfig";
import axios from "axios";
import { UserIdTokenCtx } from "../utils/contexts";
import { cloudServerUrl, localServerUrl } from "../utils/firebaseConfigDetails";


export default function MemberEditBasic(props: { open: boolean, onClose: () => void, selectedRow: MemberObj }) {
    const userIdToken: string | undefined = useContext(UserIdTokenCtx)
    const [infoMessage, setInfoMessage] = useState<string | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [firstName, setFirstName] = useState<string>(props.selectedRow.firstName)
    const [lastName, setLastName] = useState<string>(props.selectedRow.lastName)
    const [email, setEmail] = useState<string>(props.selectedRow.email)
    const [mobile, setMobile] = useState<string>(props.selectedRow.mobile)
    const [gender, setGender] = useState<string>(props.selectedRow.gender)
    const [dateOfBirth, setDateOfBirth] = useState<string>(props.selectedRow.dateOfBirth)
    const [joinDate, setJoinDate] = useState<string>(props.selectedRow.join_date || '')
    const [address, setAddress] = useState<string>(props.selectedRow.address || '')
    const [showCfmDelBtn, setShowCfmDelBtn] = useState<boolean>(false)


    const editMember = () => {
        const editedInfo: MemberObj = {
            ...props.selectedRow,
            firstName: firstName,
            lastName: lastName,
            fullName: `${firstName} ${lastName}`,
            email: email,
            mobile: mobile,
            gender: gender,
            dateOfBirth: dateOfBirth,
            join_date: joinDate,
            // mbsExpDate: mbsExpDate,
            address: address,
        }
        const summaryDocRef = doc(db, '/member_list/summary')
        const memberDocRef = doc(db, `/member_list/${props.selectedRow.id}`)
        updateDoc(summaryDocRef, { [editedInfo.id!]: editedInfo }).then(() => {
            setSuccessMessage(`Member ${editedInfo.id!} updated to summary.`)
        }).then(() => {
            // add new member doc
            updateDoc(doc(db, `/member_list/${editedInfo.id!}`), { ...editedInfo }).then(() => {
                setSuccessMessage(`Member ${editedInfo.id} updated successfully.`);
            })
        }).catch(err => {
            setErrorMessage(err.message)
        })
    }

    const deleteMember = () => {
        // delete auth
        if (email !== '') {
            axios.delete(
                // `${localServerUrl}/deleteMember`, 
                `${cloudServerUrl}/deleteMember`, 
                { headers: { Authorization: `Bearer ${userIdToken}` }, 
                data: { targetEmail: email } }
            ).then(() => {
                setSuccessMessage(`Member ${props.selectedRow.id} deleted in Auth successfully.`);
            }).catch(err => {
                setErrorMessage(err.message)
            })
        }
        // delete from summary
        const summaryDocRef = doc(db, '/member_list/summary')
        updateDoc(summaryDocRef, { [props.selectedRow.id!]: deleteField() }).then(() => {
            setSuccessMessage(`Member ${props.selectedRow.id} deleted in summary successfully.`);   
        }).catch(err => {
            setErrorMessage(err.message)
        })
        // delete individual record
        const memberDocRef = doc(db, `/member_list/${props.selectedRow.id}`)
        deleteDoc(memberDocRef).then(() => {
            setSuccessMessage(`Member ${props.selectedRow.id} deleted in doc successfully.`);
        }).catch(err => {
            setErrorMessage(err.message)
        })
    }

    const handleCloseAndClear = () => {
        setSuccessMessage(undefined)
        props.onClose()
    }

    return (
        <Modal open={props.open} onClose={props.onClose}>
            <Box sx={styleModalBox}>
                <Box sx={styleFormHeadBox}>
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}> <PersonAddIcon /> </Avatar>
                    <Typography variant="h5">
                        Edit Member
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
                            <InputLabel>Gender 性別</InputLabel>
                            <Select
                                sx={{ width: '100%' }}
                                name='gender'
                                label={'Gender'}
                                value={gender}
                                onChange={(e) => setGender(e.target.value as string)}
                            >
                                <MenuItem value={'M'}>男 Male </MenuItem>
                                <MenuItem value={'F'}>女 Female</MenuItem>
                                <MenuItem value={'NS'}>Not Specified</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DatePicker
                            sx={{ width: '100%' }}
                            label='Date of Birth 出生日期'
                            name="date_of_birth"
                            shouldDisableDate={(date) => {
                                return dayjs(date).isAfter(dayjs(), 'day');
                            }}
                            value={dayjs(dateOfBirth, 'DD MMM YYYY')}
                            onChange={(date) => {
                                if (!date) return
                                setDateOfBirth(date.format('YYYY-MM-DD'))
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label='Address 住址'
                            name="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <DatePicker
                            sx={{ width: '100%' }}
                            label={'Join Date 入會日期'}
                            name="join_date"
                            shouldDisableDate={(date) => {
                                return dayjs(date).isAfter(dayjs(), 'day');
                            }}
                            value={dayjs()}
                            onChange={(date) => {
                                if (!date) return
                                setJoinDate(date.format('YYYY-MM-DD'))
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Button variant="contained" onClick={editMember} sx={{ width: '50%', my: 1 }}>修改</Button>
                        <Button variant="contained" onClick={props.onClose} sx={{ width: '50%', my: 1 }}>取消</Button>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Button variant="contained" sx={{ width: '50%', my: 1 }} onClick={() => setShowCfmDelBtn(!showCfmDelBtn)} disabled={!userIdToken  }>
                            {showCfmDelBtn ? '取消刪除' : '刪除會員'}
                        </Button>
                        {showCfmDelBtn && <Button variant="contained" color='error' onClick={deleteMember} sx={{ width: '50%', my: 1 }}>確定刪除?</Button>}
                    </Grid>
                </Grid >

                {isLoading && <LoadingBox open={isLoading} onClose={() => setIsLoading(false)} />}
                {infoMessage && <MessageBox open={infoMessage ? true : false} onClose={() => setInfoMessage(undefined)} type='info' message={infoMessage} />}
                {errorMessage && <MessageBox open={errorMessage ? true : false} onClose={() => setErrorMessage(undefined)} type='error' message={errorMessage} />}
                {successMessage && <MessageBox open={successMessage ? true : false} onClose={() => handleCloseAndClear()} type='success' message={successMessage} />}

            </Box >
        </Modal >
    );
}
