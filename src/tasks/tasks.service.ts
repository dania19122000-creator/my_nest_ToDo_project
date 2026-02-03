import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';

import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';


import { Task } from './entities/task-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { filter } from 'rxjs';
import { User } from 'src/auth/user.entity';


@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
    ) {}
   // private tasks: Task[] = [];

    // getAllTasks(): Task[] {
    //     return this.tasks;
    // }

    // getTasksWithFilters(filterDto: GetTasksFilterDto): Task[] {
    //     const { status, search } = filterDto;
    //     // define a temporary array to hold tasks that match the filters
    //     let tasks = this.getAllTasks();
    //     // do something with status
    //     if (status) {
    //         tasks = tasks.filter((task) => task.status === status);
    //     }
    //     if (search) {
    //         tasks = tasks.filter((task) => {
    //             if (task.title.includes(search) || task.description.includes(search)) {
    //                 return true;
    //             }
    //             return false;
    //         });
    //     }
        
    //     return tasks;
    
    // }
    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        const { title, description } = createTaskDto;

        const task = this.tasksRepository.create({
            title,
            description,
            status: TaskStatus.OPEN,
            user,
        });
        task.user = user;
        await this.tasksRepository.save(task);
        return task ;
    }

    async getTaskWithFilters(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
        const { status, search } = filterDto;
        const query = this.tasksRepository.createQueryBuilder('task');
        query.where('task.userId = :userId', { userId: user.id });// Ensure we only get tasks for the specific user
        if (status) {
            query.andWhere('task.status = :status', { status });
        }
        if (search) {
            query.andWhere( // andWhere to combine with any existing conditions
                '(task.title LIKE :search OR task.description LIKE :search)',
                { search: `%${search}%` },
            );
        }
        return await query.getMany();
    }

    async getTaskById(id: string, user: User): Promise<Task> {
        const found = await this.tasksRepository.findOne({
            where: { id, user }, // Ensure we only get tasks for the specific user
        });
        if (!found) {
            throw new NotFoundException(`Task with ID "${id}" not found`);
        }
        return found;

    }

    async deleteTaskById(id: string, user: User): Promise<void> {
        // await this.getTaskById(id, user);
        
        // await this.tasksRepository.delete(id);
        const result = await this.tasksRepository.delete({ id, user });
        if (result.affected === 0) {
            throw new NotFoundException(`Task with ID "${id}" not found`);
        }
       

    }

    async updateTaskStatus(id: string, status: TaskStatus, user: User): Promise<Task> {
        const task = await this.getTaskById(id, user);
        task.status = status;
        await this.tasksRepository.save(task);
        return task;
    }
   

    // getTaskById(id: string): Task | undefined {

    //     const found = this.tasks.find((task) => task.id === id);
    //     if (!found) {
    //         throw new NotFoundException(`Task with ID "${id}" not found`);
    //     }

    //     return found;
        
    // }

    // deleteTaskById(id: string): void {
    //     const found = this.getTaskById(id);
    //     if (!found) {
    //         throw new NotFoundException(`Task with ID "${id}" not found`);
    //     }
    //     this.tasks = this.tasks.filter((task) => task.id !== found.id);
    // }

    
    // createTask(createTaskDto: CreateTaskDto): Task {
    //     const { title, description } = createTaskDto;
    //     const task: Task = {
    //         id: uuidv4(),
    //         title,
    //         description,
    //         status: TaskStatus.OPEN,
    //     };
    //     this.tasks.push(task);
    //     return task;
    // }

    // updateTaskStatus(id: string, status: TaskStatus) {
    //     const task = this.getTaskById(id);
        
    //     if (task) {
    //         task.status = status;
    //     }
        
    //     return task;
    // }

}
