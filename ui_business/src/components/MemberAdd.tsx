// react component for member page
import { use, useContext, useEffect, useState } from "react";

// third party imports
import { addDoc, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Avatar, Box, Button, FormControl, Grid, InputLabel, MenuItem, Modal, Select, TextField, Typography } from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { DatePicker } from "@mui/x-date-pickers";
import { MuiTelInput } from "mui-tel-input";
import dayjs from "dayjs";

// local imports
import { btnBox, LoadingBox, MessageBox, styleFormHeadBox, styleModalBox } from "./CommonComponents";
import { CustomClaimsCtx, localServerUrl, UserIdTokenCtx } from "../utils/contexts";
import { MemberObj } from "../utils/dataInterface";
import { db } from "../utils/firebaseConfig";
import axios from "axios";


export default function MemberAdd(props: { open: boolean, onClose: () => void }) {
    const userIdToken:string|undefined = useContext(UserIdTokenCtx)

    const [infoMessage, setInfoMessage] = useState<string | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [firstName, setFirstName] = useState<string>('')
    const [lastName, setLastName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [mobile, setMobile] = useState<string>('')
    const [gender, setGender] = useState<string>('M')
    const [dateOfBirth, setDateOfBirth] = useState<string>('')
    const [beltColor, setBeltColor] = useState<string>('White')
    const [stripe, setStripe] = useState<number>(0)
    const [joinDate, setJoinDate] = useState<string>('')
    const [address, setAddress] = useState<string>('')


    const addNewMember = async () => {
        // create authentication for user
        axios.post(`${localServerUrl}/addMember`, {
            displaName: `${firstName} ${lastName}`,
            email: email,
            mobile: mobile,
            role: 'member',
            roleLevel: 0,
        }, {
            headers: { Authorization: `Bearer ${userIdToken}` }
        }).then((res) => {
            console.log('res: ', res);
            if (res.status === 200) {
                setSuccessMessage(`New member ${newMemberId} added successfully.`);
            } else {
                setErrorMessage(`Error ${res.status}: `);
                return
            }
        }).catch((err) => {
            setErrorMessage(`${err.response.data.error}`);
            return
        })
        // set member obj for database
        const newMember: MemberObj = {
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
            beltColor: beltColor,
            stripe: stripe,
        }
        const summaryDocRef = doc(db, '/member_list/summary')
        // calaulate the new member id
        let newMemberId = ''
        let summaryDocData = {}
        setIsLoading(true)
        // generate new member id
        await getDoc(summaryDocRef).then(doc => {
            if (doc.exists()) {
                summaryDocData = doc.data()
                let member_list: string[] | number[] = Object.keys(summaryDocData)
                member_list = member_list.map((id) => parseInt(id.split('_')[1]))
                newMemberId = `ri_${('0000' + (Math.max(...member_list) + 1)).slice(-4)}`
            } else {
                newMemberId = 'ri_0001'
            }
            console.log('adding new member: ', newMemberId);
        }).catch(err => {
            setErrorMessage(err.message)
            return
        })
        // add new member to summary doc
        await updateDoc(summaryDocRef, { [newMemberId]: newMember }).then(() => {
            console.log(`New member ${newMemberId} added successfully.`)
        }).catch(err => {
            setErrorMessage(err.message)
            return
        })
        // add new member doc
        setDoc(doc(db, `/member_list/${newMemberId}`), newMember).then(() => {
            setSuccessMessage(`New member ${newMemberId} added successfully.`);
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
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>BJJ belt color</InputLabel>
                            <Select
                                sx={{ width: '100%' }}
                                name='beltColor'
                                label='BJJ Belt Color'
                                value={beltColor}
                                onChange={(e) => setBeltColor(e.target.value as string)}
                            >
                                <MenuItem value={'White'}> 白帶 </MenuItem>
                                <MenuItem value={'Blue'}> 藍帶 </MenuItem>
                                <MenuItem value={'Purple'}> 紫帶 </MenuItem>
                                <MenuItem value={'Brown'}> 啡帶 </MenuItem>
                                <MenuItem value={'Black'}> 黑帶 </MenuItem>
                                <MenuItem value={'Red'}> 紅帶 </MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Stripe 段數</InputLabel>
                            <Select
                                sx={{ width: '100%' }}
                                name='stripe'
                                label='Stripe 段數'
                                value={stripe}
                                onChange={(e) => setStripe(e.target.value as number)}
                            >
                                <MenuItem value={0}> 0 </MenuItem>
                                <MenuItem value={1}> 1 </MenuItem>
                                <MenuItem value={2}> 2 </MenuItem>
                                <MenuItem value={3}> 3 </MenuItem>
                                <MenuItem value={4}> 4 </MenuItem>
                                <MenuItem value={5}> 5 (你確定？) </MenuItem>
                            </Select>
                        </FormControl>
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
                        <Button variant="contained" onClick={addNewMember} disabled={!userIdToken}>新增</Button>
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
