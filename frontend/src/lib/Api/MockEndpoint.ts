import { type ExecuteResponse } from '../HttpService'
import {RESTEndpoint, type RESTEndpointCallOptions} from "./RESTEndpoint";

export abstract class MockEndpoint extends RESTEndpoint {
  abstract getData(options: RESTEndpointCallOptions): any | Promise<any>

  async execute<S = any>(options: RESTEndpointCallOptions): Promise<ExecuteResponse<S>> {
    return {
      data: await this.getData(options),
      error: false,
      headers: {},
      statusCode: 200,
    }
  }
}
