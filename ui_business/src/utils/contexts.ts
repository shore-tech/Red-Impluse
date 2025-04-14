import { createContext } from "react";
import { CustomClaims } from "./dataInterface";


export const CustomClaimsCtx = createContext<CustomClaims| undefined>(undefined);

export const UserIdTokenCtx = createContext<string | undefined>(undefined);

