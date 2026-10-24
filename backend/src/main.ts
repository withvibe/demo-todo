import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Admin (web) and the Flutter app call this API from their own subdomains;
  // reflect any origin since there are no credentials/cookies in this demo.
  app.enableCors({ origin: true });
  await app.listen(8080, "0.0.0.0");
}
bootstrap();
