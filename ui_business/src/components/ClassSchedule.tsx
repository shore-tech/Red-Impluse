// react component for member page
import { use, useContext, useEffect, useState } from "react";

// third party imports
import { Avatar, Box, Button, Container, Grid, Typography } from "@mui/material";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
// import AssignmentAddIcon from '@mui/icons-material/AssignmentAdd';

// local imports
import { auth, db } from "../utils/firebaseConfig";
import { styleMainColBox, btnBox } from "./CommonComponents";
import { MemberObj } from "../utils/dataInterface";
import { collection, doc, onSnapshot, sum } from "firebase/firestore";
import { CustomClaimsCtx } from "../utils/contexts";
import ClassDayTB from "./ClassDayTB";


// date time
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-hk';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Hong_Kong");


export default function ClassSchedule() {
    const userClaimCtx = useContext(CustomClaimsCtx);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [openAddModule, setOpenAddModule] = useState<boolean>(false)
    const [daysOfWeek, setDaysOfWeek] = useState<string[]>([])

    useEffect(() => {
        // define the dates of the current week
        const startOfWeek = dayjs().startOf('week');
        const weekDays: string[] = [];
        for (let i = 0; i < 7; i++) {
            const day = startOfWeek.add(i, 'day').format('YYYY-MM-DD');
            weekDays.push(day);
        }
        setDaysOfWeek(weekDays);
    }, [])


    return (
        <Container component="main" sx={styleMainColBox}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <EventAvailableIcon />
                </Avatar>
                <Typography variant="body1">
                    課堂時間表
                </Typography>
            </Box>
            {/* add button below, so that user can build modules for time table */}
            <Box sx={btnBox}>
                <Button variant="contained" color="primary" onClick={() => setOpenAddModule(true)}>
                    新增模組
                </Button>
            </Box>
            {/* {daysOfWeek && <ClassDayTB date={daysOfWeek[0]} />} */}
            {daysOfWeek && daysOfWeek.map((day) => (
                <ClassDayTB key={day} date={day} />
            ))}

        </Container>
    );
}
