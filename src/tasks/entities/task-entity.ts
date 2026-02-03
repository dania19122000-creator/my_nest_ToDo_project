import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TaskStatus } from "../task-status.enum";
import { User } from "src/auth/user.entity";
import { Exclude } from "class-transformer";


@Entity() // Define Task as a database entity
export class Task {
    @PrimaryGeneratedColumn('uuid') // Primary key with UUID generation 
    id: string;

    @Column() // Title column
    title: string;

    @Column() // Description column
    description: string;


    @Column() // Status column
    status: TaskStatus;


    @ManyToOne(_type => User, user => user.tasks, { eager: false }) // Many-to-one relationship with User // eager этот параметр указывает что при загрузке задачи юзер загружаться не будет автоматически
    @Exclude({ toPlainOnly: true }) // Exclude user field when transforming to plain object
    user: User;
}