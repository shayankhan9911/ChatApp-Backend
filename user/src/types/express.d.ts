import type { IUser } from "../model/User.js";

declare global {
    namespace Express {
        interface Request {
            user: IUser | null;
        }
    }
}

export { };