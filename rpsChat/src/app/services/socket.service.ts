import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatMessage, ServerChatMessage } from 'src/interfaces/messages';
import { EZSocket } from '../../../../ezSocket/ezSocket';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  /**
   * The ezSocket instance responsible for communicating with the server
   */
  private ezSock: EZSocket;
  constructor() {
    // Set up ezSocket with the server address and sub-protocols
    this.ezSock = new EZSocket(environment.chatServer, ['ezSocket']);
  }
  /**
   * Used to get a reference to the underlying EZSocket instance.
   * @returns Instance of EZSocket
   */
  ez() {
    return this.ezSock;
  }

  /**
   * Fetches the underlying `ezSocket`'s id
   * @returns The registered socket id
   */
  getId() {
    return this.ezSock.id();
  }

  /**
   * Sends a message with the underlying socket and maps the given data to snake_case if it's an
   * object.
   * @param header Message header
   * @param data Message data
   */
  send(header: string, data: any) {
    this.ezSock.send(header, data);
  }

  /**
   * Utility method for converting any object keyed in snake_case to client friendly camelCase.
   * @param input The server side message to convert
   * @returns The converted object
   */
  convertToCamel(input: Object): any {
    const out: any = {};
    for (let [key, value] of Object.entries(input)) {
      // if (typeof value === 'object') {
      // console.log('key : ', key, 'value : ', value, 'type : ', typeof value)
      // value = this.convertToCamel(value);
      // }
      let camelKey = '';
      if (key.includes('_')) {
        for (let i = 0; i < key.length; i++) {
          // Break if it's the last char
          if (i + 1 > key.length) {
            break;
          }
          const char = key[i];
          if (char === '_' && i > 0) {
            camelKey += key[i + 1].toUpperCase();
            i += 1
          } else {
            camelKey += char;
          }
        }
      } else {
        camelKey = key;
      }
      out[camelKey] = value;
    }
    return out
  }

  /**
 * Utility method for converting an array of `ServerChatMessage` to client friendly `ChatMessage`.
 * Appends the sender's username to the messages for convenience.
 * @param input The server side chat messages to convert
 * @returns `ChatMessage[]` The converted chat message array
 */
  convertBulkToCamel(input: Object[]): any[] {
    const out: any[] = [];
    input.forEach( inp => {
      out.push(this.convertToCamel(inp));
    })
    return out;
  }
}
