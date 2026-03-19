import { UploadFile } from 'antd';

export type IntervalErasingValues = {
    on: boolean,
    startFrame: number | null,
    videoID: string | null,
    labels: string[]
}

export type UploadFileType = {
  uploadType: string,
  file: UploadFile,
}