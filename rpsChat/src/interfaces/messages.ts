import { RPS } from './rps';
import { Room } from './room';
/**
 * The main message type we send to and receive from the server.
 * 
 * `header` indicates the directive, i.e. the callback function to call registered for that header
 * 
 * `data` is the actual content of the message. This could be an array of users, a chat message etc...
 */
export interface WsMessage<T> {
    header: string,
    data: any
}

export class WsMessage<T> implements WsMessage<T> {

    constructor(header: string, data: any) {
        this.header = header;
        this.data = data;
    }

    /**
     * Transforms a `WsMessage` instance to a JSON string.
     */
    jsonify(): string {
        return JSON.stringify(this);
    }

    /**
     * 
     * @param json A JSON string of a `WsMessage`.
     * @returns A `WsMessage` instance of the parsed string.
     */
    static parse(json: string): WsMessage<any> {
        let msg;
        try {
            msg = JSON.parse(json);
        } catch (err) {
            console.log("NOT VALID JSON")
        }
        if (msg) {
            return new WsMessage(msg.header, msg.data);
        } else throw new Error('Unable to parse WsMessage');
    }
}

/**
 * The client friendly interface
 */
export interface ChatMessage {
    id: string
    senderId: string,
    receiverId: string,
    senderUsername?: string
    content: string,
    read: boolean
}

/**
 * The server friendly interface
 */
export interface ServerChatMessage {
    id: string,
    sender_id: string,
    receiver_id: string,
    content: string,
    read: boolean
}

export interface RPSMessage {
    message: RPSData
}

export class RPSMessage implements RPSMessage {
    constructor(data: RPSData) {
        this.message = data;
    }
}

/**
 * Data expected when sending (`Init`,`Action`) and receiving (`Update`,`State`) `rps` messages
 */
export type RPSData = {
    Init?: { host: string, players: string[] },
    Action?: { game_id: string, sender_id: string, action: any },
    Update?: { game_id: string, event: Event },
    State?: RPS,
    Rooms?: RPS[]
}

/**
 * Type of event we can receive from the chat server
 */
export type Event = {
    PlayerConnected?: string,
    FastToggled?: boolean,
    Choices?: [string, 'r' | 'p' | 's' | 'x'][],
    Winners?: string[]
}

/**
 * Data expected when receiving `room` messages
 */
export type RoomData = {
    Message?: ChatMessage,
    Room?: Room,
    Rooms?: Room[],
    Joined?: [string, string],
}