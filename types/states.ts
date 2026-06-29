import type { Annotation } from '@/types/annotations';

export type AdditionalDataRefType = Record<string, AdditionalData[]>;

type AdditionalData = {
    // Not sure what this is meant to look like
}

export type AdditionalDataForChartType = {
    range: [number, number],
    data: AdditionalData
}

export type ActiveAnnoObjType = {
  color?: string,
  data?: number[][],
  groupIndex?: string,
  frameNum: number,
  id: string,
  label: string,
  type: string,
  videoId: string
}

export type AnnoRefType = {
  [frameNum: number]: {
    [id: string]: Annotation
  }
}

type BtnChildData = IndividualBtnType[];

type IndividualBtnType = {
  btnType: string,
  color: string,
  index: number,
  label: string
}

// Rename to BtnsGroupType since this seems to be for button groups?
type BtnsType = {
  btnNum: number,
  btnType: string,
  edgeData?: {edges: (Set<number> | null)[] | (number[] | null) []}, // is null needed?
  groupType: string,
  groupIndex?: string,
  projectId: string
  childData: BtnChildData
}

export type BtnConfigDataType = {
  [key: string]: BtnsType
}

export type ColorsType = {
  [key: string]: string
}

export type FrameAnnotation = {
    [id: string]: Annotation;
}

export type IntervalAnno = {
    on: boolean, 
    startFrame: number | null, 
    videoId: string | null, 
    label: string | null, 
    color: string | null, 
    annotatedFrames: Set<string>
}

export type IntervalErasingItem = {
    on: boolean,
    startFrame: number | null,
    videoId: number | null,
    labels: string[],
}

/*
type BtnGroupType = {
  data: BtnGroupDataType;
  frameNum: number;
  frameUrl: string;
  addAnnotationObj: (obj: Annotation) => void;
  setActiveAnnoObj: (obj: Annotation | null) => void;
  drawType: string; // or union type
  setDrawType: (type: string) => void;
  skeletonLandmark: string | number | null;
  setSkeletonLandmark: (val: string | number | null) => void;
  frameAnnotation: Annotation | null; // Is there a difference between Annotation (eg, 1 anno) and frameAnnotation (all annos on a frame??)
}

type BtnGroupDataType = {

}
*/

export type VideoMetaRefType = {
  fps: number,
  totalFrameCount: number,
}