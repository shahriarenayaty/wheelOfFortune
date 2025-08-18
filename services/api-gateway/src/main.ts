import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { MoleculerErrorFilter } from './filters/moleculer-error.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe to automatically validate incoming DTOs
  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(
    new MoleculerErrorFilter(),
    new HttpExceptionFilter(),
    new AllExceptionsFilter(),
  );

  await app.listen(3000);
}
bootstrap();
