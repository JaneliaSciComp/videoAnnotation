
export type AnnotationData = {
    frameNum: number;
    label: string;
    [key: string]: any;
};

/*
export type Annotation = {
    frameNum: number;
    label: string;
    type: string;
    data: Record<string, unknown>;
};
*/

export type Annotation = {
    color: string,
    data: Record <string, unknown> | null,
    frameNum: number,
    groupIndex: null,
    id: string,
    isCrowd: boolean | null,
    label: string | null,
    pathes: string | null,
    type: string,
    videoId: string
} | null | undefined;

   /*
    //Todo: include in types/annotations.ts?  Similar but different.
    type Annotation = {
        color: string,
        data: string | null,
        frameNum: number,
        groupIndex: any, // Todo
        id: string,
        isCrowd: boolean | null,
        label: string,
        pathes: any, // Todo
        type: string,
        videoID: string
    }
        */

    /*
  type AnnotationFromClaude = {
    id: string;
    videoId: string;
    frameNum: number;
    label: string;
    color: string;
    type: 'category' | 'skeleton' | 'polygon' | 'keyPoint' | 'bbox' | 'brush';
    // Additional properties based on type:
    data?: any[]; // For skeleton (landmarks), polygon, keyPoint, bbox coordinates
    pathes?: any[]; // For brush type
    skeletonName?: string; // For skeleton type
    edgeData?: any; // For skeleton type
    groupIndex?: number; // Reference to button configuration
  }
*/

export type AnnotationObject = {
    [key: string]: Annotation;
};