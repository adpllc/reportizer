import axios, { AxiosRequestConfig } from 'axios';
import { Status as CucumberStatus } from 'cucumber';
import FormData from 'form-data';
import {
  ICreateLogRequest,
  IFinishTestRequest,
  INamedFileBuffer,
  IPostItemRequest,
  IReportPortalPostResponse,
  ItemType,
  LogLevel,
  ReportPortalTestStatus
} from './models';

export default class ReportPortalClient {

  private readonly statusMap: Map<CucumberStatus, ReportPortalTestStatus> = new Map([
    [CucumberStatus.PASSED, 'PASSED'],
    [CucumberStatus.FAILED, 'FAILED'],
    [CucumberStatus.SKIPPED, 'SKIPPED'],
    [CucumberStatus.PENDING, 'FAILED'],
    [CucumberStatus.AMBIGUOUS, 'FAILED'],
  ]);

  private readonly requestConfig: AxiosRequestConfig;

  constructor(
    private readonly baseUrl: string,
    private readonly launchId: string,
    authToken: string) {
      this.requestConfig = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      };
    }

  public createItem(testName: string, testDescription: string, testItemType: ItemType, parentItemId?: string) {
    const request: IPostItemRequest = {
      description: testDescription,
      launch_id: this.launchId,
      name: testName,
      parameters: [],
      retry: false,
      start_time: Date.now(),
      tags: [],
      type: testItemType,
    };

    const pathSuffix = (parentItemId && `/${parentItemId}`) || '';

    return axios
      .post<IReportPortalPostResponse>(`${this.baseUrl}/item${pathSuffix}`, request, this.requestConfig)
      .then(response => response.data.id);
  }

  public async finishItem(itemId: string, status: CucumberStatus) {
    const request: IFinishTestRequest = {
      end_time: Date.now(),
      status: this.statusMap.get(status) || undefined,
      tags: [],
    };

    await axios.put(`${this.baseUrl}/item/${itemId}`, request, this.requestConfig);
  }

  public async addLogToItem(itemId: string, level: LogLevel, message: string, namedFileBuffer?: INamedFileBuffer) {
    const request: ICreateLogRequest = {
      item_id: itemId,
      level,
      message,
      time: Date.now()
    };

    const formData = new FormData();

    formData.append(
      'json_request_part',
      JSON.stringify(request),
    );
    if (namedFileBuffer) {
      formData.append(
        'file',
        namedFileBuffer.buffer,
        namedFileBuffer.filename,
      );
    }

    return axios
      .post<IReportPortalPostResponse>(`${this.baseUrl}/log`, formData, this.requestConfig)
      .then(response => response.data.id);
  }
}
