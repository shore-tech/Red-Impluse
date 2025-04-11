
// react component for member page
import { JSX, use, useEffect, useState } from "react";

// third party imports
import { Box, Button, Container, Typography } from "@mui/material";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

// local imports
import { db } from "../utils/firebaseConfig";
import { ClassContent } from "../utils/dataInterface";
import { DailyTmpCnt } from "../utils/dataInterface";
import { LoadingBox, MessageBox } from "./CommonComponents";
import ClassSchTmpAdd from "./ClassSchTmpAdd";
import ClassSchTmpEdit from "./ClassSchTmpEdit";


export default function ClassSchTmpDayCard(props: { dayKey: string, dayClassList: DailyTmpCnt }) {
    const [displayWD, setDisplayWD] = useState<string>('')

    const [infoMessage, setInfoMessage] = useState<string | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [wholeDayClassList, setWholeDayClassList] = useState<DailyTmpCnt>({})
    const [amClassBtnList, setAmClassBtnList] = useState<JSX.Element[]>([])
    const [pmClassBtnList, setPmClassBtnList] = useState<JSX.Element[]>([])

    const [openAddTmp, setOpenAddTmp] = useState<boolean>(false)
    const [openEditTmp, setOpenEditTmp] = useState<boolean>(false)
    const [targetTmpKey, setTargetTmpKey] = useState<string>('mon')

    const [showApplyPeriod, setShowApplyPeriod] = useState<boolean>(false)
    const [startDate, setStartDate] = useState<string>(dayjs().format('YYYY-MM-DD'))
    const [endDate, setEndDate] = useState<string>(dayjs().add(7, 'day').format('YYYY-MM-DD'))


    const handleEditTmp = (key: string) => {
        setTargetTmpKey(key)
        setOpenEditTmp(true)
    }
    const handleApplyTmp = async (dayKey: string) => {
        // check if startDate and endDate are valid
        if (dayjs(startDate).isAfter(dayjs(endDate))) {
            setErrorMessage('開始日期不能在結束日期之後')
            return
        }
        setIsLoading(true)
        // iterate the dates from startDate to endDate
        const start = dayjs(startDate, 'YYYY-MM-DD')
        const end = dayjs(endDate, 'YYYY-MM-DD')
        const dateList: string[] = []
        for (let date = start; date.isBefore(end.add(1, 'day')); date = date.add(1, 'day')) {
            if (date.format('ddd').toLowerCase() == dayKey) {
                dateList.push(date.format('YYYY-MM-DD'))
            };
        }
        if (dateList.length === 0) {
            setErrorMessage(`${start.format('YYYY-MM-DD')} 到 ${end.format('YYYY-MM-DD')} 期間沒有 ${displayWD}`)
            return
        }
        let exitDateList: string[] = []
        let targetDateList: string[] = []
        for (const date of dateList) {
            const docSnapshot = await getDoc(doc(db, `/class_list/${date}`))
            if (docSnapshot.exists()) {
                exitDateList.push(date)
            } else {
                targetDateList.push(date)
            }
        }
        if (exitDateList.length > 0) {
            setInfoMessage(`已存在的日期: ${exitDateList.join(', \n')}。 請前往課堂時間表進行編輯`)
        }
        try {
            for (const date of targetDateList) {
                const classDocRef = doc(db, `/class_list/${date}`)
                await setDoc(classDocRef, wholeDayClassList)
            }
            // If all `setDoc` operations succeed
            setInfoMessage(`套用模板成功: ${targetDateList.join(', \n')}`)
        } catch (error) {
            setErrorMessage(`套用模板失敗: ${error}`)
        }
    }
    const handleCloseAndClear = () => { }


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
            const numberOfAttendees = Object.keys(classContent.attendees).length
            return (
                <Button key={key} variant="contained" color="primary" sx={{ margin: 1 }} onClick={() => handleEditTmp(key)}>
                    {classContent.time}/{classContent.classType}/{classContent.instructor}/{numberOfAttendees}-{classContent.maxAttendees}
                </Button>
            )
        })

        const pmClassBtnList = pmClassBtnKeyList.map((key) => {
            const classContent = wholeDayClasses[key]
            const numberOfAttendees = Object.keys(classContent.attendees).length
            return (
                <Button key={key} variant="contained" color="primary" sx={{ margin: 1 }} onClick={() => handleEditTmp(key)}>
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
                    <Button variant="contained" color="primary" onClick={() => setShowApplyPeriod(!showApplyPeriod)} >
                        {showApplyPeriod ? '取消套用' : '套用模板'}
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => setOpenAddTmp(true)} >
                        新增課堂
                    </Button>
                </Box>
            </Box>
            {showApplyPeriod && <Box sx={{ border: '1px solid #ff9800', borderRadius: 2, my: 1, padding: 2, display: 'flex', alignItems: 'center', justifyContent: `space-between` }}>
                <DatePicker
                    label="開始日期"
                    value={dayjs(startDate)}
                    onChange={(newValue) => {
                        if (!newValue) return;
                        setStartDate(newValue.format('YYYY-MM-DD'))
                    }}
                />
                <DatePicker
                    label="結束日期"
                    value={dayjs(endDate)}
                    onChange={(newValue) => {
                        if (!newValue) return;
                        setEndDate(newValue.format('YYYY-MM-DD'))
                    }}
                />
                <Button variant="contained" color="primary" onClick={() => handleApplyTmp(props.dayKey)} >
                    套用
                </Button>
            </Box>}
            <Box sx={{ borderBottom: '1px solid #ccc', my: 1 }} />
            <Box sx={{ paddingX: 2, gap: 2, display: 'flex', flexWrap: 'wrap' }}> {amClassBtnList}</Box>
            <Box sx={{ borderBottom: '1px dotted #ccc', my: 1 }} />
            <Box sx={{ paddingX: 2, gap: 2, display: 'flex', flexWrap: 'wrap' }}> {pmClassBtnList}</Box>
            {openEditTmp && <ClassSchTmpEdit open={openEditTmp} onClose={() => setOpenEditTmp(false)} weekDay={props.dayKey} wholeDayTmp={wholeDayClassList} tmpKey={targetTmpKey} />}
            {openAddTmp && <ClassSchTmpAdd open={openAddTmp} onClose={() => setOpenAddTmp(false)} weekDay={props.dayKey} wholeDayTmp={props.dayClassList} />}


            {isLoading && <LoadingBox open={isLoading} onClose={() => setIsLoading(false)} />}
            {infoMessage && <MessageBox open={infoMessage ? true : false} onClose={() => { setIsLoading(false); setInfoMessage(undefined) }} type='info' message={infoMessage} />}
            {errorMessage && <MessageBox open={errorMessage ? true : false} onClose={() => { setIsLoading(false); setErrorMessage(undefined) }} type='error' message={errorMessage} />}
            {successMessage && <MessageBox open={successMessage ? true : false} onClose={() => handleCloseAndClear()} type='success' message={successMessage} />}
        </Container>
    );
}
