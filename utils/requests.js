const PROJECTS_URL = "http://localhost:8000/api/projects";
const PROJECT_URL = "http://localhost:8000/api/project";
const BTN_URL = "http://localhost:8000/api/btn";
const BTNS_URL = "http://localhost:8000/api/btns";
const VIDEO_URL = "http://localhost:8000/api/video";
const VIDEOS_URL = "http://localhost:8000/api/videos";
const FRAME_URL_ROOT = 'http://localhost:8000/api/frame';
const ADDITIONAL_URL_ROOT = 'http://localhost:8000/api/additionaldata';
const ADDITIONAL_NAMES_URL = 'http://localhost:8000/api/additionaldataname';
const VIDEO_META_URL = "http://localhost:8000/api/videometa";
const SINGLE_ANNOTATION_URL = "http://localhost:8000/api/annotation";
const FRAME_ANNOTATION_URL = "http://localhost:8000/api/frameannotation";
const PROJECT_ANNOTATION_URL = "http://localhost:8000/api/projectannotation";
const ANNOTATION_FOR_CHART_URL = "http://localhost:8000/api/annotationforchart";
const CATEGORY_ANNOTATION_URL = "http://localhost:8000/api/categoryannotation";


export async function postProject(projectInfoObj) {
    const res = await fetch(PROJECT_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(projectInfoObj), 
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'POST project request failed'}
    }
}

export async function editProject(projectInfoObj) {
    const res = await fetch(PROJECT_URL, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(projectInfoObj), 
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'PUT project request failed'}
    }
}

export async function getAllProjects() {
    const res = await fetch(PROJECTS_URL, {
            method: 'GET',
    })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'GET all projects request failed'}
    }
}


export async function getProject(id) {
    const res = await fetch(`${PROJECT_URL}?id=${id}`, {
            method: 'GET',
    })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'GET project request failed'}
    }
}

export async function deleteProject(id) {
    const res = await fetch(`${PROJECT_URL}?id=${id}`, {
            method: 'DELETE',
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'DELETE project request failed'}
    }
}


export async function postBtnGroup(btnGroupObj) {
    const res = await fetch(BTN_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(btnGroupObj), 
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'POST btn group request failed'}
    }
}

export async function deleteBtnGroup(btnGroupId) {
    const res = await fetch(`${BTN_URL}?btnGroupId=${btnGroupId}`, {
            method: 'DELETE',
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'DELETE btn group request failed'}
    }
}

export async function getProjectBtn(projectId) {
    const res = await fetch(`${BTNS_URL}?projectId=${projectId}`, {
            method: 'GET',
    })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'GET project btn configuration data request failed'}
    }
}

export async function deleteProjectBtn(projectId) {
    const res = await fetch(`${BTNS_URL}?projectId=${projectId}`, {
            method: 'DELETE',
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'DELETE project btn request failed'}
    }
}

export async function postProjectBtn(data) { 
    /**
     * data: {
            btnGroups: [btnGroup1, btnGroup2, ...],
            projectId: str
        } 
     *  */ 
    const res = await fetch(BTNS_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(data),  
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'POST project btn request failed'}
    }
}


export async function postVideo(videoInfoObj) {
    const res = await fetch(VIDEO_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(videoInfoObj), 
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'POST video request failed'}
    }
}


export async function editVideo(videoInfoObj) {
    const res = await fetch(VIDEO_URL, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(videoInfoObj), 
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'PUT video request failed'}
    }
}

export async function deleteVideo(videoId) {
    const res = await fetch(`${VIDEO_URL}?id=${videoId}`, {
            method: 'DELETE',
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'DELETE video request failed'}
    }
}

export async function getProjectVideo(projectId) {
    const res = await fetch(`${VIDEOS_URL}?projectId=${projectId}`, {
            method: 'GET',
    })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'GET project video data request failed'}
    }
}

export async function deleteProjectVideo(projectId) {
    const res = await fetch(`${VIDEOS_URL}?projectId=${projectId}`, {
            method: 'DELETE',
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'DELETE project video request failed'}
    }
}

export async function postProjectVideo(data) { 
    /**
     * data: {
            videos: [video1, video2, ...],
            projectId: str
        } 
     */
    
    const res = await fetch(VIDEOS_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(data),  
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'POST project videos request failed'}
    }
}


export async function getVideoMeta(videoId) {
    const res = await fetch(`${VIDEO_META_URL}?id=${videoId}`, {
            method: 'GET',
    })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'GET video meta request failed'}
    }
}

