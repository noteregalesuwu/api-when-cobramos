import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/entities/notifications.entity';
import { Repository } from 'typeorm';
import { JWT } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private visitorRepository: Repository<Notification>,
    private configService: ConfigService,
  ) {}

  async getAllTokens(): Promise<string[]> {
    try {
      const tokens = await this.visitorRepository.find();
      return tokens.map((token) => token.token);
    } catch (e) {
      Logger.error(e.message);
      return [];
    }
  }
  async registerToken(
    token: string,
  ): Promise<{ status: number; message: string }> {
    if (!token) {
      return {
        status: 400,
        message: 'Token is required',
      };
    }
    try {
      const newToken = this.visitorRepository.create({
        token,
        insert_date: new Date(),
      });
      await this.visitorRepository.save(newToken);
      return {
        status: 200,
        message: 'Token registered',
      };
    } catch (e) {
      Logger.error(e.message);
      return {
        status: 400,
        message: 'Token is required',
      };
    }
  }

  private async authGoogleAPI(): Promise<string> {
    try {
      const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];

      const client = new JWT({
        email: this.configService.get('FIREBASE_ADMIN_EMAIL'),
        key: this.configService
          .get('FIREBASE_ADMIN_PRIVATE_KEY')
          .replace(/\\n/g, '\n'),
        scopes: SCOPES,
      });
      const tokens = await client.authorize();
      return tokens.access_token;
    } catch (e) {
      Logger.error(e.message);
    }
  }

  async sendNotification(
    title: string,
    body: string,
    token: string,
  ): Promise<void> {
    try {
      const accessToken = await this.authGoogleAPI();
      const message = {
        message: {
          token,
          notification: {
            title,
            body,
          },
        },
      };

      await fetch(this.configService.get('FCM_ENDPOINT'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      Logger.log('Notificación enviada');
    } catch (e) {
      console.error('Error al enviar la notificación:', e.message);
    }
  }
}
