// import { firestore } from 'firebase-admin';
import { auth } from './firebaseConfig';
import { Request, Response, NextFunction } from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { custom_claims } from './dataInterface';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Hong_Kong");

export function authenticateClient(req: Request, res: Response, next: NextFunction) {
    console.log(`\n-----> authenticateClient() ${dayjs().tz().format('DD MMM YYYY hh:mm:ss A Z')}`);
    // aim: verify the login user's token
    // argument: {req.headers.authorization;}
    // expected response: early exit | res.locals.isAuthenticated:boolean; res.locals.decodedToken:{}
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        res.status(401).send('No idToken provided.');
        return;
    } else {
        const idToken = req.headers.authorization.split('Bearer ')[1];
        if (!idToken || typeof idToken !== 'string') {
            console.log('Invalid idToken:', idToken);
            res.status(400).json({msg: 'Invalid idToken format.'});
            return;
        }
        auth.verifyIdToken(idToken)
            .then((decodedToken) => {
                console.log('middleware authenticateClient() => decoded Token:', decodedToken);
                res.locals.isAuthenticated = true;
                res.locals.decodedToken = decodedToken;
                next();
            })
            .catch((error) => {
                console.log('Error during verifyIdToken:', error);
                res.status(400).send({ error: 'Error while verifying token', details: error.message });
            });
    }
}

export function initSuperAdmin(req: Request, res: Response, next: NextFunction) {
    // only allow super admin to set super admin
    if (res.locals.decodedToken.email !== 'dh3coding@gmail.com') { res.status(401).send('Unauthorized'); }
    const uid = res.locals.decodedToken.uid;
    const claims: custom_claims = { role: 'super-admin', roleLevel: 5, createdBy: uid };
    auth.setCustomUserClaims(uid, { ...claims }).then(() => {
        console.log('## initSuperAdmin ---> custom claims set');
        auth.getUser(uid).then((userRecord) => {
            console.log('user claims:\n', userRecord.customClaims);
        }).catch((error) => { });
        res.send('Super admin initialised.');
    }).catch((error) => {
        console.log('## initSuperAdmin ---> error setting custom claims:', error);
        res.status(500).send('Error setting custom claims.');
    });
}


export async function createUser(req: Request, res: Response, next: NextFunction) {
    console.log(`\n-----> createUser() ${dayjs().tz().format('DD MMM YYYY hh:mm:ss A Z')}`);
    console.log(req.body);
    const userRoleLevel = res.locals.decodedToken.roleLevel;
    const targetRoleLevel = req.body.roleLevel;
    if (userRoleLevel < 3 || userRoleLevel < targetRoleLevel) { res.status(401).send('Unauthorized');  return}
    await auth.createUser({
        email: req.body.email,
        emailVerified: false,
        password: req.body.mobile,
        displayName: req.body.displayName,
        disabled: false,
    }).then((userRecord) => {
        console.log('## createUser ---> new user created');
        console.log(userRecord);
        res.locals.newUserUid = userRecord.uid;
    }).catch((error) => {
        console.log('## createUser ---> error creating new user:', error);
        res.status(500).send({ msg: 'Error creating new user.', error: error }); // Ensure response is sent and function exits
        return
    });
    next();
}

export async function setUserRole(req: Request, res: Response, next: NextFunction) {
    console.log(`\n-----> setUserRole() ${dayjs().tz().format('DD MMM YYYY hh:mm:ss A Z')}`);
    const claims: custom_claims = { role: req.body.role, roleLevel: req.body.roleLevel, createdBy: res.locals.decodedToken.email };
    await auth.setCustomUserClaims(res.locals.newUserUid, { ...claims }).then(() => {
        console.log('## setUserRole ---> custom claims set');
    }).catch((error) => {
        console.log('## setUserRole ---> error getting user:', error);
        res.status(500).send('Error getting user.'); // Ensure response is sent and function exits
        return
    });
    await auth.getUser(res.locals.newUserUid).then((userRecord) => {
        res.status(200).send(userRecord);
        return
    }).catch((error) => {
        console.log('## setUserRole ---> error getting user:', error);
        res.status(500).send('Error getting user.'); // Ensure response is sent and function exits
        return
    });
    next();
}