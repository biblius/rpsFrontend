import { RoomData } from '../../interfaces/messages';
import { SocketService } from './socket.service';
import { WsMessage, ChatMessage, ServerChatMessage } from '../../interfaces/messages';
import { BehaviorSubject, mergeScan, } from 'rxjs';
import { Injectable } from "@angular/core";
import { ChatUser, isInstanceOfChatUser } from 'src/interfaces/chatUser';
import { isInstanceOfRoom, Room } from 'src/interfaces/room';
import * as uuid from 'uuid';
@Injectable({
  providedIn: 'root'
})

/**
 * Main class for handling chat messages received from the chat server. 
 */
export class MessageService {
  /**
   * Every chat message received by ezSocket gets stored here.
   */
  messages: ChatMessage[] = [];
  /**
   * Represents the logged in user, obtained on connection with the `session` message.
   */
  activeUserId!: string;
  /**
 * Represents the currently selected item in the chat component.
 */
  selected?: ChatUser | Room;
  /**
   * Used for displaying chat messages that concern the active user and the selected user.
   */
  privateMessages: ChatMessage[] = [];
  messageSubject = new BehaviorSubject<ChatMessage[]>(this.messages);
  /**
   * All users with an established session with the server get stored here.
   */
  users: Map<string, ChatUser> = new Map<string, ChatUser>();
  usersSubject = new BehaviorSubject<Map<string, ChatUser>>(this.users);
  /**
   * All the user created public chat rooms get stored here.
   */
  publicRooms: Map<string, Room> = new Map();
  publicRoomsSubject = new BehaviorSubject<Map<string, Room>>(this.publicRooms);

  constructor(private socketService: SocketService) {
    const ez = socketService.ez();
    /**
     * Obtain session ID
     */
    ez.register('session', (message: WsMessage<string>) => {
      this.activeUserId = message.data;
      console.log('Active user ID:', this.activeUserId)
    })

    /**
     * Gets users from the server and updates the users connected subject.
     */
    ez.register('users', (message: WsMessage<ChatUser[]>) => {
      const users: ChatUser[] = message.data;

      users.forEach((user: ChatUser) => {
        user.active = user.id === this.activeUserId;
        if (this.users.has(user.id)) {
          this.users.get(user.id)!.connected = true;
        } else {
          this.users.set(user.id, user);
        }
      })
      this.usersSubject.next(this.users);
    })

    /**
     * Stores all messages that were either sent or received by the active user
     */
    ez.register('messages', (message: WsMessage<ServerChatMessage[]>) => {
      const messages = this.socketService.convertBulkToCamel(message.data);
      this.messages = messages;
      console.log('RECEIVED MESSAGES : ', messages);
      this.messages.forEach((message) => {
        message.senderUsername = this.users.get(message.senderId)!.username;
        if (message.read === false && !this.publicRooms.has((message.receiverId))) {
          for (const { id } of this.users.values()) {
            if (id === message.senderId
              && message.senderId !== this.selected?.id
              && message.senderId !== this.activeUserId) {
              this.users.get(id)!.hasNewMessages = true;
              break;
            }
          }
        }
      })
      this.messageSubject.next(this.messages);
    })

    /**
     * Pushes a user to the users connected array or sets their flag to connected
     */
    ez.register('user_connected', (message: WsMessage<ChatUser>) => {
      const user: ChatUser = message.data;
      if (this.users.has(user.id)) {
        this.users.get(user.id)!.connected = true;
      } else {
        this.users.set(user.id, user);
      }
      this.usersSubject.next(this.users);
    })

    /**
     * Sets user's status to disconnected
     */
    ez.register('user_disconnected', (message: WsMessage<string>) => {
      const id = message.data;
      this.users.get(id)!.connected = false;
      this.usersSubject.next(this.users);
    })

    /**
     * Stores the received message 
     */
    ez.register('chat_message', (message: WsMessage<ChatMessage>) => {
      const chatMessage: ChatMessage = this.socketService.convertToCamel(message.data)!;
      chatMessage.senderUsername = this.users.get(chatMessage.senderId)!.username;
      // Update new message flag
      const sender = this.users.get(chatMessage.senderId)!;
      if (sender !== this.selected && !sender.active && !this.publicRooms.has(chatMessage.receiverId)) {
        sender.hasNewMessages = true;
      }
      this.usersSubject.next(this.users);

      // If it's coming from the selected user, notify them that the message is read
      if (chatMessage.senderId === this.selected?.id) {
        chatMessage.read = true;
        ez.send('read', [this.genServerChatMessage(chatMessage)])
      }

      if (this.selected!.id === chatMessage.senderId
        || this.activeUserId === chatMessage.senderId
        || (isInstanceOfRoom(this.selected!) && this.selected.id === chatMessage.receiverId)) {
        this.messages.push(chatMessage);
        this.updateMessages();
      }
    })

    /**
     * Update the read status of messages
     */
    ez.register('read', (message: WsMessage<string[]>) => {
      const messages: ServerChatMessage[] = message.data;
      messages.forEach(({ id }) => {
        const message = this.messages.find((message) => id === message.id)!;
        if (message) {
          message.read = true;
        }
      });
    })

    ez.register('room', (message: WsMessage<Room>) => {
      const roomData: RoomData = message.data;
      console.log(roomData);

      if (roomData.Message) {
        const message = roomData.Message;
        console.log('MESSAGE RD : ', message);
      }

      if (roomData.Room) {
        const room = roomData.Room;
        console.log('ROOM RD : ', room);
        this.publicRooms.set(room.id, room);
        this.publicRoomsSubject.next(this.publicRooms);
      }

      if (roomData.Rooms) {
        const rooms = roomData.Rooms;
        console.log('ROOMS RD : ', rooms);
        for (const room of rooms) {
          this.publicRooms.set(room.id, room);
        }
        this.publicRoomsSubject.next(this.publicRooms);
      }

      if (roomData.Joined) {
        const [playerId, roomId] = roomData.Joined;
        console.log('PLAYER JOINED RD : ', playerId);
        this.publicRooms.get(roomId)!.users.push(playerId);
        this.publicRoomsSubject.next(this.publicRooms);
      }

    })
  }

