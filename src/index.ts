import axios, { AxiosRequestConfig } from 'axios';
import { Status as CucumberStatus } from 'cucumber';
import FormData from 'form-data';
import {
  ICreateLogRequestBody,
  IFinishLaunchRequest,
  IFinishTestRequest,
  INamedFileBuffer,
  IPostItemRequest,
  IReportPortalPostResponse,
  IStartLaunchRequest,
  ItemType,
  LaunchMode,
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
    authToken: string) {
    this.requestConfig = {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: 'application/json',
      }
    };
  }

  public startLaunch(name: string, description: string, mode: LaunchMode) {
    const request: IStartLaunchRequest = {
      name,
      start_time: Date.now(),
      description,
      mode,
      tags: []
    };

    return axios
      .post<IReportPortalPostResponse>(`${this.baseUrl}/launch`, request, this.requestConfig)
      .then(response => response.data.id);
  }

  public async finishLaunch(
    { launchId, description, status }: { launchId: string, description?: string, status?: CucumberStatus }) {

    const request: IFinishLaunchRequest = {
      status: status ? this.statusMap.get(status) || undefined : undefined,
      end_time: Date.now(),
      description,
      tags: []
    };

    await axios.put(`${this.baseUrl}/launch/${launchId}/finish`, request, this.requestConfig);
  }

  public async stopLaunch(
    { launchId, description, status }: { launchId: string; description?: string; status?: CucumberStatus; }) {

    const request: IFinishLaunchRequest = {
      status: status ? this.statusMap.get(status) || undefined : undefined,
      end_time: Date.now(),
      description,
      tags: []
    };

    await axios.put(`${this.baseUrl}/launch/${launchId}/stop`, request, this.requestConfig);
  }

  public createItem(
    testName: string, testDescription: string, testItemType: ItemType, launchId: string, parentItemId?: string) {
    const request: IPostItemRequest = {
      description: testDescription,
      launch_id: launchId,
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
    const request: ICreateLogRequestBody = {
      item_id: itemId,
      level,
      message,
      time: Date.now()
    };

    const formData = new FormData();

    if (namedFileBuffer) {
      formData.append(
        'file',
        namedFileBuffer.buffer,
        namedFileBuffer.filename,
      );

      request.file = { name: namedFileBuffer.filename };
    }

    formData.append(
      'json_request_part',
      JSON.stringify([request]),
      { contentType: 'application/json' },
    );

    return axios
      .post<IReportPortalPostResponse>(`${this.baseUrl}/log`, formData, {
        ...this.requestConfig,
        headers: {
          ...this.requestConfig.headers,
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
        }
      })
      .then(response => response.data.id);
  }
}
