import { IsNumber, Max, Min } from "class-validator";
import { Field, ObjectType, InputType, Int, InterfaceType } from "type-graphql";

import User from "../entity/User";
import Task from "../entity/Task";
import Substance from "../entity/Substance";

@InterfaceType({ description: "Basic Status Wrapper" })
export class BaseStatus {
  @Field({ nullable: false })
  success!: boolean;

  @Field({ nullable: false })
  message!: string;
}

@ObjectType({
  implements: BaseStatus,
  description: "Substance Response Status Indicator",
})
export class SubstanceStatus extends BaseStatus {
  @Field(() => [Substance]!, { nullable: true })
  data?: Substance[];
}

@ObjectType({
  implements: BaseStatus,
  description: "User Response Status Indicator",
})
export class UserStatus extends BaseStatus {
  @Field(() => [User]!, { nullable: true })
  data?: User[];
}

@ObjectType({
  implements: BaseStatus,
  description: "Task Response Status Indicator",
})
export class TaskStatus extends BaseStatus {
  @Field(() => [Task]!, { nullable: true })
  data?: Task[];
}

@ObjectType({
  implements: BaseStatus,
  description: "Login / Register Status Indicator",
})
export class LoginOrRegisterStatus extends BaseStatus {
  @Field({ nullable: true })
  token?: string;

  // 下发token过期时间
  @Field(() => Int, { nullable: true })
  expiredDate?: number;
}

export class LoginOrRegisterStatusHandler {
  constructor(
    public success: boolean,
    public message: string,
    public token?: string,
    public expiredDate?: number
  ) {}
}

export class StatusHandler {
  constructor(
    public success: boolean,
    public message: string,
    public data: any = []
  ) {}
}

@InputType()
export class PaginationOptions {
  @Field(() => Int, { nullable: true })
  @Max(10)
  @Min(0)
  @IsNumber()
  cursor?: number;

  @Field(() => Int, { nullable: true })
  @Max(100)
  @Min(0)
  @IsNumber()
  offset?: number;
}
