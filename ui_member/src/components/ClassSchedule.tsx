// react component for member page
import React, { Dispatch, JSX, SetStateAction, useContext, useEffect, useState } from "react";

// third party imports
import { Avatar, Box, Button, Container, Grid, IconButton, Typography } from "@mui/material";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SkipPreviousOutlinedIcon from '@mui/icons-material/SkipPreviousOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';


// local imports
import { styleMainColBox, btnBox } from "./CommonComponents";
import ClassDayCard from "./ClassDayCard";



// date time
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-hk';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Hong_Kong");
// Dispatch<SetStateAction<JSX.Element>>

export default function ClassSchedule(props: { setView: Dispatch<SetStateAction<JSX.Element>> }) {
    const [daysOfWeek, setDaysOfWeek] = useState<string[]>([])

    const resetWeekDays = () => {
        // define the dates of the current week
        const startOfWeek = dayjs().startOf('week');
        const weekDays: string[] = [];
        for (let i = 0; i < 7; i++) {
            const day = startOfWeek.add(i, 'day').format('YYYY-MM-DD');
            weekDays.push(day);
        }
        setDaysOfWeek(weekDays);
    }

    const handleWeekChange = (direction: number) => {
        // change the week by adding or subtracting 7 days
        const newDaysOfWeek = daysOfWeek.map(day => {
            const newDate = dayjs(day).add(direction * 7, 'day');
            return newDate.format('YYYY-MM-DD');
        });
        setDaysOfWeek(newDaysOfWeek);
    }

    useEffect(() => {
        resetWeekDays()
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, width: '100%' }}>
                <Button size="medium" startIcon={<SkipPreviousOutlinedIcon />} onClick={() => handleWeekChange(-1)}>Prev</Button>
                <Button size='medium' variant="outlined" onClick={()=>resetWeekDays()}> Current </Button>
                <Button size="medium" endIcon={<SkipNextOutlinedIcon />} onClick={() => handleWeekChange(1)}>Next</Button>
            </Box>
            {daysOfWeek && daysOfWeek.map((day) => (
                <ClassDayCard key={day} date={day} setView={props.setView}/>
            ))}

        </Container>
    );
}
