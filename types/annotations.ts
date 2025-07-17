
export type AnnotationData = {
    frameNum: number;
    label: string;
    [key: string]: any;
};

export type Annotation = {
    frameNum: number;
    label: string;
    type: string;
    data: Record<string, unknown>;
};

export type AnnotationObject = {
    [key: string]: Annotation;
};