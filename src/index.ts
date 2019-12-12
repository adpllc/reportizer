import axios, { AxiosRequestConfig } from 'axios';
import { Status as CucumberStatus } from 'cucumber';
import { IFinishTestRequest, IPostItemRequest, IReportPortalPostResponse, ItemType, ReportPortalTestStatus } from './models';

export default class ReportPortalClient {
  private readonly statusMap: Map<CucumberStatus, ReportPortalTestStatus> = new Map([
    [CucumberStatus.PASSED, 'PASSED'],
    [CucumberStatus.FAILED, 'FAILED'],
    [CucumberStatus.SKIPPED, 'SKIPPED'],
    [CucumberStatus.PENDING, 'FAILED'],
    [CucumberStatus.UNDEFINED, 'FAILED'],
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

  public createItem(testName: string, testDescription: string, testItemType: ItemType) {
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

    return axios.post<IReportPortalPostResponse>(`${this.baseUrl}/item`, request, this.requestConfig)
      .then(response => response.data.id);
  }

  public async finishItem(itemId: string, status: CucumberStatus) {
    const request: IFinishTestRequest = {
      end_time: Date.now(),
      status: this.statusMap.get(status) || 'FAILED',
      tags: [],
    };

    await axios.put(`${this.baseUrl}/item/${itemId}`, request, this.requestConfig);
  }
}
