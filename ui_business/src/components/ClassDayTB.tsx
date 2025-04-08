// react component for member page
import { JSX, useEffect, useState } from "react";

// third party imports
import { Box, Button, Container, Typography } from "@mui/material";
import { doc, onSnapshot } from "firebase/firestore";
import dayjs from "dayjs";

// local imports
import { db } from "../utils/firebaseConfig";
import { ClassContent } from "../utils/dataInterface";
import ClassEdit from "./ClassEdit";
import ClassAdd from "./ClassAdd";



export default function ClassDayTB(props: { date: string }) {
    const [classDate, setClassDate] = useState<string>(props.date)
    const [wholeDayClassList, setWholeDayClassList] = useState<{ [classId: string]: ClassContent }>({})

    const [amClassBtn, setAmClassBtn] = useState<JSX.Element[]>([])
    const [pmClassBtn, setPmClassBtn] = useState<JSX.Element[]>([])

    const [openClassAdd, setOpenClassAdd] = useState<boolean>(false)

    const [openEditClass, setOpenEditClass] = useState<boolean>(false)
    const [targetClassKey, setTargetClassKey] = useState<string>('new')

    const handleEditClass = (key: string) => {
        setTargetClassKey(key);
        setOpenEditClass(true);
    }

    useEffect(() => {
        setClassDate(props.date)
    }, [props.date])

    useEffect(() => {
        const dayClassScheduleRef = doc(db, `/class_list/${classDate}`)
        const unsubscribe = onSnapshot(dayClassScheduleRef, (snapshot) => {
            const data = snapshot.data()
            if (!data) return;
            let wholeDayClasses: { [classId: string]: ClassContent } = {}
            let amClassBtnKeyList: string[] = []
            let pmClassBtnKeyList: string[] = []
            for (const [key, value] of Object.entries(data!)) {
                wholeDayClasses[key] = value
                const classSession = key.split('_')[0]
                if (classSession === 'am') {
                    amClassBtnKeyList.push(key)
                } else if (classSession === 'pm') {
                    pmClassBtnKeyList.push(key)
                }
            }
            // sort amClassBtnKeyList and amClassBtnKeyList
            const amClassBtnList = amClassBtnKeyList.sort().map((key) => {
                const classContent = wholeDayClasses[key]
                const numberOfAttendees = Object.keys(classContent.attendees).length
                return (
                    <Button key={key} variant="contained" color="primary" sx={{ margin: 1 }} onClick={() => handleEditClass(key)}>
                        {classContent.time}/{classContent.classType}/{classContent.instructor}/{numberOfAttendees}-{classContent.maxAttendees}
                    </Button>
                )
            })
            const pmClassBtnList = pmClassBtnKeyList.sort().map((key) => {
                const classContent = wholeDayClasses[key]
                const numberOfAttendees = Object.keys(classContent.attendees).length
                return (
                    <Button key={key} variant="contained" color="primary" sx={{ margin: 1 }} onClick={() => handleEditClass(key)}>
                        {classContent.time}/{classContent.classType}/{classContent.instructor}/{numberOfAttendees}-{classContent.maxAttendees}
                    </Button>
                )
            })

            setWholeDayClassList(wholeDayClasses)
            setAmClassBtn(amClassBtnList)
            setPmClassBtn(pmClassBtnList)
        }, (error) => {
            console.log(error)
        })
        return unsubscribe
    }, [classDate])


    let borderStyle: string = '1px solid #ccc'
    if (classDate === dayjs().format('YYYY-MM-DD')) {
        borderStyle = '3px solid #ff9800'
    }

    return (
        <Container sx={{ padding: 2, border: borderStyle, borderRadius: 2, marginBottom: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: `space-between`, mb: 1 }}>
                <Typography variant="body1">
                    {dayjs(classDate).format('dddd, YYYY-MM-DD')}
                </Typography>
                <Button variant="contained" color="primary" onClick={() => setOpenClassAdd(true)}>
                    新增課堂
                </Button>
            </Box>
            <Box sx={{ borderBottom: '1px solid #ccc', my: 1 }} />
            <Box sx={{ paddingX: 2, gap: 2, display: 'flex', flexWrap: 'wrap' }}> {amClassBtn}</Box>
            <Box sx={{ borderBottom: '1px dotted #ccc', my: 1 }} />
            <Box sx={{ paddingX: 2, gap: 2, display: 'flex', flexWrap: 'wrap' }}> {pmClassBtn}</Box>

            {openEditClass && <ClassEdit
                open={openEditClass}
                onClose={() => { setOpenEditClass(false); }}
                classDate={classDate}
                classWholeDateList={wholeDayClassList}
                classKey={targetClassKey}
            />}
            {openClassAdd &&
                <ClassAdd open={openClassAdd} onClose={() => setOpenClassAdd(false)} classDate={classDate} classWholeDateList={wholeDayClassList} />
            }
        </Container>
    );
}
