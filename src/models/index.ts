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

export type LogLevel = 'error'
  | 'warn'
  | 'info'
  | 'debug'
  | 'trace'
  | 'fatal'
  | 'unknown';

export type ICreateLogRequest = ICreateLogRequestBody[];

export interface ICreateLogRequestBody {
  file?: {
    name: string
  };
  item_id: string;
  level: LogLevel;
  message: string;
  time: string | number;
}

export interface INamedFileBuffer {
  buffer: Buffer;
  filename: string;
}

export type LaunchMode = 'DEFAULT' | 'DEBUG';

export interface IStartLaunchRequest {
  description?: string;
  mode?: LaunchMode;
  name: string;
  start_time: string | number;
  tags?: string[];
}

export interface IFinishLaunchRequest {
  description?: string;
  end_time: string | number;
  status?: ReportPortalTestStatus;
  tags?: string[];
}
