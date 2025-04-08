// react component for member page
import { useEffect, useState } from "react";

// third party imports
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { Avatar, Box, Button, Grid, Modal, TextField, Typography } from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { DesktopTimePicker } from "@mui/x-date-pickers";

// local imports
import { LoadingBox, MessageBox, styleFormHeadBox, styleModalBox } from "./CommonComponents";
import { ClassContent, DailyTmpCnt } from "../utils/dataInterface";
import { db } from "../utils/firebaseConfig";


// date time
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-hk';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Hong_Kong");


// classDay comes in format of YYYY-MM-DD
// wholeDayTmp may comes with empty object {}
// classKey comes in format of 'am_HHmm' or 'pm_HHmm' or 'new' => 'new' means new class
export default function ClassSchTmpAdd(props: { open: boolean, onClose: () => void, weekDay: string, wholeDayTmp: DailyTmpCnt }) {
    const [infoMessage, setInfoMessage] = useState<string | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [classDay, setClassDay] = useState<string>(props.weekDay)
    const [classFullList, setClassFullList] = useState<{ [classId: string]: ClassContent }>(props.wholeDayTmp)

    const [classTime, setClassTime] = useState<string>(dayjs().format('HH:mm'))
    const [classDuration, setClassDuration] = useState<number>(60)
    const [classType, setClassType] = useState<string>('BJJ')
    const [classInstructor, setClassInstructor] = useState<string>('Daniel Charles')
    const [maxAttendees, setMaxAttendees] = useState<number>(15)
    const [attendees, setAttendees] = useState<{ [key: string]: string }>({})

    const handleAddClass = () => {
        setIsLoading(true)
        let classFieldId: string = dayjs(classTime, 'HH:mm').format('a_HHmm')
        if (classFieldId in classFullList) {
            setErrorMessage(`Class ${classDay}, ${classTime} already exists!`)
            return
        }
        const updatedWholeDayTmp: { [classId: string]: ClassContent } = {
            ...classFullList,
            [classFieldId]: {
                time: classTime,
                duration: classDuration,
                classType: classType,
                instructor: classInstructor,
                maxAttendees: maxAttendees,
                attendees: attendees
            }
        }
        const tmpDocRef = doc(db, `/class_list/template`)
        updateDoc(tmpDocRef, { [classDay]: updatedWholeDayTmp }).then(() => {
            setSuccessMessage(`Class ${classDay}, ${classTime} added successfully!`)
        }).catch((err) => {
            setErrorMessage(`Failed to add class ${classDay}, ${classTime}!`)
        })
    }

    const handleCloseAndClear = () => {
        setIsLoading(false);
        setSuccessMessage(undefined)
        props.onClose()
    }

    useEffect(() => {
        setClassDay(props.weekDay)
        setClassFullList(props.wholeDayTmp)
        for (const [key, value] of Object.entries(props.wholeDayTmp)) {
            console.log(key, value);
        }
    }, [props.weekDay, props.wholeDayTmp])

    return (
        <Modal open={props.open} onClose={handleCloseAndClear}>
            <Box sx={styleModalBox}>
                <Box sx={styleFormHeadBox}>
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}> <PersonAddIcon /> </Avatar>
                    <Typography variant="h5">
                        Add Class
                    </Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='Class Date 課堂日期'
                            value={classDay}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DesktopTimePicker
                            sx={{ width: '100%' }}
                            label="Class Time 課堂時間"
                            value={dayjs(classTime, 'HH:mm')}
                            onChange={(newValue) => {
                                newValue && setClassTime(newValue.format('HH:mm'))
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='Class Duration 課堂時長'
                            type='number'
                            value={classDuration}
                            onChange={(e) => setClassDuration(parseInt(e.target.value))}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='Class Type 課堂類別'
                            value={classType}
                            onChange={(e) => setClassType(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='Instructor 教練'
                            value={classInstructor}
                            onChange={(e) => setClassInstructor(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='Max Attendees 最多人數'
                            type='number'
                            value={maxAttendees}
                            onChange={(e) => setMaxAttendees(parseInt(e.target.value))}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
                        {/* make btn to close the Modal */}
                        <Button variant="contained" color="primary" onClick={handleAddClass} sx={{ width: '50%', my: 1 }}>
                            儲存
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleCloseAndClear} sx={{ width: '50%', my: 1 }}>
                            取消
                        </Button>
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
