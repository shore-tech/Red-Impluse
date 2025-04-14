import { createContext, Dispatch, SetStateAction, useContext } from 'react';
import { JSX } from 'react/jsx-runtime';
import { CustomClaims } from './dataInterface';


export const CustomClaimsCtx = createContext<CustomClaims| undefined>(undefined);

export const UserIdTokenCtx = createContext<string | undefined>(undefined);

