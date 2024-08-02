import { Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Noticias } from 'src/entities/noticias.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import * as Cherio from 'cheerio';
import { Response } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(Noticias)
    private noticiasRepository: Repository<Noticias>,
  ) {}

  async getInitialData(): Promise<
    | {
        status: number;
        message: string;
        error?: string;
      }
    | {
        status: number;
        message: string;
        error?: string;
      }
  > {
    try {
      const sites = [
        {
          url: 'https://ultimahora.com.py/nacionales',
          source: 'https://ultimahora.com.py',
          name: 'Ultima Hora',
        },
        {
          url: 'https://www.abc.com.py/nacionales/',
          source: 'https://www.abc.com.py',
          name: 'ABC Color',
        },
      ];
      let UHData: { count: number; status?: number },
        ABCdata: { count: number; status?: number };

      for (const site of sites) {
        switch (site.name) {
          case 'Ultima Hora':
            UHData = await this.parseUH(site);
            break;
          case 'ABC Color':
            ABCdata = await this.parseABC(site);
            break;
        }
      }
      return {
        status: 200,
        message: `Parsed ${UHData.count + ABCdata.count} news`,
      };
    } catch (e) {
      return {
        status: 500,
        message: 'An error occurred',
        error: e.message,
      };
    }
  }

  async parseUH(site: { url: string; source: string; name: string }) {
    try {
      const result = await fetch(site.url);
      const response = await result.text();

      const $ = Cherio.load(response, null, false);

      const pageListPromo = $('.PageList-items-item');
      const data = [];
      pageListPromo.each((index, element) => {
        const url = $(element).find('a').attr('href');
        const image = $(element).find('img').attr('src');
        const title = $(element).find('.PagePromo-title a').text();
        const date = $(element).find('.PagePromo-date').text();

        data.push({ url, image, title, date });
      });
      for (let i = 0; i < data.length; i++) {
        const currentPage = await fetch(data[i].url);
        const response = await currentPage.text();
        const $ = Cherio.load(response);

        const paragraphs = $('.RichTextArticleBody p, .RichTextBody p')
          .map((index, element) => {
            return $(element).text();
          })
          .get();

        data[i].body = paragraphs.join('\n');
        const existingNoticia = await this.noticiasRepository.findOne({
          where: { hash_id: await this.createChecksum(data[i].url) },
        });

        if (!existingNoticia) {
          const noticia = this.noticiasRepository.create({
            body: data[i].body,
            url: data[i].url,
            date: this.parseDate(data[i].date),
            image: data[i].image,
            title: data[i].title,
            source: site.url,
            hash_id: await this.createChecksum(data[i].url),
          });
          await this.noticiasRepository.save(noticia);
        } else {
          continue;
        }
      }
      return {
        status: 200,
        count: data.length,
      };
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        count: 0,
      };
    }
  }

  async parseABC(site: { url: string; source: string; name: string }) {
    try {
      const result = await fetch(site.url);
      const response = await result.text();

      const $ = Cherio.load(response, null, false);

      const pageListPromo = $('.item-article');
      const data = [];
      pageListPromo.each((index, element) => {
        const image = $(element).find('img').attr('src');
        const url = $(element).find('a').attr('href');
        const title = $(element).find('.article-title').text();
        const date = '';
        if (image) {
          data.push({ url: site.source + url, image, title, date });
        }
      });
      for (let i = 0; i < data.length; i++) {
        const currentPage = await fetch(data[i].url);
        const response = await currentPage.text();
        const $ = Cherio.load(response);

        const paragraphs = $('#article-content p:not([class])')
          .map((index, element) => {
            return $(element).text();
          })
          .get();
        const date = $('.article-date').text();
        data[i].date = date;
        data[i].body = paragraphs.join('\n');
        const existingNoticia = await this.noticiasRepository.findOne({
          where: { hash_id: await this.createChecksum(data[i].url) },
        });

        if (!existingNoticia) {
          const noticia = this.noticiasRepository.create({
            body: data[i].body,
            url: data[i].url,
            date: this.parseABCDate(data[i].date),
            image: data[i].image,
            title: data[i].title,
            source: site.url,
            hash_id: await this.createChecksum(data[i].url),
          });
          await this.noticiasRepository.save(noticia);
        } else {
          continue;
        }
      }
      return {
        status: 200,
        count: data.length,
      };
    } catch (e) {
      console.log(e);
      return {
        status: 500,
        count: 0,
      };
    }
  }

  parseDate(date: string): string {
    if (date === '') {
      return null;
    }
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    const parts = date.split(' ');
    const month = (months.indexOf(parts[0]) + 1).toString().padStart(2, '0');
    const day = parts[1].replace(',', '').padStart(2, '0');
    const year = parseInt(parts[2]);
    const timeParts = parts[3].split(':');
    const hour = timeParts[0].padStart(2, '0');
    const minute = timeParts[1].padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minute}:00`;
  }

  parseABCDate(date: string): string {
    if (date === '') {
      return null;
    }
    const months = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    if (date.includes('de')) {
      const parts = date.split(' ');
      const day = parts[0].padStart(2, '0');
      const month = (months.indexOf(parts[2].toLowerCase()) + 1)
        .toString()
        .padStart(2, '0');
      const year = parseInt(parts[4]);
      const timeParts = parts[6].split(':');
      const hour = timeParts[0].padStart(2, '0');
      const minute = timeParts[1].padStart(2, '0');
      return `${year}-${month}-${day} ${hour}:${minute}:00`;
    } else {
      const parts = date.split(' ');
      const month = (months.indexOf(parts[0].toLowerCase()) + 1)
        .toString()
        .padStart(2, '0');
      const day = parts[1].replace(',', '').padStart(2, '0');
      const year = parseInt(parts[2]);
      const timeParts = parts[3].split(':');
      let hour = parseInt(timeParts[0]);
      const minute = timeParts[1].padStart(2, '0');
      const period = parts[4].toLowerCase();

      if (period === 'p. m.' && hour < 12) {
        hour += 12;
      } else if (period === 'a. m.' && hour === 12) {
        hour = 0;
      }

      return `${year}-${month}-${day} ${hour.toString().padStart(2, '0')}:${minute}:00`;
    }
  }

  async createChecksum(data: string): Promise<string> {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
  }

  async getTodayNews(@Res() res: Response): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const news = await this.noticiasRepository.find({
        select: ['id', 'title', 'date', 'image'],
        where: {
          date: MoreThanOrEqual(today),
        },
        order: {
          date: 'DESC',
        },
      });

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Custom-Header', 'CustomHeaderValue');
      const proxyNews = news.map((article) => {
        return {
          ...article,
          image: `proxy_images/${article.id}`,
        };
      });
      res.status(200).json(proxyNews);
    } catch (e) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Custom-Header', 'CustomHeaderValue');
      res.status(500).json({ message: 'An error occurred', error: e.message });
    }
  }

  async getNewById(id: number): Promise<Noticias> {
    try {
      const article = await this.noticiasRepository.findOne({
        where: {
          id: id,
        },
      });

      return article;
    } catch (e) {
      return null;
    }
  }

  async proxyImages(url: string): Promise<any> {
    try {
      const result = await fetch(url);
      const arrayBuffer = await result.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return {
        status: 200,
        buffer,
      };
    } catch (e) {
      return {
        status: 500,
        message: e.message,
        error: e.message,
      };
    }
  }
}
