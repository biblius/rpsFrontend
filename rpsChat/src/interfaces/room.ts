import { ChatUser } from "./chatUser";
import { ChatMessage } from "./messages";
export interface Room {
    id: string,
    name: string,
    users: string[];
    messages: ChatMessage[]
}

/**
 * Black magic heckery for determening whether the given object is an instance of `Room`
 * @param object The object to examine
 * @returns `true` if the object is an instance of a Room, otherwise `false`
 */
export function isInstanceOfRoom(object: Object): object is Room {
    return 'users' in object
}