import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { TodosService, TodoInput } from "./todos.service";

@Controller("todos")
export class TodosController {
  constructor(private readonly todos: TodosService) {}

  @Get()
  list() {
    return this.todos.list();
  }

  @Post()
  create(@Body() body: TodoInput) {
    return this.todos.create(body);
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() body: TodoInput) {
    return this.todos.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.todos.remove(id);
  }
}
