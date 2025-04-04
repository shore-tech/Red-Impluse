
export interface CustomClaims {
    role: 'super-admin' | 'admin' | 'manager' | 'coach' | 'member',
    roleLevel: 5 | 4 | 3 | 2 | 1,
    companyId?: string,
    createdBy: string,
}



// **************** Customer ****************
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

export interface MemberObj{
    id?: string,
    firstName: string,
    lastName: string,
    email: string,
    mobile: string,
    gender: string,
    dateOfBirth: string,
    join_date: string,
    mbsExpDate?: string,
    paymentRecord?: number|string,
    fullName?: string,
    address?: string,
    beltColor?: string,
    stripe?: number,
    promotionDate?: string,
    bjjRecord?: BjjLevelRecord,
    // class_record?: string,
}

export interface BjjLevelRecord{
    [promotionDate: string]: BjjLevelRecordEntry
}

export interface BjjLevelRecordEntry{
    id?: string,
    promotionDate: string,
    stripe: number,
    beltColor: string,
    promotionBy: string,
    isNew?: boolean,
}