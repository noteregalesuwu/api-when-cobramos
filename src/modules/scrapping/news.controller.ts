import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('proxy_image/:id')
  async proxyImage(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const url = await this.newsService.getNewById(Number(id));
      const result = await this.newsService.proxyImages(url.image);

      if (result.status === 200) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.status(200).send(result.buffer);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res
          .status(result.status)
          .json({ message: result.message, error: result.error });
      }
    } catch (e) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Get('proxy_images/:id')
  async proxyImages(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const url = await this.newsService.getNewById(Number(id));
      const result = await this.newsService.proxyImages(url.image);

      if (result.status === 200) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.status(200).send(result.buffer);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res
          .status(result.status)
          .json({ message: result.message, error: result.error });
      }
    } catch (e) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Get('get_news')
  async getTodayNews(@Res() res: Response): Promise<void> {
    try {
      return await this.newsService.getTodayNews(res);
    } catch (e) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Post('get_new_by_id')
  async getNewById(
    @Body() data: { id: number },
    @Res() res: Response,
  ): Promise<void> {
    try {
      const news = await this.newsService.getNewById(data.id);
      if (news) {
        res.status(200).json(news);
      } else {
        throw new Error('Noticia no encontrada');
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: e.message });
    }
  }
}