export async function getFrame(frameNum) {
    const res = await fetch(`${FRAME_URL_ROOT}?num=${frameNum}`, {
        method: 'GET',
    })
    // .then(res => {
    //     if (res.ok) {
    //         console.log('res.ok');
    //         return res.blob();
    //     } else {
    //         console.log('res.ok false');
    //         // console.log(res);
    //         setFrameError('Frame request failed');
    //     }
    // }).then((res)=>{
    //     if (res){
    //         if (res['error']) {
    //             setFrameError(res['error']);
    //         } else {
    //             const url = URL.createObjectURL(res);
    //             // props.setFrameUrl(url);
    //             // props.setFrameNum(frameNum);
    //             setFrameUrl(url);
    //             setFrameNum(frameNum);
    //         } 
    //     } 
    // })
    if (res.ok) {
        const blob = await res.blob(); // .blob() is also async, it's reading data from the stream
        const url = URL.createObjectURL(blob);
        return url;
    } else {
        return {error: 'GET frame request failed'}
    }
}

export async function getAdditionalData(frameNum, fieldName, range) { //TODO: need videoId?
    const res = await fetch(`${ADDITIONAL_URL_ROOT}/${fieldName}/?frameNum=${frameNum}&range=${range}`, { //videoId=${videoId}&
        method: 'GET',
    })
    
    if (res.ok) {
        return await res.json()
    } else {
        return {error: `GET additional data ${fieldName} request failed`}
    }
}

export async function postAdditionalDataNameToRetrieve(videoId, additionalDataNameToRetrieve) {
    // additionalDataNameToRetrieve could be [], backend should clear data in memory
    const body = {
        videoId: videoId,
        names: additionalDataNameToRetrieve
    }
    const res = await fetch(ADDITIONAL_NAMES_URL, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(body), //new FormData(e.target), 
    })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'POST additional data name failed'}
    }
}


export async function postFrameAnnotation(annotationObjs) { //{annotations: [anno1, anno2, ...]}
    console.log('postFrameAnnotation', annotationObjs.annotations[0].frameNum);
    const res = await fetch(FRAME_ANNOTATION_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(annotationObjs), 
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'POST frame annotation request failed'}
    }
}

export async function getFrameAnnotation(frameNum, videoId) {
    const res = await fetch(`${FRAME_ANNOTATION_URL}?frameNum=${frameNum}&videoId=${videoId}`, {
            method: 'GET',
    })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'GET frame annotation request failed'}
    }
}

export async function postProjectAnnotation(data) { //{annotations: [anno1, anno2, ...]}
    /**
     * data: {
            annotations: [anno1, anno2, ...],
            projectId: str
            videos: [videoId1, videoId2, ...]
        } 
     */
    const res = await fetch(PROJECT_ANNOTATION_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(data),  
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'POST project annotation request failed'}
    }
}

export async function getProjectAnnotation(projectId) {
    const res = await fetch(`${PROJECT_ANNOTATION_URL}?projectId=${projectId}`, {
            method: 'GET',
    })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'GET project annotation request failed'}
    }
}

export async function postAnnotation(annotationObj) { 
    const res = await fetch(SINGLE_ANNOTATION_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(annotationObj), 
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'POST single annotation request failed'}
    }
}

export async function deleteAnnotation(id) {
    const res = await fetch(`${SINGLE_ANNOTATION_URL}?id=${id}`, {
            method: 'DELETE',
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'DELETE single annnotation request failed'}
    }
}

export async function getAnnotationForChart(videoId, frameNum, labelList, range) {
    const res = await fetch(`${ANNOTATION_FOR_CHART_URL}?videoId=${videoId}&frameNum=${frameNum}&labels=${labelList.join('@@')}&range=${range}`, {
            method: 'GET',
    })
    
    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'GET annotationForChart request failed'}
    }
}

export async function deleteProjectAnnotation(projectId) {
    const res = await fetch(`${PROJECT_ANNOTATION_URL}?projectId=${projectId}`, {
            method: 'DELETE',
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'DELETE project annotation request failed'}
    }
}


export async function deleteCategoryAnnotationInterval(videoId, labels, range) {
    /**
     *  labels: [label1, label2, ...]
     *  range: [startFrame, endFrame]
     */
    const res = await fetch(`${CATEGORY_ANNOTATION_URL}?videoId=${videoId}&labels=${labels.join('@@')}&startFrame=${range[0]}&endFrame=${range[1]}`, {
            method: 'DELETE',
        })

    if (res.ok) {
        return await res.json()
    } else {
        return {error: 'DELETE categoryAnnotationInterval request failed'}
    }
}