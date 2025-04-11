import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import cors from 'cors';
// import { custom_claims } from './dataInterface';

import { authenticateClient, createUser, setUserRole } from './middlesware';

// date time
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
// import { auth } from './firebaseConfig';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Hong_Kong");


const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use((req, res, next) => {
    console.log(`******************** Server time: ${dayjs().tz().format('hh:mm A, DD MMM YYYY, UTCZ')} ********************`);
    console.log(`******************** endpoint: ${req.path} ********************`);
    console.log('req.headers: \n', req.headers);
    console.log('req.body: \n', req.body);
    console.log(``);
    next();
});

app.get('/', (req, res) => {
    res.send('This is Red Impluse server.');
});

// function only use once to set super admin
// ********************** APIs for initiating Super Admin **********************
app.post('/initSuperAdmin', authenticateClient, (req, res) => {
    console.log(`******************** end of ${req.path} ********************`);
});



// ********************** APIs for add System Users **********************


// ********************** APIs for add Members **********************
app.post('/addMember', authenticateClient, createUser, setUserRole,(req, res) => {
    console.log(`******************** end of ${req.path} ********************`);
})
// function to change user's role level

// function to remove user

exports.app = onRequest(app);