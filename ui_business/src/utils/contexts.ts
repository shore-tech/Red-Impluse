import { createContext } from "react";


export const CustomClaimsCtx = createContext<
    {
        role: 'super-admin' | 'admin' | 'manager' | 'coach' | 'member',
        roleLevel: 5 | 4 | 3 | 2 | 1
    } | undefined
>(undefined);