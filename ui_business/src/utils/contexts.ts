import { createContext } from "react";


export const CustomClaimsCtx = createContext<
    {
        role: 'super-admin' | 'admin' | 'manager' | 'coach' | 'member',
        roleLevel: 5 | 4 | 3 | 2 | 1
    } | undefined
>(undefined);


export const UserIdTokenCtx = createContext<string | undefined>(undefined);

export const localServerUrl = "http://127.0.0.1:5001/red-impluse/us-central1/app";
export const cloudServerUrl = "https://app-pexeirbrzq-uc.a.run.app"