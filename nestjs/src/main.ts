import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser()); // Do you like cookies ?
  app.useGlobalPipes(new ValidationPipe()); // validation for every incoming requests
  app.enableCors({credentials: true, origin: "http://localhost:3000", allowedHeaders:"*", methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'});
  await app.listen(process.env.PORT);
}
bootstrap();
