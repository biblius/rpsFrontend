import { Room } from "./room";
export interface ChatUser {
    id: string;
    username: string;
    active?: boolean;
    connected: boolean;
    selected?: boolean;
    hasNewMessages?: boolean;
    joinedRooms?: Room[];
}

export function isInstanceOfChatUser(object: Object): object is ChatUser {
    return 'username' in object;
}