// react component for member page
import { use, useContext, useEffect, useState } from "react";

// third party imports
import { doc, onSnapshot } from "firebase/firestore";
import { Avatar, Box, Button, Container, Grid, IconButton, Typography } from "@mui/material";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

// local imports
import { styleMainColBox } from "./CommonComponents";
import ClassSchTmpDayCard from "./ClassSchTmpDayCard";
import { WeeklyTmpCnt } from "../utils/dataInterface";

// date time
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-hk';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { db } from "../utils/firebaseConfig";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Hong_Kong");


export default function ClassSchTmp() {
    const weekDayKeyList: string[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    const [weeklyTmp, setWeeklyTmp] = useState<WeeklyTmpCnt>({})

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, '/class_list/template'), (doc) => {
            if (doc.data()) {
                const data = doc.data();
                console.log(data);
                setWeeklyTmp(data as WeeklyTmpCnt)
            }
        })
        return unsubscribe
    }, [])

    return (
        <Container component="main" sx={styleMainColBox}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <EventAvailableIcon />
                </Avatar>
                <Typography variant="body1">
                    時間表模板
                </Typography>
            </Box>
            {weekDayKeyList.map((dayKey) => 
                <ClassSchTmpDayCard key={dayKey} dayKey={dayKey} dayClassList={weeklyTmp[dayKey]} />
            )}

        </Container>
    );
}
