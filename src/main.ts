import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get('ConfigService') as ConfigService;

  app.useStaticAssets(join(__dirname, '..', '..', '/public'));
  app.setBaseViewsDir(join(__dirname, '..', '..', '/views'));
  app.setViewEngine('hbs');

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(configService.get<number>('APP_PORT'));
}

bootstrap();
