
// react component for member page
import { JSX, use, useEffect, useState } from "react";

// third party imports
import { Box, Button, Container, Typography } from "@mui/material";
import { doc, onSnapshot } from "firebase/firestore";
import dayjs from "dayjs";

// local imports
import { db } from "../utils/firebaseConfig";
import { ClassContent } from "../utils/dataInterface";
import { DailyTmpCnt } from "../utils/dataInterface";
import ClassSchTmpAdd from "./ClassSchTmpAdd";
import { btnBox } from "./CommonComponents";


export default function ClassSchTmpDayCard(props: { dayKey: string, dayClassList: DailyTmpCnt }) {
    const [displayWD, setDisplayWD] = useState<string>('')

    const [wholeDayClassList, setWholeDayClassList] = useState<DailyTmpCnt>({})
    const [amClassBtnList, setAmClassBtnList] = useState<JSX.Element[]>([])
    const [pmClassBtnList, setPmClassBtnList] = useState<JSX.Element[]>([])

    const [openAddTmp, setOpenAddTmp] = useState<boolean>(false)
    const [openEditTmp, setOpenEditTmp] = useState<boolean>(false)


    const handleAddClass = () => { }
    const handleEditClass = (key: string) => { }
    const handleApplyTmp = (key: string) => { }

    // useEffect(() => {
    //     console.log(props.dayKey)
    //     console.log(amClassBtnList);
    //     console.log(pmClassBtnList);
    // },[amClassBtnList, pmClassBtnList])

    useEffect(() => {
        if (!props.dayClassList) return;
        let wholeDayClasses: { [classId: string]: ClassContent } = {}
        let amClassBtnKeyList: string[] = []
        let pmClassBtnKeyList: string[] = []
        for (const [key, value] of Object.entries(props.dayClassList)) {
            wholeDayClasses[key] = value
            const classSession = key.split('_')[0]
            if (classSession === 'am') {
                amClassBtnKeyList.push(key)
            } else if (classSession === 'pm') {
                pmClassBtnKeyList.push(key)
            }
        }
        // sort amClassBtnKeyList and amClassBtnKeyList
        const amClassBtnList = amClassBtnKeyList.map((key) => {
            const classContent = wholeDayClasses[key]
            console.log(key);
            console.log(classContent);
            const numberOfAttendees = Object.keys(classContent.attendees).length
            return (
                <Button key={key} variant="contained" color="primary" sx={{ margin: 1 }} onClick={() => handleEditClass(key)}>
                    {classContent.time}/{classContent.classType}/{classContent.instructor}/{numberOfAttendees}-{classContent.maxAttendees}
                </Button>
            )
        })

        const pmClassBtnList = pmClassBtnKeyList.map((key) => {
            const classContent = wholeDayClasses[key]
            const numberOfAttendees = Object.keys(classContent.attendees).length
            return (
                <Button key={key} variant="contained" color="primary" sx={{ margin: 1 }} onClick={() => handleEditClass(key)}>
                    {classContent.time}/{classContent.classType}/{classContent.instructor}/{numberOfAttendees}-{classContent.maxAttendees}
                </Button>
            )
        })
        setWholeDayClassList(wholeDayClasses)
        setAmClassBtnList(amClassBtnList)
        setPmClassBtnList(pmClassBtnList)
    }, [props.dayClassList])

    useEffect(() => {
        switch (props.dayKey) {
            case 'mon':
                setDisplayWD('Monday')
                break;
            case 'tue':
                setDisplayWD('Tuesday')
                break;
            case 'wed':
                setDisplayWD('Wednesday')
                break;
            case 'thu':
                setDisplayWD('Thursday')
                break;
            case 'fri':
                setDisplayWD('Friday')
                break;
            case 'sat':
                setDisplayWD('Saturday')
                break;
            case 'sun':
                setDisplayWD('Sunday')
                break;
            default:
                setDisplayWD('Monday')
                break;
        }
    }, [props.dayKey])

    return (
        <Container sx={{ padding: 2, border: '1px solid #ccc', borderRadius: 2, marginBottom: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: `space-between`, mb: 1 }}>
                <Typography variant="body1">
                    {displayWD}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" color="primary" onClick={() => setOpenAddTmp(true)} >
                        套用模板
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => setOpenAddTmp(true)} >
                        新增課堂
                    </Button>
                </Box>
            </Box>
            <Box sx={{ borderBottom: '1px solid #ccc', my: 1 }} />
            <Box sx={{ paddingX: 2, gap: 2, display: 'flex', flexWrap: 'wrap' }}> {amClassBtnList}</Box>
            <Box sx={{ borderBottom: '1px dotted #ccc', my: 1 }} />
            <Box sx={{ paddingX: 2, gap: 2, display: 'flex', flexWrap: 'wrap' }}> {pmClassBtnList}</Box>

            {openAddTmp && <ClassSchTmpAdd open={openAddTmp} onClose={() => setOpenAddTmp(false)} weekDay={props.dayKey} wholeDayTmp={props.dayClassList} />}

        </Container>
    );
}
