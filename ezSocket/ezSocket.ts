import { WsMessage} from '../rpsChat/src/interfaces/messages';
import {  ChatMessage, ServerChatMessage } from '../rpsChat/src/interfaces/messages';
/**
 *  The OG web socket wrapper
*/
export class EZSocket {
    /**
     * The underlying socket instance
     */
    private socket: WebSocket;
    private _reservedNameSpace: Set<string>;
    private nameSpace: Set<string>;
    private callbackMap: Object;
    private sessionId: string = '';
    private protocols: string[];

    constructor(url: string, protocols: string[]) {
        this.socket = new WebSocket(url, protocols);
        this._reservedNameSpace = new Set(['connect', 'disconnect', 'error', 'message']);
        this.protocols = protocols;
        this.nameSpace = new Set();
        this.callbackMap = {};
        this.initSocket();
    }

    /**
     * 
     * @param header Message header 
     * @param callback A callback function that gets called when the client receives a message with the corresponding header
     */
    register(header: string, callback: Function) {
        if (this._reservedNameSpace.has(header)) {
            throw new Error('Cannot register to namespace: Directive is reserved')
        }
        this.nameSpace.add(header);
        Object.defineProperty(this.callbackMap, header, { value: callback });

    }

    /**
     * Sends a `WsMessage` to the server with the given data.
     * @param header The header of the message
     * @param data The data to send to the server
     */
    send(header: string, data: any) {
        const message = new WsMessage(header, data).jsonify();
        this.socket.send(message);
    }

    /**
     * Returns session ID.
     * @returns The session ID of the socket
     */
    id(): string {
        return this.sessionId;
    }

    /**
     * Initiates the 4 main event listeners of the underlying web socket.
     */
    private initSocket() {
        // Triggers on connection.
        this.socket.onopen = () => {
            const sessionId = sessionStorage.getItem('id');
            console.log(this)
            if (sessionId) {
                this.sessionId = sessionId;
                this.socket.send(new WsMessage('lol', 'lol').jsonify())
            }
        }
        // Triggers on exception.
        this.socket.onerror = (error) => {
            console.error(error);
        }
        // Triggers on disconnection
        this.socket.onclose = () => {
            // TO DO
        }
        // Triggers on message
        this.socket.onmessage = (wsMessage: MessageEvent<string>) => {
            const message = WsMessage.parse(wsMessage.data)!;
            if (!message) {
                return;
            }
            const directive = message.header;
            console.log('%cDirective: ', 'background: #AAF; color: #000', directive);
            console.log('%cData: ', 'background: #AAA; color: #000', message.data);
            if (this.isDirective(directive)) {
                const func = Object.getOwnPropertyDescriptor(this.callbackMap, directive)!;
                if (func && typeof func.value === 'function') {
                    func.value(message);
                } else {
                    console.log('NO DIRECTIVE!')
                    throw new Error('The requested call is either not a function or is undefined');
                }
            }
        }
    }

    /**
   * Checks whether the header is registered.
   * @param directive The header to search for in the callback map
   * @returns 
   */
    private isDirective(directive: string): boolean {
        if (this.nameSpace.has(directive)) {
            return true;
        }
        return false;
    }
}

