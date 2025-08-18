import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { MoleculerErrorFilter } from './filters/moleculer-error.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe to automatically validate incoming DTOs
  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(new MoleculerErrorFilter());
  app.useGlobalFilters(new HttpExceptionFilter());
  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.NATS,
  //   options: { servers: process.env.NATS_URL },
  // });
  // await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