  /**********************************ON CONNECTION********************/


  createPublicRoom(roomName: string) {
    this.socketService.send('room', { sender_id: this.activeUserId, name: roomName });

  }

  joinRoom(roomId: string) {
    if (this.publicRooms.has(roomId)) {
      this.socketService.send('join', { id: this.activeUserId, room_id: roomId });
    }
  }

  leaveRoom(roomId: string) {
    // this.socket.emit('leave room', roomId);
  }

  sendMessage(text: string, receiverId: string) {
    const message: ChatMessage = {
      id: uuid.v4(),
      senderId: this.activeUserId,
      receiverId,
      content: text,
      read: false,
    }
    this.socketService.send('chat_message', this.genServerChatMessage(message));
  }

  getUsername(playerId: string): string {
    return this.users.get(playerId)!.username;
  }
  getUsernames(playerIds: string[]): string[] {
    const names = [];
    for (const id of playerIds) {
      names.push(this.getUsername(id));
    }
    return names;
  }

  /**
   * Toggles the `selected` field and sends a `join` message to the server.
   * @param selected The selected item.
   */
  select(selected: ChatUser | Room | undefined) {
    this.selected = selected;
    const read = [];
    if (selected) {
      if (isInstanceOfChatUser(selected) && !selected.active) {
        // Notify sender their messages are read
        for (const message of this.messages) {
          if (message.senderId === this.selected?.id && !message.read) {
            message.read = true;
            read.push(this.genServerChatMessage(message));
          }
        }
        if (read.length > 0) {
          this.socketService.send('read', read);
        }
      }
      this.socketService.send('join', { id: this.activeUserId, room_id: selected!.id })
    }
  }

  /**
   * Updates the `messages` array to contain the messages concerning the active and selected user or room.
   */
  updateMessages() {
    console.log('MESSAGE SERVICE : ', this.messages);
    this.messageSubject.next(this.messages);
  }

  /**
   * Utility method for generating `ServerChatMessage`, i.e. the type of message the server expects
   * @param message The message to convert to `ServerChatMessage`
   * @returns Server friendly chat message
   */
  private genServerChatMessage(message: ChatMessage): ServerChatMessage {
    return {
      id: message.id,
      content: message.content,
      sender_id: message.senderId,
      receiver_id: message.receiverId,
      read: message.read
    }
  }
}
