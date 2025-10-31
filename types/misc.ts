import { UploadFile } from 'antd';

export type IntervalErasingValues = {
    on: boolean,
    startFrame: number | null,
    videoID: string | null,
    labels: string[]
}

export type UploaderType = {
  type: string,
  file: UploadFile<any>,
}