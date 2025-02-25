import { createContext } from "react";
import { User } from "firebase/auth";

export const LoginUser = createContext<User | undefined>(undefined);