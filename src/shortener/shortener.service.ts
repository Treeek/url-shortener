import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Slug } from './slug.entity';
import { Repository } from 'typeorm';
import * as shortId from 'shortid';

@Injectable()
export class ShortenerService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Slug)
    private readonly slugRepository: Repository<Slug>,
  ) {}

  private async generateHash(recursion: number = 0): Promise<string> {
    if (recursion >= 5) {
        throw new HttpException('server error', 500);
    }

    const hashUrl = shortId.generate();
    const slug = await this.slugRepository.findOne({ slug: hashUrl });
    if (slug) {
      return this.generateHash(recursion + 1);
    }
    return hashUrl;
  }

  async shortUrl(url: string) {
    const hashUrl = await this.generateHash();
    const slug = new Slug();
    slug.slug = hashUrl;
    slug.url = url;

    await this.slugRepository.save(slug);
    return `${this.configService.get<string>('APP_URL')}/${hashUrl}`;
  }

  async getSlugByHash(hashUrl: string): Promise<Slug | void> {
    return this.slugRepository.findOne({ slug: hashUrl });
  }

  async sortSlugsByAccess() {
    return this.slugRepository.find({ relations: ['access'], order: {}});
  }
}
