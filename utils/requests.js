const VIDEO_URL = "http://localhost:8000/api/video";
const FRAME_URL_ROOT = 'http://localhost:8000/api/frame';
const ADDITIONAL_URL_ROOT = 'http://localhost:8000/api/additional-data';


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
        return {error: 'POST request failed'}
    }
}

export async function getVideo(videoId) {
    const res = await fetch(`${VIDEO_URL}?id=${videoId}`, {
            method: 'GET',
    })

    if (res.ok) {
        return res.json()
    } else {
        return {error: 'GET request failed'}
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
        return {error: 'PUT request failed'}
    }
}

export async function deleteVideo(videoId) {
    const res = await fetch(`${VIDEO_URL}?id=${videoId}`, {
            method: 'DELETE',
        })

    if (res.ok) {
        return res.json()
    } else {
        return {error: 'DELETE request failed'}
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
        return {error: 'Frame request failed'}
    }
}

export async function getAdditionalData(frameNum, videoId, fieldName) {
    const res = await fetch(`${ADDITIONAL_URL_ROOT}/${fieldName}/?videoId=${videoId}&num=${frameNum}`, {
        method: 'GET',
    })
    
    if (res.ok) {
        return res.json()
    } else {
        return {error: 'Additional data request failed'}
    }
}