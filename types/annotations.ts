
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
    data?: Record <string, unknown>,
    frameNum: number,
    groupIndex?: string,
    id: string,
    isCrowd?: boolean,
    label?: string,
    paths?: string,
    type: string,
    videoId: string
};

// These 2 are the same; consolidate and remove from AppContext
export type FrameAnnotation = {
    [id: string]: Annotation;
}

export type AnnotationObject = {
    [key: string]: Annotation;
};

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
        paths: any, // Todo
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
    paths?: any[]; // For brush type
    skeletonName?: string; // For skeleton type
    edgeData?: any; // For skeleton type
    groupIndex?: number; // Reference to button configuration
  }
*/

