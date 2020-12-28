import { FindConditions, Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Service, Inject } from "typedi";

import Executor from "../entity/Executor";

import { PaginationOptions } from "../graphql/Common";
import {
  ExecutorRelation,
  IExecutor,
  ExecutorCreateInput,
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
    conditions: FindConditions<Executor>,
    relations: ExecutorRelation[]
  ): Promise<Executor[]>;

  // Mutation
  createExecutor(executor: ExecutorCreateInput): Promise<Executor>;

  updateExecutor(
    indicator: number,
    infoUpdate: Partial<IExecutor>
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

  async getAllExecutors(
    pagination: Required<PaginationOptions>,

    relations: ExecutorRelation[] = []
  ) {
    const { cursor, offset } = pagination;

    const res = await this.executorRepository.find({
      relations,
      skip: cursor,
      take: offset,
    });

    return res;
  }

  async getOneExecutorById(
    uid: number,
    relations: ExecutorRelation[] = []
  ): Promise<Executor | undefined> {
    const res = await this.executorRepository.findOne(uid, {
      relations,
    });

    return res;
  }

  async getOneExecutorByConditions(
    conditions: Partial<IExecutor>,
    relations: ExecutorRelation[] = []
  ): Promise<Executor | undefined> {
    const res = await this.executorRepository.findOne(conditions, {
      relations,
    });

    return res;
  }

  async getExecutorsByConditions(
    conditions: FindConditions<Executor>,
    relations: ExecutorRelation[] = []
  ): Promise<Executor[]> {
    const res = await this.executorRepository.find({
      where: {
        ...conditions,
      },
      relations: Array.from(new Set(relations)),
    });

    return res;
  }

  async createExecutor(executor: ExecutorCreateInput): Promise<Executor> {
    const res = await this.executorRepository.save(executor);
    return res;
  }

  async updateExecutor(
    indicator: number,
    infoUpdate: Partial<IExecutor>
  ): Promise<Executor> {
    await this.executorRepository.update(indicator, infoUpdate);

    const updatedItem = (await this.executorRepository.findOne(
      indicator
    )) as Executor;

    return updatedItem;
  }

  async deleteExecutor(uid: number): Promise<void> {
    await this.executorRepository.delete(uid);
  }
}
