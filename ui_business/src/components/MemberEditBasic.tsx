// react component for member page
import { useContext, useEffect, useState } from "react";

// third party imports
import { addDoc, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Avatar, Box, Button, FormControl, Grid, InputLabel, MenuItem, Modal, Select, TextField, Typography } from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { DatePicker } from "@mui/x-date-pickers";
import { MuiTelInput } from "mui-tel-input";
import dayjs from "dayjs";

// local imports
import { btnBox, MessageBox, styleFormHeadBox, styleModalBox } from "./CommonComponents";
import { MemberObj } from "../utils/dataInterface";
import { db } from "../utils/firebaseConfig";
import { EditOff } from "@mui/icons-material";


export default function MemberEditBasic(props: { open: boolean, onClose: () => void, selectedRow: MemberObj }) {
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)

    const [firstName, setFirstName] = useState<string>(props.selectedRow.firstName)
    const [lastName, setLastName] = useState<string>(props.selectedRow.lastName)
    const [email, setEmail] = useState<string>(props.selectedRow.email)
    const [mobile, setMobile] = useState<string>(props.selectedRow.mobile)
    const [gender, setGender] = useState<string>(props.selectedRow.gender)
    const [dateOfBirth, setDateOfBirth] = useState<string>(props.selectedRow.dateOfBirth)
    const [joinDate, setJoinDate] = useState<string>(props.selectedRow.join_date || '')
    const [address, setAddress] = useState<string>(props.selectedRow.address || '')


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
            updateDoc(doc(db, `/member_list/${editedInfo.id!}`), {...editedInfo}).then(() => {
                setSuccessMessage(`Member ${editedInfo.id} updated successfully.`);
            })
        }).catch(err => {
            setErrorMessage(err.message)
        })
    }

    // debugger;

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
                    <Box sx={btnBox}>
                        <Button variant="contained" onClick={editMember}>修改</Button>
                        <Button variant="contained" onClick={props.onClose}>取消</Button>
                    </Box>
                </Grid>


                {errorMessage && <MessageBox open={errorMessage ? true : false} onClose={() => setErrorMessage(undefined)} type='error' message={errorMessage} />}
                {successMessage && <MessageBox open={successMessage ? true : false} onClose={props.onClose} type='success' message={successMessage} />}

            </Box>
        </Modal>
    );
}
