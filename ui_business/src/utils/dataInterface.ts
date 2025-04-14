
export interface CustomClaims {
    role: 'super-admin' | 'admin' | 'manager' | 'assistance' | 'member',
    roleLevel: 5 | 4 | 3 | 2 | 1,
    memberId?: string,
    createdBy: string,
}



// **************** Member ****************
export interface GridMemberRowEntry {
    id: string,
    name: string,
    gender: string,
    dateOfBirth: string,
    mobile: string,
    beltColor?: string,
    stripe?: number,
    promotionDate?: string,
    mbsExpDate?: string,
    detail?: MemberObj
}

export interface MemberObj {
    id?: string,
    firstName: string,
    lastName: string,
    email: string,
    mobile: string,
    gender: string,
    dateOfBirth: string,
    join_date: string,
    mbsExpDate?: string,
    paymentRecord?: number | string,
    fullName?: string,
    address?: string,
    beltColor?: string,
    stripe?: number,
    promotionDate?: string,
    bjjRecord?: BjjLevelRecord,
    // class_record?: string,
}

export interface BjjLevelRecord {
    [promotionDate: string]: BjjLevelRecordEntry
}

export interface BjjLevelRecordEntry {
    id?: string,
    promotionDate: string,
    stripe: number,
    beltColor: string,
    promotionBy: string,
    isNew?: boolean,
}

// **************** class ****************
export interface ClassContent {
    time: string,
    duration: number,
    classType: string,
    instructor: string,
    maxAttendees: number,
    attendees: { [key: string]: string },
}
// example
// pm_0200:{
//     time: '14:00',
//     duration: 60,
//     classType: 'BJJ',
//     instructor: 'Daniel',
//     maxAttendees: 15,
//     attendees: {
//         ri_0001: 'donald',
//         ri_0002: 'john',
//     }
// }

export interface DailyTmpCnt {
    [classId: string]: ClassContent
}

export interface WeeklyTmpCnt {
    [weekDay: string]: DailyTmpCnt
}


// **************** coach ****************
export interface CoachObj {
    [classType: string]: boolean
}

// export interface CoachInDb {
//     classType: string[],
//     [coachName:string]: CoachObj
// }