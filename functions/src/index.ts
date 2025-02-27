import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import cors from 'cors';
import { custom_claims } from './dataInterface';

import { authenticateClient } from './middlesware';

// date time
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { auth } from './firebaseConfig';
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
app.post('/initSuperAdmin', authenticateClient, (req, res) => {
    console.log(`******************** end of ${req.path} ********************`);
    // only allow super admin to set super admin
    if (res.locals.decodedToken.email !== 'dh3coding@gmail.com') { res.status(401).send('Unauthorized'); }
    const uid = res.locals.decodedToken.uid;
    const claims: custom_claims = {role: 'super-admin', roleLevel: 5, createdBy: uid};
    auth.setCustomUserClaims(uid, {...claims}).then(() => {
        console.log('## initSuperAdmin ---> custom claims set');
        auth.getUser(uid).then((userRecord) => {
            console.log('user claims:\n', userRecord.customClaims);
        }).catch((error) => { });
        res.send('Super admin initialised.');
    }).catch((error) => {
        console.log('## initSuperAdmin ---> error setting custom claims:', error);
        res.status(500).send('Error setting custom claims.');
    });
});

// function to system admin
// function to add user
app.post('/createNewSystemUser')

// function to change user's role level

// function to remove user

exports.app = onRequest(app);