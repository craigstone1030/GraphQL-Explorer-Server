import { ObjectType } from "type-graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  RelationId,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from "typeorm";
import { TypeormLoader } from "type-graphql-dataloader";

import User from "./User";
import Substance from "./Substance";

import { DifficultyLevel } from "../graphql/Public";
import { ITask, TaskSource, TaskTarget } from "../graphql/Task";

@ObjectType({ implements: ITask })
@Entity()
export default class Task extends BaseEntity implements ITask {
  @PrimaryGeneratedColumn()
  taskId!: string;

  @Column({ unique: true, nullable: false })
  // @Field({ complexity: 100 })
  taskTitle!: string;

  @Column({ nullable: false, default: "任务内容待补充" })
  taskContent!: string;

  @Column({ nullable: false, default: false })
  taskAccmplished!: Boolean;

  @Column({ nullable: false, default: TaskSource.OTHER })
  taskSource!: TaskSource;

  @Column({ nullable: false, default: DifficultyLevel.ROOKIE })
  taskLevel!: DifficultyLevel;

  @Column({ nullable: false, default: 1000 })
  taskReward!: number;

  @Column({ nullable: false, default: TaskTarget.OTHER })
  taskTarget!: TaskTarget;

  @Column({ nullable: true })
  taskRate?: number;

  // 就假设一个任务只会有一个实体出现好了...
  @OneToOne(() => Substance, (substance) => substance.relatedTask, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn()
  taskSubstance!: Substance;

  @ManyToOne(() => User, (user) => user.tasks, { nullable: true })
  @JoinColumn({ name: "assigneeUID" })
  @TypeormLoader((type) => User, (task: Task) => task.assigneeUID)
  assignee?: User;

  @RelationId((task: Task) => task.assignee)
  assigneeUID?: number;

  @CreateDateColumn()
  publishDate!: Date;

  @UpdateDateColumn()
  lastUpdateDate!: Date;
}
