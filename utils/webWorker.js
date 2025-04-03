import { defaultFrameFetchBatchSize, createId } from "./utils";
import { getFrame } from './requests';

let frameDataStore={};
let bufferedFramesSet = new Set();
let globalCurrentTaskType;
let globalTaskId;

async function processChunk(frames, taskId) {
    return Promise.all(
        frames.map(async (frameNum) => {
            if (globalTaskId && taskId === globalTaskId) {
                const res = await getFrame(frameNum);
                return { frameNum, data: res, error: res['error']?'error':null};
            };
            return { frameNum, data: null, error: 'cancel' };
        })
    );
}

async function retrieveFramesInChunks(taskId, type, currentFrame, fps, totalFrameNumber, frameBufferSeconds) {
    const endFrame = Math.min(totalFrameNumber-1, currentFrame + Math.ceil(fps * frameBufferSeconds));
    const framesToRetrieve = Array.from({ length: endFrame-currentFrame+1 }, (_, i) => {
        const frameNum = currentFrame + i;
        if (!bufferedFramesSet.has(frameNum)) {
            return frameNum; 
        }
        return null;
    }).filter(x => x !== null);
    
    for (let i = 0; i < framesToRetrieve.length; i += defaultFrameFetchBatchSize) {
        const chunk = framesToRetrieve.slice(i, i + defaultFrameFetchBatchSize);
        if (globalTaskId && taskId !== globalTaskId) {
            self.postMessage({
                type: `cancel-${type}`,
                startFrame: currentFrame,
                currentTaskType: globalCurrentTaskType, 
            });
            return;
        }
        const results = await processChunk(chunk, taskId);
        results.forEach(({ frameNum, data, error }) => {
            if  (!error) {
                frameDataStore[frameNum] = error ? 'error' : data;
                bufferedFramesSet.add(frameNum);
            }
            
        });
    }

    const startFrame = Math.max(0, currentFrame - Math.ceil(fps * frameBufferSeconds));
    const framesToKeep = Array.from({ length: endFrame-startFrame+1 }, (_, i) => startFrame + i);
    const framesToKeepSet = new Set(framesToKeep);
    
    let minFrame;
    Array.from(bufferedFramesSet).forEach((frameNum) => {
        if (!framesToKeepSet.has(frameNum)) {
            bufferedFramesSet.delete(frameNum);
        } else {
            if (!Number.isInteger(minFrame) || frameNum < minFrame) {
                minFrame = frameNum;
            }
        }
    });
    
    self.postMessage({
        type: type,
        startFrame: minFrame,
        endFrame: endFrame,
        frameNum: currentFrame,
        frameData: {...frameDataStore},
        bufferedFrames: Array.from(bufferedFramesSet)
    }
    );
    frameDataStore = {};
}


self.onmessage = async (e) => {
    const { type, currentFrame, fps, totalFrameNumber, frameBufferSeconds } = e.data;
    const taskId = createId();
    if (type !== 'reset') {
        globalCurrentTaskType = type;
        globalTaskId = taskId;
    }
    console.log('worker receive msg', type, currentFrame);
    switch (type) {
        case 'fetch':
        case 'continueFetch':
            try {
                await retrieveFramesInChunks(taskId, type, currentFrame, fps, totalFrameNumber, frameBufferSeconds);
            } catch (error) {
                self.postMessage({ 
                    type: 'error', 
                    error: error.message 
                });
            }
            break;
        case 'reset':
            frameDataStore = {};
            bufferedFramesSet = new Set();
            break;
    }
};