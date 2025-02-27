// import { firestore } from 'firebase-admin';
import { auth } from './firebaseConfig';
import { Request, Response, NextFunction } from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Hong_Kong");

export function authenticateClient(req: Request, res: Response, next: NextFunction) {
    console.log(`\n-----> authenticateClient() ${dayjs().tz().format('DD MMM YYYY hh:mm:ss A Z')}`);
    // aim: verify the login user's token
    // argument: {req.headers.authorization;}
    // expected response: early exit | res.locals.isAuthenticated:boolean; res.locals.decodedToken:{}
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        res.status(401).send('No idToke provided.');
    } else {
        const idToken = req.headers.authorization.split('Bearer ')[1];
        console.log('idToken: \n', idToken);
        auth.verifyIdToken(idToken).then((decodedToken) => {
            console.log('middleware authenticateClient() => decoded Token: \n', decodedToken);
            res.locals.isAuthenticated = true;
            res.locals.decodedToken = decodedToken;
            next()
        }).catch((error) => {
            console.log(error);
            res.send({'Error while verifying token:\n ': error.message});
        });
    }
}