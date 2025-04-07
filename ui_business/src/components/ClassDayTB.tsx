// react component for member page
import { JSX, use, useEffect, useState } from "react";

// third party imports
import { Box, Button, Container, Typography } from "@mui/material";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import dayjs from "dayjs";

// local imports
import { db } from "../utils/firebaseConfig";
import { ClassContent } from "../utils/dataInterface";
import ClassEdit from "./ClassEdit";



export default function ClassDayTB(props: { date: string }) {
    const [classDate, setClassDate] = useState<string>(props.date)
    const [wholeDayClassList, setWholeDayClassList] = useState<{ [classId: string]: ClassContent }>({})
    const [amClassList, setMorningClassList] = useState<{ [classId: string]: ClassContent }>({})
    const [pmClassList, setAfternoonClassList] = useState<{ [classId: string]: ClassContent }>({})
    const [amClassBtn, setAmClassBtn] = useState<JSX.Element[]>([])
    const [pmClassBtn, setPmClassBtn] = useState<JSX.Element[]>([])
    const [openEditClass, setOpenEditClass] = useState<boolean>(false)
    const [targetClassKey, setTargetClassKey] = useState<string>('new')
    const [targetClassContent, setTargetClassContent] = useState<ClassContent | undefined>(undefined)

    const handleEditClass = (key: string) => {
        console.log(key);
        setTargetClassKey(key);
        switch (key.split('_')[0]) {
            case 'am':
                console.log(amClassList[key]);
                setTargetClassContent(amClassList[key])
                break;
            case 'pm':
                console.log(pmClassList[key]);
                setTargetClassContent(pmClassList[key])
                break;
            default:
                setTargetClassContent(undefined)
                console.log('new');
                break;
        }
        setOpenEditClass(true);
    }

    useEffect(() => {
        setClassDate(props.date)
    }, [props.date])

    useEffect(() => {
        // if (!classDate) return
        const dayClassScheduleRef = doc(db, `/class_list/${classDate}`)
        const unsubscribe = onSnapshot(dayClassScheduleRef, (snapshot) => {
            const data = snapshot.data()
            if (!data) {
                console.log("No data found for the given date:", classDate); // Debug log
                return;
            }
            let wholeDayClasses: { [classId: string]: ClassContent } = {}
            let amClasses: { [classId: string]: ClassContent } = {}
            let pmClasses: { [classId: string]: ClassContent } = {}
            for (const [key, value] of Object.entries(data!)) {
                wholeDayClasses[key] = value
                const classSession = key.split('_')[0]
                if (classSession === 'am') {
                    amClasses[key] = value
                } else if (classSession === 'pm') {
                    pmClasses[key] = value
                }
            }
            setWholeDayClassList(wholeDayClasses)
            setMorningClassList(amClasses)
            setAfternoonClassList(pmClasses)
        }, (error) => {
            console.log(error)
        })
        return unsubscribe
    }, [classDate])

    useEffect(() => {
        const amClassBtn = Object.entries(amClassList)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // Sort by key
            .map(([key, value]) => {
                return (
                    <Button variant="contained" color="primary" key={key} onClick={() => handleEditClass(key)}>
                        {value.time}/{value.classType}/{value.instructor}/{Object.keys(value.attendees).length}of{value.maxAttendees}
                    </Button>
                )
            })
        setAmClassBtn(amClassBtn)
    }, [amClassList])

    useEffect(() => {
        const pmClassBtn = Object.entries(pmClassList)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // Sort by key
            .map(([key, value]) => {
                return (
                    <Button variant="contained" color="primary" key={key} onClick={() => handleEditClass(key)}>
                        {value.time}/{value.classType}/{value.instructor}/{Object.keys(value.attendees).length}of{value.maxAttendees}
                    </Button>
                )
            })
        setPmClassBtn(pmClassBtn)
    }, [pmClassList])



    return (
        <Container sx={{ padding: 2, border: '1px solid #ccc', borderRadius: 2, marginBottom: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: `space-between`, mb: 1 }}>
                <Typography variant="body1">
                    {dayjs(classDate).format('dddd, YYYY-MM-DD')}
                </Typography>
                <Button variant="contained" color="primary" onClick={() => handleEditClass('new')}>
                    新增課堂
                </Button>
            </Box>
            <Box sx={{ borderBottom: '1px solid #ccc', my: 1 }} />
            <Box sx={{ paddingX: 2, gap: 2, display: 'flex', flexWrap: 'wrap' }}> {amClassBtn}</Box>
            <Box sx={{ borderBottom: '1px dotted #ccc', my: 1 }} />
            <Box sx={{ paddingX: 2, gap: 2, display: 'flex', flexWrap: 'wrap' }}> {pmClassBtn}</Box>


            <ClassEdit
                open={openEditClass}
                onClose={() => {
                    setOpenEditClass(false);
                    setTargetClassContent(undefined);
                }}
                classDate={classDate}
                classWholeDateList={wholeDayClassList}
                classKey={targetClassKey}
                classContent={targetClassContent}
            />
        </Container>
    );
}
