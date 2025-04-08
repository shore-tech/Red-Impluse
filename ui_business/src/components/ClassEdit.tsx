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
import { ClassContent, MemberObj } from "../utils/dataInterface";
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
// classKey comes in format of 'am_HHmm' or 'pm_HHmm' or 'new' => 'new' means new class
export default function ClassEdit(props: { open: boolean, onClose: () => void, classDate: string, classWholeDateList: { [classId: string]: ClassContent }, classKey: string}) {
    const [infoMessage, setInfoMessage] = useState<string | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [classDate, setClassDate] = useState<string>(props.classDate)
    const [classFullList, setClassFullList] = useState<{ [classId: string]: ClassContent } | undefined>(props.classWholeDateList)
    const [classKey, setClassKey] = useState<string>(props.classKey)
    const [classContent, setClassContnet] = useState<ClassContent | undefined>(undefined)

    const [classTime, setClassTime] = useState<string>(dayjs().format('HH:mm'))
    const [classDuration, setClassDuration] = useState<number>(60)
    const [classType, setClassType] = useState<string>('BJJ')
    const [classInstructor, setClassInstructor] = useState<string>('Daniel Charles')
    const [maxAttendees, setMaxAttendees] = useState<number>(15)
    const [attendees, setAttendees] = useState<{ [key: string]: string }>({})

    const [showNewEnroll, setShowNewEnroll] = useState<boolean>(false)
    const [memberFullList, setMemberFullList] = useState<string[]>([])  //the full member list from db
    const [memberOptList, setMemberOptList] = useState<string[] | undefined>(undefined) // the member list that is not enrolled in the class
    const [selectedMember, setSelectedMember] = useState<string | undefined>(undefined)

    const [showCfmDel, setShowCfmDel] = useState<boolean>(false)

    const handleDelClass = () => {
        const classRef = doc(db, `/class_list/${classDate}`)
        updateDoc(classRef, { [classKey]: deleteField() }).then(() => {
            setSuccessMessage(`Class ${classDate} ${classKey} deleted successfully!`)
        }).catch((err) => {
            console.log(err);
            setErrorMessage(`Failed to delete class ${classDate} ${classKey}!`)
        })
    }

    const handleNewEnroll = () => {
        if (!selectedMember || !classContent) return
        const selectedMemberID: string = selectedMember.split(' - ')[0]
        const selectedMemberName: string = selectedMember.split(' - ')[1]
        const updatedClass: ClassContent = {
            ...classContent,
            attendees: {
                ...attendees,
                [selectedMemberID]: selectedMemberName
            }
        }
        updateDoc(doc(db, `/class_list/${classDate}`), { [classKey]: updatedClass }).then(() => {
            setClassContnet(updatedClass)
            setShowNewEnroll(false)
            setInfoMessage(`Member ${selectedMemberID} enrolled successfully!`)
        }).catch((err) => {
            console.log(err);
            setErrorMessage(`Failed to enroll member ${selectedMemberID}!`)
        })
    }


    const handleCancelEnroll = (memberId: string) => {
        if (!classContent) return
        let updatedAttendees = { ...attendees }
        delete updatedAttendees[memberId]
        const updatedClass: ClassContent = {
            ...classContent,
            attendees: {
                ...updatedAttendees,
            }
        }
        updateDoc(doc(db, `/class_list/${classDate}`), { [classKey]: updatedClass }).then(() => {
            setClassContnet(updatedClass)
            setInfoMessage(`Member ${memberId} cancelled successfully!`)
        }).catch((err) => {
            console.log(err);
            setErrorMessage(`Failed to cancel member ${memberId}!`)
        })
    }

    const handleSaveChange = () => {
        setIsLoading(true)
        let classFieldId: string = ''
        const updatedClassContent: ClassContent = {
            time: classTime,
            duration: classDuration,
            classType: classType,
            instructor: classInstructor,
            maxAttendees: maxAttendees,
            attendees: attendees
        }
        switch (classKey) {
            case 'new':
                classFieldId = dayjs(classTime, 'HH:mm').format('a_hhmm')
                // validate if the classFieldId is already in use
                if (classFieldId in classFullList!) {
                    setErrorMessage(`Class ${classDate}, ${classTime} already exists!`)
                    return
                }
                break;
            default:
                classFieldId = classKey
                break;
        }
        updateDoc(doc(db, `/class_list/${classDate}`), { [classFieldId]: updatedClassContent }).then(() => {
            setIsLoading(false)
            setSuccessMessage(`Class ${classDate}, ${classTime} added successfully!`)
        }).catch((err) => {
            console.log(err);
            setErrorMessage(`Failed to add class ${classDate}, ${classTime}!`)
        })
    }

    const handleCloseAndClear = () => {
        setSuccessMessage(undefined)
        setAttendees({})
        setShowCfmDel(false)
        setClassContnet(undefined)
        props.onClose()
    }

    useEffect(() => {
        setClassDate(props.classDate)
        setClassFullList(props.classWholeDateList)
        setClassKey(props.classKey)
        setClassContnet(props.classWholeDateList[props.classKey])
    }, [props.classDate, props.classWholeDateList, props.classKey])


    useEffect(() => {
        if (!classContent) return
        setClassTime(classContent.time)
        setClassDuration(classContent.duration || 60)
        setClassType(classContent.classType)
        setClassInstructor(classContent.instructor)
        setMaxAttendees(classContent.maxAttendees)
        setAttendees(classContent.attendees)
    }, [classContent])

    useEffect(() => {
        let newMbOptList: string[] = []
        if (memberFullList.length > 0) {
            for (const member of memberFullList) {
                if (!(member.split(' - ')[0] in attendees)) { newMbOptList.push(member) }
            }
            // sort the member list
            newMbOptList.sort((a, b) => {
                const nameA = a.split(' - ')[1].toLowerCase();
                const nameB = b.split(' - ')[1].toLowerCase();
                if (nameA < nameB) return 1;
                if (nameA > nameB) return -1;
                return 0;
            });
            setMemberOptList(newMbOptList)
            setSelectedMember(newMbOptList[0])
        } else {
            const memberFullListRef = doc(db, `/member_list/summary`)
            getDoc(memberFullListRef).then((snapshot) => {
                const data = snapshot.data()
                if (data) {
                    let newMbFullList: string[] = []
                    for (const [key, value] of Object.entries(data)) {
                        newMbFullList.push(`${key} - ${value.fullName}`)
                        // check if the member is already enrolled
                        if (!(key in attendees)) { newMbOptList.push(`${key} - ${value.fullName}`) }
                    }

                    // sort the member list
                    newMbOptList.sort((a, b) => {
                        const nameA = a.split(' - ')[1].toLowerCase();
                        const nameB = b.split(' - ')[1].toLowerCase();
                        if (nameA < nameB) return 1;
                        if (nameA > nameB) return -1;
                        return 0;
                    });
                    setMemberFullList(newMbFullList)
                    setMemberOptList(newMbOptList)
                    setSelectedMember(newMbOptList[0])
                } else {
                    console.log('No member list found');
                }
            }).catch((err) => {
                console.log(err);
            })
        }

    }, [attendees])


    return (
        <Modal open={props.open} onClose={handleCloseAndClear}>
            <Box sx={styleModalBox}>
                <Box sx={styleFormHeadBox}>
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}> <PersonAddIcon /> </Avatar>
                    <Typography variant="h5">
                        {props.classKey === 'new' ? 'Add Class' : 'Edit Class'}
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
                            disabled={props.classKey !== 'new'}
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
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ border: '1px solid #ccc', padding: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: `space-between`, mb: 1 }}>
                                <Typography variant="body1">
                                    己報名人數: {Object.keys(attendees).length} / {maxAttendees}
                                </Typography>
                                <Button variant="contained" color="primary" disabled={Object.keys(attendees).length >= maxAttendees || props.classKey === 'new'} onClick={() => setShowNewEnroll(!showNewEnroll)} >
                                    {showNewEnroll ? '隱藏報名' : '會員報名'}
                                </Button>
                            </Box>
                            <Box sx={{ borderBottom: '1px solid #ccc', my: 1 }} />
                            {showNewEnroll && memberOptList && selectedMember && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: `space-between`, my: 1 }}>
                                <FormControl >
                                    <InputLabel>Member List 會員列表</InputLabel>
                                    <Select
                                        value={selectedMember}
                                        label="Member List 會員列表"
                                        onChange={(e) => {
                                            setSelectedMember(e.target.value as string)
                                        }}
                                    >
                                        {memberOptList.map((item) => {
                                            return (<MenuItem key={item} value={item}> {item}</MenuItem>)
                                        })}
                                    </Select>
                                </FormControl>
                                <Button variant="contained" color="primary" onClick={handleNewEnroll}>
                                    確定報名
                                </Button>
                            </Box>}
                            <Box sx={{ borderBottom: '1px dotted #ccc', my: 1 }} />
                            {attendees && Object.entries(attendees).map(([key, value]) => {
                                return (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: `space-between`, my: 1 }} key={key}>
                                        <>{key} - {value.replace(' ', '_')}</>
                                        <Button variant="contained" color="secondary" sx={{ marginLeft: 2 }} onClick={() => handleCancelEnroll(key)}>
                                            取消報名
                                        </Button>
                                    </Box>
                                )
                            })}
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
                        {/* make btn to close the Modal */}
                        <Button variant="contained" color="primary" onClick={handleSaveChange} sx={{ width: '50%', my: 1 }}>
                            儲存
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleCloseAndClear} sx={{ width: '50%', my: 1 }}>
                            取消
                        </Button>
                        {props.classKey !== 'new' && <Button variant="contained" color="primary" onClick={() => setShowCfmDel(!showCfmDel)} sx={{ width: '50%', my: 1 }}>
                            {showCfmDel ? '取消刪除' : '刪除課堂'}
                        </Button>}
                        {showCfmDel && <Button variant="contained" color="primary" onClick={handleDelClass} sx={{ width: '50%', my: 1 }}>
                            確定删除!
                        </Button>}

                    </Grid>
                </Grid>
                {isLoading && <LoadingBox open={isLoading} onClose={() => setIsLoading(false)} />}
                {infoMessage && <MessageBox open={infoMessage ? true : false} onClose={() => setInfoMessage(undefined)} type='info' message={infoMessage} />}
                {errorMessage && <MessageBox open={errorMessage ? true : false} onClose={() => setErrorMessage(undefined)} type='error' message={errorMessage} />}
                {successMessage && <MessageBox open={successMessage ? true : false} onClose={() => handleCloseAndClear()} type='success' message={successMessage} />}
            </Box>
        </Modal >
    );

}
