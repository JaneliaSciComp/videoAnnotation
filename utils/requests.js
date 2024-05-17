const PROJECTS_URL = "http://localhost:8000/api/projects";
const PROJECT_URL = "http://localhost:8000/api/project";
const BTN_URL = "http://localhost:8000/api/btn";
const VIDEO_URL = "http://localhost:8000/api/video";
const FRAME_URL_ROOT = 'http://localhost:8000/api/frame';
const ADDITIONAL_URL_ROOT = 'http://localhost:8000/api/additional-data';
const VIDEO_META_URL = "http://localhost:8000/api/videometa";

export async function postProject(projectInfoObj) {
    const res = await fetch(PROJECT_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(projectInfoObj), //new FormData(e.target), 
        })

    if (res.ok) {
        return res.json()
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
            body: JSON.stringify(projectInfoObj), //new FormData(e.target), 
        })

    if (res.ok) {
        return res.json()
    } else {
        return {error: 'PUT project request failed'}
    }
}

export async function getAllProjects() {
    const res = await fetch(PROJECTS_URL, {
            method: 'GET',
    })

    if (res.ok) {
        return res.json()
    } else {
        return {error: 'GET all projects request failed'}
    }
}

//getProject, getBtnConfig
export async function getProject(id) {
    const res = await fetch(`${PROJECT_URL}?id=${id}`, {
            method: 'GET',
    })

    if (res.ok) {
        return res.json()
    } else {
        return {error: 'GET project request failed'}
    }
}


export async function postBtnGroup(btnGroupObj) {
    const res = await fetch(BTN_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(btnGroupObj), //new FormData(e.target), 
        })

    if (res.ok) {
        return res.json()
    } else {
        return {error: 'POST btn group request failed'}
    }
}

export async function deleteBtnGroup(btnGroupId) {
    const res = await fetch(`${BTN_URL}?btnGroupId=${btnGroupId}`, {
            method: 'DELETE',
        })

    if (res.ok) {
        return res.json()
    } else {
        return {error: 'DELETE btn group request failed'}
    }
}

export async function getProjectBtn(projectId) {
    const res = await fetch(`${BTN_URL}?projectId=${projectId}`, {
            method: 'GET',
    })

    if (res.ok) {
        return res.json()
    } else {
        return {error: 'GET project btn configuration data request failed'}
    }
}

export async function postVideo(videoInfoObj) {
    const res = await fetch(VIDEO_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(videoInfoObj), //new FormData(e.target), 
        })

    if (res.ok) {
        return res.json()
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
            body: JSON.stringify(videoInfoObj), //new FormData(e.target), 
        })

    if (res.ok) {
        return res.json()
    } else {
        return {error: 'PUT video request failed'}
    }
}

export async function deleteVideo(videoId) {
    const res = await fetch(`${VIDEO_URL}?id=${videoId}`, {
            method: 'DELETE',
        })

    if (res.ok) {
        return res.json()
    } else {
        return {error: 'DELETE video request failed'}
    }
}

export async function getProjectVideo(projectId) {
    const res = await fetch(`${VIDEO_URL}?projectId=${projectId}`, {
            method: 'GET',
    })

    if (res.ok) {
        return res.json()
    } else {
        return {error: 'GET project video data request failed'}
    }
}

export async function getVideoMeta(videoId) {
    const res = await fetch(`${VIDEO_META_URL}?id=${videoId}`, {
            method: 'GET',
    })

    if (res.ok) {
        return res.json()
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

export async function getAdditionalData(frameNum, videoId, fieldName) {
    const res = await fetch(`${ADDITIONAL_URL_ROOT}/${fieldName}/?videoId=${videoId}&num=${frameNum}`, {
        method: 'GET',
    })
    
    if (res.ok) {
        return res.json()
    } else {
        return {error: 'GET additional data request failed'}
    }
}