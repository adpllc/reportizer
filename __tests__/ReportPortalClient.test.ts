import axios from 'axios';
import { Status } from 'cucumber';
import FormData from 'form-data';
import ReportPortalClient from '../src/';
import { ICreateLogRequest, IFinishTestRequest, INamedFileBuffer, IPostItemRequest } from '../src/models';

jest.mock('axios');
jest.useFakeTimers();

describe('ReportPortalClient', () => {
  const mockAxios = axios as jest.Mocked<typeof axios>;
  const expectedBaseUrl = 'https://some.url';
  const expectedAuthToken = 'b870f8e2-c647-4f84-accb-38865d977ead';
  const expectedTestItemId = 'ImportantTestId';
  const expectedLogItemId = 'ImportantLogId';
  const expectedLaunchId = 'SomeLaunchId';
  const mockTimestamp = 1487076708000;

  const expectedRequestConfig = {
    headers: {
      Authorization: `Bearer ${expectedAuthToken}`
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
        expectedPostTestItemRequest.name,
        expectedPostTestItemRequest.description,
        expectedPostTestItemRequest.type);

      expect(mockAxios.post).toHaveBeenCalledWith(
        `${expectedBaseUrl}/item`, expectedPostTestItemRequest, expectedRequestConfig);

      expect(actualTestItemId).toEqual(expectedTestItemId);
    });

    it('should send a request to create a child test item', async () => {
      const expectedParentItem = 'ParentItem';
      const expectedPostTestItemRequest: IPostItemRequest = {
        description: 'Some important test',
        launch_id: expectedLaunchId,
        name: 'ImportantTest',
        parameters: [],
        retry: false,
        start_time: mockTimestamp,
        tags: [],
        type: 'TEST'
      };

      mockAxios.post.mockResolvedValue({ data: { id: expectedTestItemId } });

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      const actualTestItemId = await sut.createItem(
        expectedPostTestItemRequest.name,
        expectedPostTestItemRequest.description,
        expectedPostTestItemRequest.type,
        expectedParentItem);

      expect(mockAxios.post).toHaveBeenCalledWith(
        `${expectedBaseUrl}/item/${expectedParentItem}`,
        expectedPostTestItemRequest,
        expectedRequestConfig);

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
    it('should update the test of the given ID to be passed if the cucumber status is PASSED', async () => {
      const expectedFinishTestRequest: IFinishTestRequest = {
        end_time: mockTimestamp,
        status: 'PASSED',
        tags: []
      };

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      await sut.finishItem(expectedTestItemId, Status.PASSED);

      expect(mockAxios.put).toHaveBeenCalledWith(
        `${expectedBaseUrl}/item/${expectedTestItemId}`, expectedFinishTestRequest, expectedRequestConfig);
    });

    it('should update the test of the given ID to be failed if the cucumber status is FAILED', async () => {
      const expectedFinishTestRequest: IFinishTestRequest = {
        end_time: mockTimestamp,
        status: 'FAILED',
        tags: []
      };

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      await sut.finishItem(expectedTestItemId, Status.FAILED);

      expect(mockAxios.put).toHaveBeenCalledWith(
        `${expectedBaseUrl}/item/${expectedTestItemId}`, expectedFinishTestRequest, expectedRequestConfig);
    });

    it('should update the test of the given ID to be skipped if the cucumber status is SKIPPED', async () => {
      const expectedFinishTestRequest: IFinishTestRequest = {
        end_time: mockTimestamp,
        status: 'SKIPPED',
        tags: []
      };

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      await sut.finishItem(expectedTestItemId, Status.SKIPPED);

      expect(mockAxios.put).toHaveBeenCalledWith(
        `${expectedBaseUrl}/item/${expectedTestItemId}`, expectedFinishTestRequest, expectedRequestConfig);
    });

    it('should update the test of the given ID to be failed if the cucumber status is PENDING', async () => {
      const expectedFinishTestRequest: IFinishTestRequest = {
        end_time: mockTimestamp,
        status: 'FAILED',
        tags: []
      };

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      await sut.finishItem(expectedTestItemId, Status.PENDING);

      expect(mockAxios.put).toHaveBeenCalledWith(
        `${expectedBaseUrl}/item/${expectedTestItemId}`, expectedFinishTestRequest, expectedRequestConfig);
    });

    it('should update the test of the given ID to have no status if the cucumber status is UNDEFINED', async () => {
      const expectedFinishTestRequest: IFinishTestRequest = {
        end_time: mockTimestamp,
        tags: []
      };

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      await sut.finishItem(expectedTestItemId, Status.UNDEFINED);

      expect(mockAxios.put).toHaveBeenCalledWith(
        `${expectedBaseUrl}/item/${expectedTestItemId}`, expectedFinishTestRequest, expectedRequestConfig);
    });

    it('should update the test of the given ID to be failed if the cucumber status is AMBIGUOUS', async () => {
      const expectedFinishTestRequest: IFinishTestRequest = {
        end_time: mockTimestamp,
        status: 'FAILED',
        tags: []
      };

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      await sut.finishItem(expectedTestItemId, Status.AMBIGUOUS);

      expect(mockAxios.put).toHaveBeenCalledWith(
        `${expectedBaseUrl}/item/${expectedTestItemId}`, expectedFinishTestRequest, expectedRequestConfig);
    });
  });

  describe('addLogToItem', () => {
    it('should create a log against a test item', async () => {
      const expectedLogRequest: ICreateLogRequest = {
        item_id: 'thisIsAnItemId',
        level: 'info',
        message: 'hello, this is a log message',
        time: mockTimestamp,
      };

      const expectedFormData = new FormData();

      expectedFormData.append(
        'json_request_part',
        JSON.stringify(expectedLogRequest),
      );

      mockAxios.post.mockResolvedValue({ data: { id: expectedLogItemId } });

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      const actualLogItemId = await sut.addLogToItem(
        expectedLogRequest.item_id,
        expectedLogRequest.level,
        expectedLogRequest.message
      );

      expect(mockAxios.post).toHaveBeenCalledWith(
        `${expectedBaseUrl}/log`, expect.any(FormData), expectedRequestConfig);

      const actualFormData: FormData = mockAxios.post.mock.calls[0][1];

      const actualFormDataSplitByBoundary = splitFormDataByItsUniqueBoundary(actualFormData);
      const expectedFormDataSplitByBoundary = splitFormDataByItsUniqueBoundary(expectedFormData);

      expect(actualFormDataSplitByBoundary).toEqual(expectedFormDataSplitByBoundary);

      expect(actualLogItemId).toBe(expectedLogItemId);
    });

    it('should create a log with a file against a test item', async () => {
      const expectedLogRequest: ICreateLogRequest = {
        item_id: 'thisIsAnItemId',
        level: 'info',
        message: 'hello, this is a log message',
        time: mockTimestamp,
      };

      const expectedFormData = new FormData();
      const expectedImageBuffer = Buffer.from('This is an image, I swear.');
      const expectedNamedFileBuffer: INamedFileBuffer = {
        buffer: expectedImageBuffer,
        filename: 'screenshot.png',
      };

      expectedFormData.append(
        'json_request_part',
        JSON.stringify(expectedLogRequest),
      );
      expectedFormData.append(
        'file',
        expectedNamedFileBuffer.buffer,
        expectedNamedFileBuffer.filename,
      );

      mockAxios.post.mockResolvedValue({ data: { id: expectedLogItemId } });

      const sut = new ReportPortalClient(expectedBaseUrl, expectedLaunchId, expectedAuthToken);

      const actualLogItemId = await sut.addLogToItem(
        expectedLogRequest.item_id,
        expectedLogRequest.level,
        expectedLogRequest.message,
        expectedNamedFileBuffer,
      );

      expect(mockAxios.post).toHaveBeenCalledWith(
        `${expectedBaseUrl}/log`, expect.any(FormData), expectedRequestConfig);

      const actualFormData: FormData = mockAxios.post.mock.calls[0][1];

      const actualFormDataSplitByBoundary = splitFormDataByItsUniqueBoundary(actualFormData);
      const expectedFormDataSplitByBoundary = splitFormDataByItsUniqueBoundary(expectedFormData);

      expect(actualFormDataSplitByBoundary).toEqual(expectedFormDataSplitByBoundary);

      expect(actualLogItemId).toBe(expectedLogItemId);
    });
  });
});

function splitFormDataByItsUniqueBoundary(formData: FormData) {
  return formData
    .getBuffer()
    .toString()
    .split(formData.getBoundary());
}
