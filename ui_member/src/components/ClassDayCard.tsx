// react component for member page
import { Dispatch, JSX, SetStateAction, useContext, useEffect, useState } from "react";

// third party imports
import { Box, Button, Container, Typography } from "@mui/material";
import { doc, onSnapshot } from "firebase/firestore";
import dayjs from "dayjs";

// local imports
import { auth, db } from "../utils/firebaseConfig";
import { ClassContent, CustomClaims } from "../utils/dataInterface";
import { CustomClaimsCtx } from "../utils/contexts";
import AuthLogin from "./AuthLogin";
import ClassEnroll from "./ClassEnroll";


export default function ClassDayCard(props: { date: string, setView: Dispatch<SetStateAction<JSX.Element>> }) {
    const userClaims = useContext(CustomClaimsCtx)

    const [classDate, setClassDate] = useState<string>(props.date)
    const [wholeDayClassList, setWholeDayClassList] = useState<{ [classId: string]: ClassContent } | undefined>(undefined)

    const [amClassBtn, setAmClassBtn] = useState<JSX.Element[]>([])
    const [pmClassBtn, setPmClassBtn] = useState<JSX.Element[]>([])

    const [openEnrollClass, setOpenEnrollClass] = useState<boolean>(false)
    const [targetClassKey, setTargetClassKey] = useState<string>('new')

    const handleEnrollClass = (key: string) => {
        // check if member is logged in
        if (!auth.currentUser || !userClaims) {
            props.setView(<AuthLogin setView={props.setView} />)
        } else {
            setTargetClassKey(key)
            setOpenEnrollClass(true)
        }
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
            const amClassBtnList = amClassBtnKeyList.sort().map((classKey) => {
                const classContent = wholeDayClasses[classKey]
                const numberOfAttendees = Object.keys(classContent.attendees).length
                const isDisabled = (numberOfAttendees >= classContent.maxAttendees) && !(userClaims?.memberId as string in classContent.attendees)
                const btnColor: "primary" | "success" = (userClaims?.memberId as string in classContent.attendees) ? 'success' : 'primary'
                return (
                    <Button disabled={isDisabled} key={classKey} variant="contained" color={btnColor} sx={{ margin: 1 }} onClick={() => handleEnrollClass(classKey)}>
                        {classContent.time}/{classContent.classType}/{classContent.instructor}/{numberOfAttendees}-{classContent.maxAttendees}
                    </Button>
                )
            })
            const pmClassBtnList = pmClassBtnKeyList.sort().map((classKey) => {
                const classContent = wholeDayClasses[classKey]
                const numberOfAttendees = Object.keys(classContent.attendees).length
                const isDisabled = (numberOfAttendees >= classContent.maxAttendees) && !(userClaims?.memberId as string in classContent.attendees)
                const btnColor: "primary" | "success" = (userClaims?.memberId as string in classContent.attendees) ? 'success' : 'primary'
                return (
                    <Button disabled={isDisabled} key={classKey} variant="contained" color={btnColor} sx={{ margin: 1 }} onClick={() => handleEnrollClass(classKey)}>
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
            </Box>
            {wholeDayClassList && <>
                <Box sx={{ borderBottom: '1px solid #ccc', my: 1 }} />
                <Box sx={{ paddingX: 2, gap: 2, display: 'flex', flexWrap: 'wrap' }}> {amClassBtn}</Box>
                <Box sx={{ borderBottom: '1px dotted #ccc', my: 1 }} />
                <Box sx={{ paddingX: 2, gap: 2, display: 'flex', flexWrap: 'wrap' }}> {pmClassBtn}</Box>
            </>}
            {openEnrollClass && wholeDayClassList && <ClassEnroll
                open={openEnrollClass}
                onClose={() => { setOpenEnrollClass(false); }}
                classDate={classDate}
                classWholeDateList={wholeDayClassList}
                classKey={targetClassKey}
            />}
        </Container>
    );
}
