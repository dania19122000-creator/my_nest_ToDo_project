import { Controller, Get, Post, Body, Param, Delete, Patch, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import type { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { Task } from './entities/task-entity';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';




@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
    
    constructor(private tasksService: TasksService) {}

    // @Get()
    // getTasks(@Query() filterDto: GetTasksFilterDto): Task[]{
    //     // if we have any filter defined, call tasksService.getTasksWithFilters
    //     // otherwise, just get all tasks
    //     if (Object.keys(filterDto).length) {
    //         return this.tasksService.getTasksWithFilters(filterDto);  
    //     } else {
    //         return this.tasksService.getAllTasks();
    //     }


    // }
    @Post()
    createTask(@Body() createTaskDto: CreateTaskDto,
                @GetUser() user: User
): Promise<Task> {//берет из body (тела) поле description и кладет в description
        
        return this.tasksService.createTask(createTaskDto, user);
        
    }

    @Get('/:id')
    getTaskById(@Param('id') id: string, @GetUser() user: User): Promise<Task> {
        return this.tasksService.getTaskById(id, user);
    } 


    @Delete('/:id')
    deleteTaskById(
        @Param('id') id: string,
        @GetUser() user: User
    ): Promise<void> {
        return this.tasksService.deleteTaskById(id, user);
    }

    @Patch('/:id/status')
    updateTaskStatus(
        @Param('id') id: string,
        @Body() updateTaskStatusDto: UpdateTaskStatusDto,
        @GetUser() user: User
    ): Promise<Task> {
        const { status } = updateTaskStatusDto;
        return this.tasksService.updateTaskStatus(id, status, user);
    }

    @Get()
    getTasks(
        @Query() filterDto: GetTasksFilterDto,
        @GetUser() user: User
    ): Promise<Task[]> {
        // if we have any filter defined, call tasksService.getTasksWithFilters
        // otherwise, just get all tasks
        if (Object.keys(filterDto).length) {
            return this.tasksService.getTaskWithFilters(filterDto, user);  
        } else {
            return this.tasksService.getTaskWithFilters({}, user);//пустой объект
        }

    // @Get('/:id')
    // getTaskById(@Param('id') id: string): Task | undefined {
    //     return this.tasksService.getTaskById(id);
    // }

    // @Delete('/:id')
    // deleteTaskById(@Param('id') id: string): void {
    //     return this.tasksService.deleteTaskById(id);
    // }

    

    // @Post()
    // createTask(@Body()createTaskDto: CreateTaskDto): Task {//берет из body (тела) поле description и кладет в description
        
    //     return this.tasksService.createTask(createTaskDto);
        
    // }

    // @Patch('/:id/status')
    // updateTaskStatus(
    //     @Param('id') id: string,
    //     @Body() UpdateTaskStatusDto: UpdateTaskStatusDto,
    // ): Task | undefined {
    //     const { status } = UpdateTaskStatusDto;
    //     return this.tasksService.updateTaskStatus(id, status);
    // }
}





}
