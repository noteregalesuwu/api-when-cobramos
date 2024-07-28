import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/entities/notifications.entity';
import { Repository } from 'typeorm';
import { JWT } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { Notification_status } from 'src/entities/notification_status.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private configService: ConfigService,
    @InjectRepository(Notification_status)
    private notificationStatusRepository: Repository<Notification_status>,
  ) {}

  async getAllTokens(): Promise<string[]> {
    try {
      const tokens = await this.notificationRepository.find();
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
      /**
       * If no token is found, create a new one, else update the existing one
       */
      const existingToken = await this.notificationRepository.findOneBy({
        token,
      });
      // Logger.log('Existing token:', existingToken);
      if (existingToken.id) {
        existingToken.insert_date = new Date();
        await this.notificationRepository.update(existingToken.id, {
          insert_date: new Date(),
        });
        return {
          status: 200,
          message: 'Token updated on ' + new Date(),
        };
      }
      const newToken = this.notificationRepository.create({
        token,
        insert_date: new Date(),
      });
      await this.notificationRepository.save(newToken);
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

      const response = await fetch(this.configService.get('FCM_ENDPOINT'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      const data = await response.json();
      if (!data.error) {
        const notificationStatus = this.notificationStatusRepository.create({
          token,
          fecha_envio: new Date(),
          envio_status: 'Enviado',
          response: JSON.stringify(data),
        });
        await this.notificationStatusRepository.save(notificationStatus);
      } else {
        const notificationStatus = this.notificationStatusRepository.create({
          token,
          fecha_envio: new Date(),
          envio_status: 'Error',
          response: JSON.stringify(data),
        });
        await this.notificationStatusRepository.save(notificationStatus);
      }
    } catch (e) {
      console.error('Error al enviar la notificación:', e.message);
    }
  }
}
