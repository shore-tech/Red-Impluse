// react component for member page
import { useContext, useEffect, useState } from "react";
import { JSX } from "react/jsx-runtime";

// third party imports
import { deleteField, doc, getDoc, updateDoc } from "firebase/firestore";
import { Alert, Avatar, Box, Button, FormControl, Grid, InputLabel, MenuItem, Modal, Select, TextField, Typography } from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { DesktopTimePicker } from "@mui/x-date-pickers";

// local imports
import { btnBox, LoadingBox, MessageBox, styleFormHeadBox, styleModalBox } from "./CommonComponents";
import { ClassContent, CoachObj, MemberObj } from "../utils/dataInterface";
import { db } from "../utils/firebaseConfig";
import { CustomClaimsCtx } from "../utils/contexts";


// date time
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-hk';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Hong_Kong");


// classDate comes in format of YYYY-MM-DD
// classKey comes in format of 'am_HHmm' or 'pm_HHmm'
export default function ClassEnroll(props: { open: boolean, onClose: () => void, classDate: string, classWholeDateList: { [classId: string]: ClassContent }, classKey: string }) {
    const userClaims = useContext(CustomClaimsCtx)
    const [infoMessage, setInfoMessage] = useState<string | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [classContent, setClassContnet] = useState<ClassContent>(props.classWholeDateList[props.classKey])

    const [isEnroll, setIsEnroll] = useState<boolean>(userClaims?.memberId as string in props.classWholeDateList[props.classKey].attendees)
    const [isClassFull, setIsClassFull] = useState<boolean>(Object.keys(classContent?.attendees).length >= classContent?.maxAttendees)

    const handleNewEnroll = () => {
        setIsLoading(true)
        const updatedClsCnt: ClassContent = {
            ...classContent,
            attendees: {
                ...classContent.attendees,
                [userClaims!.memberId as string]: userClaims!.displayName as string
            }
        }

        updateDoc(doc(db, `/class_list/${props.classDate}`), { [props.classKey]: updatedClsCnt }).then(() => {
            setClassContnet(updatedClsCnt)
            setInfoMessage('報名成功')
            setIsEnroll(true)
        }).catch((error) => {
            setErrorMessage('報名失敗')
            console.log(error);
        })
    }

    const handleCloseAndClear = () => {
        setSuccessMessage(undefined)
        props.onClose()
    }

    useEffect(() => {
        setClassContnet(props.classWholeDateList[props.classKey])
        setIsEnroll(userClaims?.memberId as string in props.classWholeDateList[props.classKey].attendees)
    }, [props.classDate, props.classWholeDateList, props.classKey])



    return (
        <Modal open={props.open} onClose={handleCloseAndClear}>
            <Box sx={styleModalBox}>
                <Box sx={styleFormHeadBox}>
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}> <PersonAddIcon /> </Avatar>
                    <Typography variant="h5">
                        Enroll Class
                    </Typography>
                </Box>
                {classContent && <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='Class Date 課堂日期'
                            value={props.classDate}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DesktopTimePicker
                            sx={{ width: '100%' }}
                            label="Class Time 課堂時間"
                            value={dayjs(classContent!.time, 'HH:mm')}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='Class Duration 課堂時長'
                            type='number'
                            value={classContent.duration}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='Max Attendees 最多人數'
                            type='number'
                            value={classContent.maxAttendees}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='Class Type 課堂類別'
                            value={classContent.classType}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='Instructor 教練'
                            value={classContent.instructor}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ border: '1px solid #ccc', padding: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: `space-between`, mb: 1 }}>
                                <Typography variant="body1">
                                    己報名人數: {Object.keys(classContent.attendees).length} / {classContent.maxAttendees}
                                </Typography>
                                <Button variant="contained" color="primary" disabled={isClassFull || isEnroll} onClick={handleNewEnroll} >
                                    {isEnroll ? '已報名' : '報名'}
                                </Button>
                            </Box>
                            <Box sx={{ borderBottom: '1px dotted #ccc', my: 1 }} />
                            {Object.entries(classContent.attendees).map(([memberId, memberName]) => (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: `space-between`, my: 1 }} key={memberId}>
                                    {memberId} - {memberName.replace(' ', '_')}
                                </Box>
                            ))}
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
                        <Button variant="contained" color="primary" onClick={handleCloseAndClear} sx={{ width: '50%', my: 1 }}>
                            退出
                        </Button>
                    </Grid>
                </Grid>}

                {isLoading && <LoadingBox open={isLoading} onClose={() => setIsLoading(false)} />}
                {infoMessage && <MessageBox open={infoMessage ? true : false} onClose={() => { setIsLoading(false); setInfoMessage(undefined) }} type='info' message={infoMessage} />}
                {errorMessage && <MessageBox open={errorMessage ? true : false} onClose={() => { setIsLoading(false); setErrorMessage(undefined) }} type='error' message={errorMessage} />}
                {successMessage && <MessageBox open={successMessage ? true : false} onClose={() => handleCloseAndClear()} type='success' message={successMessage} />}
            </Box>
        </Modal >
    );

}
