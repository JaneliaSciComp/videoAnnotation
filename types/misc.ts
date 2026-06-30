import { UploadFile } from 'antd';

export type IntervalErasingValues = {
    on: boolean,
    startFrame: number | null,
    videoID: string | null,
    labels: string[]
}

export type UploaderType = 'annotation' | 'configuration';

export type UploadFileType = {
  uploadType: UploaderType,
  file: UploadFile,
}
