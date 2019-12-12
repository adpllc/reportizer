export type ItemType = 'SUITE'
  | 'STORY'
  | 'TEST'
  | 'SCENARIO'
  | 'STEP'
  | 'BEFORE_CLASS'
  | 'BEFORE_GROUPS'
  | 'BEFORE_METHOD'
  | 'BEFORE_SUITE'
  | 'BEFORE_TEST'
  | 'AFTER_CLASS'
  | 'AFTER_GROUPS'
  | 'AFTER_METHOD'
  | 'AFTER_SUITE'
  | 'AFTER_TEST';

export interface IPostItemRequest {
  description: string;
  launch_id: string;
  name: string;
  parameters: string[];
  retry: boolean;
  start_time: string | number;
  tags: string[];
  type: ItemType;
  uniqueId?: string;
}

export interface IReportPortalPostResponse {
  id: string;
}

export type ReportPortalTestStatus = 'PASSED'
  | 'FAILED'
  | 'STOPPED'
  | 'SKIPPED'
  | 'RESETED'
  | 'CANCELLED';

export interface IFinishTestRequest {
  end_time: number | string;
  status?: ReportPortalTestStatus;
  tags: string[];
}
