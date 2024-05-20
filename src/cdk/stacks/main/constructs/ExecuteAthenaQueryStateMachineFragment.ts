import { Construct } from 'constructs'
import {
  Choice,
  Condition,
  Fail,
  INextable,
  JsonPath,
  Pass,
  State,
  StateMachineFragment,
  Wait,
  WaitTime
} from 'aws-cdk-lib/aws-stepfunctions'
import { AthenaGetQueryExecution, AthenaStartQueryExecution } from 'aws-cdk-lib/aws-stepfunctions-tasks'
import { Duration } from 'aws-cdk-lib'

export interface ExecuteAthenaQueryStateMachineFragmentProps {
  athenaWorkgroupName: string
}

export class ExecuteAthenaQueryStateMachineFragment extends StateMachineFragment {
  public readonly startState: State
  public readonly endStates: INextable[]

  constructor(scope: Construct, id: string, props: ExecuteAthenaQueryStateMachineFragmentProps) {
    super(scope, id)

    const queryAthena = new AthenaStartQueryExecution(this, `StartQuery`, {
      queryString: JsonPath.stringAt('$.queryString'),
      workGroup: props.athenaWorkgroupName
    })

    const getQueryExecution = new AthenaGetQueryExecution(this, `GetQueryResult`, {
      queryExecutionId: JsonPath.stringAt('$.QueryExecutionId'),
      resultPath: '$.GetQueryExecutionResult'
    })

    const wait = new Wait(this, `Wait`, {
      time: WaitTime.duration(Duration.seconds(3))
    })
    wait.next(getQueryExecution)

    const choice = new Choice(this, `Choice`, {})
    choice.when(
      Condition.or(
        Condition.stringMatches('$.GetQueryExecutionResult.QueryExecution.Status.State', 'QUEUED'),
        Condition.stringMatches('$.GetQueryExecutionResult.QueryExecution.Status.State', 'RUNNING')
      ),
      wait
    )
    choice.when(
      Condition.stringMatches('$.GetQueryExecutionResult.QueryExecution.Status.State', 'SUCCEEDED'),
      new Pass(this, `QuerySuccess`)
    )
    choice.otherwise(new Fail(this, `QueryFailure`))

    queryAthena.next(getQueryExecution).next(choice)

    this.startState = queryAthena
    this.endStates = choice.afterwards().endStates
  }
}
