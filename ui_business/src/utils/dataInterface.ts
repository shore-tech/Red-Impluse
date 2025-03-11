
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
    firstName: string,
    lastName: string,
    email: string,
    mobile: string,
    gender: string,
    dateOfBirth: string,
    join_date: string,
    mbsExpDate?: string,
    paymentRecord?: number,
    fullName?: string,
    address?: string,
    bjjLevel?: BjjLevel,
    class_record?: string,
}

export interface BjjLevel{
    beltColor: string,
    stripe: number,
    promotionDate: string,
    promotionBy: string,
    promotionRecord?: BjjLevel,
}
