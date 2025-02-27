
interface custom_claims {
    role: 'super-admin' | 'admin' | 'manager' | 'coach' | 'member',
    roleLevel: 5 | 4 | 3 | 2 | 1,
    companyId?: string,
    createdBy: string,
}

export { custom_claims };