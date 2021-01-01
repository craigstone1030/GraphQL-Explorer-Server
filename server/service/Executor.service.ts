import { Repository, SelectQueryBuilder } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Service, Inject } from "typedi";

import Executor from "../entity/Executor";

import { PaginationOptions } from "../graphql/Common";
import {
  ExecutorRelation,
  IExecutor,
  ExecutorCreateInput,
  ExecutorQueryArgs,
  ExecutorUpdateInput,
} from "../graphql/Executor";

export interface IExecutorService {
  // Query
  getAllExecutors(
    pagination: Required<PaginationOptions>,

    relations: ExecutorRelation[]
  ): Promise<Executor[]>;

  getOneExecutorById(
    uid: number,
    relations: ExecutorRelation[]
  ): Promise<Executor | undefined>;

  getOneExecutorByConditions(
    conditions: Partial<IExecutor>,
    relations: ExecutorRelation[]
  ): Promise<Executor | undefined>;

  getExecutorsByConditions(
    conditions: ExecutorQueryArgs,
    relations: ExecutorRelation[]
  ): Promise<Executor[]>;

  // Mutation
  createExecutor(executor: ExecutorCreateInput): Promise<Executor>;

  updateExecutor(
    indicator: number,
    infoUpdate: Partial<ExecutorUpdateInput>
  ): Promise<Executor>;

  deleteExecutor(uid: number): Promise<void>;
}

@Service()
export default class ExecutorService implements IExecutorService {
  constructor(
    @InjectRepository(Executor)
    private readonly executorRepository: Repository<Executor>,
    @Inject("INIT_INJECT_DATA") private readonly dateInfo: Date
  ) {}

  private generateSelectBuilder(relations: ExecutorRelation[]) {
    let selectQueryBuilder = this.executorRepository.createQueryBuilder(
      "executor"
    );

    // 直接关联
    if (relations.includes("tasks")) {
      selectQueryBuilder = selectQueryBuilder.leftJoinAndSelect(
        "executor.tasks",
        "tasks"
      );
    }

    if (relations.includes("relatedRecord")) {
      selectQueryBuilder = selectQueryBuilder
        .leftJoinAndSelect("executor.relatedRecord", "records")
        .leftJoinAndSelect("records.recordTask", "recordTask")
        .leftJoinAndSelect("records.recordAccount", "recordAccount")
        .leftJoinAndSelect("records.recordSubstance", "recordSubstance");
    }

    // 任务 >>> 实体
    if (relations.includes("substance")) {
      selectQueryBuilder = selectQueryBuilder.leftJoinAndSelect(
        "tasks.taskSubstance",
        "substance"
      );
    }

    return selectQueryBuilder;
  }

  private conditionSelectBuilder(
    builder: SelectQueryBuilder<Executor>,
    conditions: ExecutorQueryArgs
  ) {
    Object.keys(conditions).forEach((key) => {
      builder = builder.andWhere(`executor.${key}= :${key}`, {
        [key]: conditions[key],
      });
    });

    return builder;
  }

  async getAllExecutors(
    pagination: Required<PaginationOptions>,

    relations: ExecutorRelation[] = []
  ) {
    const { cursor, offset } = pagination;

    const res = await this.generateSelectBuilder(relations)
      .take(offset)
      .skip(cursor)
      .getMany();

    return res;
  }

  async getOneExecutorById(
    uid: number,
    relations: ExecutorRelation[] = []
  ): Promise<Executor | undefined> {
    const res = await this.generateSelectBuilder(relations)
      .where("executor.uid = :uid", { uid })
      .getOne();

    return res;
  }

  async getOneExecutorByConditions(
    conditions: ExecutorQueryArgs,
    relations: ExecutorRelation[] = []
  ): Promise<Executor | undefined> {
    let initialSelectBuilder = this.generateSelectBuilder(relations);

    let conditionSelectBuilder = this.conditionSelectBuilder(
      initialSelectBuilder,
      conditions
    );

    const res = await conditionSelectBuilder.getOne();
    return res;
  }

  async getExecutorsByConditions(
    conditions: ExecutorQueryArgs,
    relations: ExecutorRelation[] = []
  ): Promise<Executor[]> {
    let initialSelectBuilder = this.generateSelectBuilder(relations);

    let conditionSelectBuilder = this.conditionSelectBuilder(
      initialSelectBuilder,
      conditions
    );

    const res = await conditionSelectBuilder.getMany();
    return res;
  }

  async createExecutor(executor: ExecutorCreateInput): Promise<Executor> {
    const res = await this.executorRepository.save(executor);
    return res;
  }

  async updateExecutor(
    indicator: number,
    infoUpdate: Partial<ExecutorUpdateInput>
  ): Promise<Executor> {
    await this.executorRepository.update(indicator, infoUpdate);

    const updatedItem = (await this.getOneExecutorById(indicator))!;

    return updatedItem;
  }

  async deleteExecutor(uid: number): Promise<void> {
    await this.executorRepository
      .createQueryBuilder()
      .delete()
      .from(Executor)
      .where("uid = :uid")
      .setParameter("uid", uid)
      .execute();
  }
}
