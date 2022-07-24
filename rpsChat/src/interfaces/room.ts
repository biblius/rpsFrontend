import { ChatUser } from "./chatUser";
import { ChatMessage } from "./messages";
export interface Room {
    id: string,
    name: string,
    users: string[];
    messages: ChatMessage[]
}

export function isInstanceOfRoom(object: Object): object is Room {
    return 'users' in object
}