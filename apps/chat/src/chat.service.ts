import {
  ConversationsRepositoryInterface,
  MessagesRepositoryInterface,
  UserEntity,
} from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @Inject('ConversationsRepositoryInterface')
    private readonly conversationsRepository: ConversationsRepositoryInterface,
    @Inject('MessagesRepositoryInterface')
    private readonly messagesRepository: MessagesRepositoryInterface,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  private async getUser(id: number) {
    const ob$ = this.authService.send<UserEntity>(
      {
        cmd: 'get-user',
      },
      { id },
    );

    const user = await firstValueFrom(ob$).catch((err) => console.error(err));
    return user;
  }

  async getConversations(userId: number) {
    const allConversations =
      await this.conversationsRepository.findWithRelations({
        relations: ['users'],
      });

    const userConversations = allConversations.filter((conversation) => {
      const userIds = conversation.users.map((user) => user.id);
      return userIds.includes(userId);
    });

    return userConversations.map((conversation) => ({
      id: conversation.id,
      userIds: (conversation?.users ?? []).map((user) => user.id),
    }));
  }

  async createConversation(userId: number, friendId: number) {
    const user = await this.getUser(userId);
    const friend = await this.getUser(friendId);

    if (!user || !friend) return;

    const conversation = await this.conversationsRepository.findConversation(
      userId,
      friendId,
    );

    if (!conversation) {
      return await this.conversationsRepository.save({
        users: [user, friend],
      });
    }
  }

  async createMessage(userId: number, createMessageDto: CreateMessageDto) {
    const user = await this.getUser(userId);

    if (!user) return;

    const conversation = await this.conversationsRepository.findConversation(
      userId,
      createMessageDto.friendId,
    );

    if (!conversation) return;

    return await this.messagesRepository.save({
      message: createMessageDto.message,
      user,
      conversation,
    });
  }
}
