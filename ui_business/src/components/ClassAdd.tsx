// react component for member page
import { useEffect, useState } from "react";

// third party imports
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Avatar, Box, Button, FormControl, Grid, InputLabel, Menu, MenuItem, Modal, Select, TextField, Typography } from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { DesktopTimePicker } from "@mui/x-date-pickers";

// local imports
import { LoadingBox, MessageBox, styleFormHeadBox, styleModalBox } from "./CommonComponents";
import { ClassContent, CoachObj } from "../utils/dataInterface";
import { db } from "../utils/firebaseConfig";


// date time
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-hk';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Hong_Kong");


// classDate comes in format of YYYY-MM-DD
// classWholeDateList may comes with empty object {}
// classKey comes in format of 'am_HHmm' or 'pm_HHmm' or 'new' => 'new' means new class
export default function ClassAdd(props: { open: boolean, onClose: () => void, classDate: string, classWholeDateList: { [classId: string]: ClassContent } }) {
    const [infoMessage, setInfoMessage] = useState<string | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [classDate, setClassDate] = useState<string>(props.classDate)
    const [classFullList, setClassFullList] = useState<{ [classId: string]: ClassContent }>(props.classWholeDateList)


    const [classTime, setClassTime] = useState<string>(dayjs().format('HH:mm'))
    const [classDuration, setClassDuration] = useState<number>(60)

    const [classTypeList, setClassTypeList] = useState<string[]>([])
    const [coachClsData, setCoachClsData] = useState<{ [coachName: string]: CoachObj }>({})
    const [selectedClassType, setSelectedClassType] = useState<string | undefined>(undefined)
    const [coachOptList, setCoachOptList] = useState<string[]>([])
    const [selectedCoach, setSelectedCoach] = useState<string>('')

    const [maxAttendees, setMaxAttendees] = useState<number>(15)
    const [attendees, setAttendees] = useState<{ [key: string]: string }>({})

    const handleAddClass = () => {
        setIsLoading(true)
        let classFieldId: string = dayjs(classTime, 'HH:mm').format('a_HHmm')
        const updatedClassContent: ClassContent = {
            time: classTime,
            duration: classDuration,
            classType: selectedClassType!,
            instructor: selectedCoach,
            maxAttendees: maxAttendees,
            attendees: attendees
        }
        if (classFieldId in classFullList) {
            setErrorMessage(`Class ${classDate}, ${classTime} already exists!`)
        }
        if (Object.keys(classFullList).length === 0) {
            // set doc directly
            setDoc(doc(db, `/class_list/${classDate}`), { [classFieldId]: updatedClassContent }).then(() => {
                setSuccessMessage(`Class ${classDate}, ${classTime} added successfully!`)
            }).catch((err) => {
                setErrorMessage(`Failed to add class ${classDate}, ${classTime}!`)
            })
        } else {
            // update doc
            updateDoc(doc(db, `/class_list/${classDate}`), { [classFieldId]: updatedClassContent }).then(() => {
                setSuccessMessage(`Class ${classDate}, ${classTime} added successfully!`)
            }).catch((err) => {
                setErrorMessage(`Failed to add class ${classDate}, ${classTime}!`)
            })
        }
    }

    const handleCloseAndClear = () => {
        setIsLoading(false);
        setSuccessMessage(undefined)
        props.onClose()
    }

    useEffect(() => {
        setClassDate(props.classDate)
        setClassFullList(props.classWholeDateList)
        for (const [key, value] of Object.entries(props.classWholeDateList)) {
            console.log(key, value);
        }
        getDoc(doc(db, '/class_list/coach')).then((coachCls) => {
            if (coachCls.exists()) {
                const coachData = coachCls.data()
                setClassTypeList(coachData['classType'])
                setSelectedClassType(coachData['classType'][0])
                delete coachData['classType']
                setCoachClsData(coachData)
            } else {
                setErrorMessage('No class type found')
            }
        })
    }, [props.classDate, props.classWholeDateList])


    useEffect(() => {
        if (!selectedClassType) return
        let newCoachOptList: string[] = []
        for (const coachName of Object.keys(coachClsData)) {
            if (coachClsData[coachName][selectedClassType]) newCoachOptList.push(coachName)
        }
        console.log('newCoachOptList', newCoachOptList);
        setCoachOptList(newCoachOptList)
        setSelectedCoach(newCoachOptList[0])
    }, [selectedClassType])

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
                            value={classDate}
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
                            label='Max Attendees 最多人數'
                            type='number'
                            value={maxAttendees}
                            onChange={(e) => setMaxAttendees(parseInt(e.target.value))}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        {selectedClassType &&
                            <FormControl size="small" fullWidth>
                                <InputLabel id="class-type-select-label">Class Type 課堂類別</InputLabel>
                                <Select
                                    labelId="class-type-select-label"
                                    value={selectedClassType}
                                    label="Class Type 課堂類別"
                                    onChange={(e) => setSelectedClassType(e.target.value)}
                                >
                                    {classTypeList.map((item) => (
                                        <MenuItem key={item} value={item}>{item}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        }
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        {selectedClassType && selectedCoach
                            ? <FormControl size="small" fullWidth>
                                <InputLabel id="instructor-select-label">Instructor 教練</InputLabel>
                                <Select
                                    labelId="instructor-select-label"
                                    value={selectedCoach}
                                    label="Instructor 教練"
                                    onChange={(e) => setSelectedCoach(e.target.value)}
                                >
                                    {coachOptList.map((item) => (
                                        <MenuItem key={item} value={item}>{item}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            : <Typography variant="body2" color="text.secondary">
                                {selectedClassType} 堂沒有登記教練
                            </Typography>
                        }
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
                        <Button variant="contained" color="primary" onClick={handleAddClass} sx={{ width: '50%', my: 1 }} disabled={!selectedClassType}>
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
