import axios from 'axios';
import ReportPortalClient from '../src/';
import { IPostItemRequest, IFinishTestRequest } from '../src/models';
import { Status } from 'cucumber';

jest.mock('axios');
jest.useFakeTimers();

describe('ReportPortalClient', () => {
  const mockAxios = axios as jest.Mocked<typeof axios>;
  const expectedBaseUrl = 'https://some.url';
  const expectedAuthToken = 'b870f8e2-c647-4f84-accb-38865d977ead';
  const expectedTestItemId = 'ImportantTestId';
  const expectedLaunchId = 'SomeLaunchId';
  const mockTimestamp = 1487076708000;

  const expectedRequestConfig = {
    headers: {
      Authorization: expectedAuthToken
    }
  };

  beforeEach(() => jest
    .spyOn(Date, 'now')
    .mockReturnValue(mockTimestamp));

  describe('createItem', () => {
    it('should send a request to create a root test item', async () => {
      const expectedPostTestItemRequest: IPostItemRequest = {
        description: 'Some important test',
        launch_id: expectedLaunchId,
        name: 'ImportantTest',
        parameters: [],
        retry: false,
        start_time: mockTimestamp,
        tags: [],
        type: 'TEST',
      };

      mockAxios.post.mockResolvedValue({ data: { id: expectedTestItemId } });

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      const actualTestItemId = await sut.createItem(
        expectedPostTestItemRequest.name, expectedPostTestItemRequest.description, expectedPostTestItemRequest.type);

      expect(mockAxios.post).toHaveBeenCalledWith(
        `${expectedBaseUrl}/item`, expectedPostTestItemRequest, expectedRequestConfig);

      expect(actualTestItemId).toEqual(expectedTestItemId);
    });

    it('should send a request to create a test step', async () => {
      const expectedPostTestItemRequest: IPostItemRequest = {
        description: 'Some important step',
        launch_id: expectedLaunchId,
        name: 'ImportantTest',
        parameters: [],
        retry: false,
        start_time: mockTimestamp,
        tags: [],
        type: 'STEP',
      };

      mockAxios.post.mockResolvedValue({ data: { id: expectedTestItemId } });

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      const actualTestItemId = await sut.createItem(
        expectedPostTestItemRequest.name, expectedPostTestItemRequest.description, expectedPostTestItemRequest.type);

      expect(mockAxios.post).toHaveBeenCalledWith(
        `${expectedBaseUrl}/item`, expectedPostTestItemRequest, expectedRequestConfig);

      expect(actualTestItemId).toEqual(expectedTestItemId);
    });
  });

  describe('finishItem', () => {
    it('should update the test of the given ID to be passed if the cucumber status is PASSED', () => {
      const expectedFinishTestRequest: IFinishTestRequest = {
        end_time: mockTimestamp,
        status: 'PASSED',
        tags: []
      };

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      sut.finishItem(expectedTestItemId, Status.PASSED);

      expect(mockAxios.put).toHaveBeenCalledWith(
        `${expectedBaseUrl}/item/${expectedTestItemId}`, expectedFinishTestRequest, expectedRequestConfig);
    });

    it('should update the test of the given ID to be failed if the cucumber status is FAILED', () => {
      const expectedFinishTestRequest: IFinishTestRequest = {
        end_time: mockTimestamp,
        status: 'FAILED',
        tags: []
      };

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      sut.finishItem(expectedTestItemId, Status.FAILED);

      expect(mockAxios.put).toHaveBeenCalledWith(
        `${expectedBaseUrl}/item/${expectedTestItemId}`, expectedFinishTestRequest, expectedRequestConfig);
    });

    it('should update the test of the given ID to be skipped if the cucumber status is SKIPPED', () => {
      const expectedFinishTestRequest: IFinishTestRequest = {
        end_time: mockTimestamp,
        status: 'SKIPPED',
        tags: []
      };

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      sut.finishItem(expectedTestItemId, Status.SKIPPED);

      expect(mockAxios.put).toHaveBeenCalledWith(
        `${expectedBaseUrl}/item/${expectedTestItemId}`, expectedFinishTestRequest, expectedRequestConfig);
    });

    it('should update the test of the given ID to be failed if the cucumber status is PENDING', () => {
      const expectedFinishTestRequest: IFinishTestRequest = {
        end_time: mockTimestamp,
        status: 'FAILED',
        tags: []
      };

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      sut.finishItem(expectedTestItemId, Status.PENDING);

      expect(mockAxios.put).toHaveBeenCalledWith(
        `${expectedBaseUrl}/item/${expectedTestItemId}`, expectedFinishTestRequest, expectedRequestConfig);
    });

    it('should update the test of the given ID to be failed if the cucumber status is UNDEFINED', () => {
      const expectedFinishTestRequest: IFinishTestRequest = {
        end_time: mockTimestamp,
        status: 'FAILED',
        tags: []
      };

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      sut.finishItem(expectedTestItemId, Status.UNDEFINED);

      expect(mockAxios.put).toHaveBeenCalledWith(
        `${expectedBaseUrl}/item/${expectedTestItemId}`, expectedFinishTestRequest, expectedRequestConfig);
    });

    it('should update the test of the given ID to be failed if the cucumber status is AMBIGUOUS', () => {
      const expectedFinishTestRequest: IFinishTestRequest = {
        end_time: mockTimestamp,
        status: 'FAILED',
        tags: []
      };

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      sut.finishItem(expectedTestItemId, Status.AMBIGUOUS);

      expect(mockAxios.put).toHaveBeenCalledWith(
        `${expectedBaseUrl}/item/${expectedTestItemId}`, expectedFinishTestRequest, expectedRequestConfig);
    });

    it('should update the test of the given ID to be failed if the cucumber status is anything else', () => {
      const expectedFinishTestRequest: IFinishTestRequest = {
        end_time: mockTimestamp,
        status: 'FAILED',
        tags: []
      };

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      sut.finishItem(expectedTestItemId, 'NOTASTATUS' as Status);

      expect(mockAxios.put).toHaveBeenCalledWith(
        `${expectedBaseUrl}/item/${expectedTestItemId}`, expectedFinishTestRequest, expectedRequestConfig);
    });
  });
});
