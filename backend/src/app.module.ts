import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { TodosController } from "./todos.controller";
import { TodosService } from "./todos.service";

@Module({
  controllers: [TodosController],
  providers: [PrismaService, TodosService],
})
export class AppModule {}
