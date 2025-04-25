import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Video.module.css";
import { InputNumber, Slider } from "antd";
import { CaretRightOutlined, PauseOutlined } from "@ant-design/icons";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useStates, useStateSetters } from "./AppContext";
import {
  getFrame,
  postVideo,
  getVideoMeta,
  getAdditionalData,
  getVideoAnnotation,
} from "../utils/requests";
import { defaultFrameBufferSeconds } from "../utils/utils.js";

/**
 *
 * @param {*} props
 *      hideSubmit: boolean. Whether to hide video path submit part.
 *      onFrameChange: function. Callback function when frame changes. Takes one argument: e {frameNum: currentFrameNum}
 *      setFrameNum: number. Set the current frame number to this value when video is loaded. Will cause updates on related components, e.g. the canvas, the annotation chart, etc. It's equivalent as clicking on the video player's slider.
 *      frameBufferSeconds: number. It tells the web workder how many seconds of frames to retrieve from the backend.
//  *      frameFetchThreshold: number. If the remaining seconds of frames after the current frame in the buffer is less than this value (seconds) * fps, it will trigger the web worker to retrieve more frames.
 */
export default function VideoUploader(props) {
  const [fps, setFps] = useState(0);
  const [totalFrameCount, setTotalFrameCount] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [playFps, setPlayFps] = useState(0);
  const [submitError, setSubmitError] = useState();
  const [frameError, setFrameError] = useState();
  const playInterval = useRef(null);
  const [playControl, setPlayControl] = useState();
  const [worker, setWorker] = useState(null);
  const cachedFrameRangeRef = useRef([null, null]);
  const isContinueFetchingRef = useRef(false);
  const frameDataStoreRef = useRef({});
  const needToSetIntervalRef = useRef(false);
  const loadOneRequestedRef = useRef(false);

  const setFrameUrl = useStateSetters().setFrameUrl;
  const setFrameNum = useStateSetters().setFrameNum;
  const setVideoId = useStateSetters().setVideoId;
  const frameNumSignal = useStates().frameNumSignal;
  const loadVideo = useStates().loadVideo;
  const setLoadVideo = useStateSetters().setLoadVideo;
  const resetVideoPlay = useStates().resetVideoPlay;
  const setResetVideoPlay = useStateSetters().setResetVideoPlay;
  const videoData = useStates().videoData;
  const setVideoData = useStateSetters().setVideoData;
  const projectId = useStates().projectId;
  const additionalDataNameToRetrieve = useStates().additionalDataNameToRetrieve;
  const setAdditionalData = useStateSetters().setAdditionalData;
  const videoMetaRef = useStates().videoMetaRef;
  const setGlobalInfo = useStateSetters().setGlobalInfo;
  const annotationRef = useStates().annotationRef;
  const additionalDataRef = useStates().additionalDataRef;
  const realFpsRef = useStates().realFpsRef;
  const isFetchingFrame = useStates().isFetchingFrame;
  const setIsFetchingFrame = useStateSetters().setIsFetchingFrame;

  const frameBufferSeconds =
    props.frameBufferSeconds ?? defaultFrameBufferSeconds;

  useEffect(() => {
    if (!props.setFrameNum) return;
    if (
      Number.isInteger(props.setFrameNum) &&
      totalFrameCount &&
      props.setFrameNum >= 0 &&
      props.setFrameNum <= totalFrameCount - 1
    ) {
      setFrame(props.setFrameNum + 1);
    } else {
      // TODO: handle this case instead of throwing an error, log it to
      // an info panel or something similar.
      throw new Error(
        `Invalid frame number: ${props.setFrameNum}, or no video loaded`,
      );
    }
  }, [props.setFrameNum, totalFrameCount, setFrame]);

  useEffect(() => {
    const newWorker = new Worker(
      new URL("../utils/webWorker.js", import.meta.url),
    );
    newWorker.onmessage = workerMsgHandler;
    setWorker(newWorker);

    return () => newWorker.terminate();
  }, []);

  function workerMsgHandler(e) {
    const {
      type,
      frameNum,
      error,
      startFrame,
      endFrame,
      frameData,
      bufferedFrames,
      currentTaskType,
    } = e.data;
    console.log("worker response: ", currentTaskType, type, frameNum);
    setGlobalInfo(null);

    switch (type) {
      case "fetch":
        cachedFrameRangeRef.current = [startFrame, endFrame];
        frameDataStoreRef.current = mergeFrameData(frameData, bufferedFrames);
        setIsFetchingFrame(false);
        if (frameDataStoreRef.current[frameNum] === "error") {
          setFrameError(`Error retrieving frame ${frameNum}`);
        } else if (!loadOneRequestedRef.current) {
          setFrameUrl(frameDataStoreRef.current[frameNum]);
          setFrameNum(frameNum);
        } else if (loadOneRequestedRef.current) {
          loadOneRequestedRef.current = false;
        }
        break;
      case "continueFetch":
        cachedFrameRangeRef.current = [startFrame, endFrame];
        frameDataStoreRef.current = mergeFrameData(frameData, bufferedFrames);
        isContinueFetchingRef.current = false;
        break;
      case "error":
        setFrameError(error);
        break;
      case "cancel-fetch":
        if (currentTaskType !== "fetch") {
          setIsFetchingFrame(false);
        }
        break;
      case "cancel-continueFetch":
        if (currentTaskType !== "continueFetch") {
          isContinueFetchingRef.current = false;
        }
        break;
    }
  }

  function mergeFrameData(frameData, bufferedFramesArr) {
    const newFrameData = {};
    bufferedFramesArr.forEach((frameNumber) => {
      newFrameData[frameNumber] =
        frameData[frameNumber] ?? frameDataStoreRef.current[frameNumber];
    });
    return newFrameData;
  }

  useEffect(() => {
    if (!isFetchingFrame && needToSetIntervalRef.current) {
      needToSetIntervalRef.current = false;
      playInterval.current = setInterval(
        incrementFrame,
        Math.floor(1000 / playFps),
      );
      setPlayControl("play");
    }
  }, [isFetchingFrame]);

  useEffect(() => {
    if (resetVideoPlay) {
      resetVideoStatus();
      setResetVideoPlay(false);
    }
  }, [resetVideoPlay]);

  useEffect(() => {
    if (loadVideo) {
      resetVideoStatus();
      setVideoId(loadVideo.videoId);
      initializePlay(loadVideo);

      setLoadVideo(null);
    }
  }, [loadVideo]);

  useEffect(() => {
    if (frameNumSignal) {
      setFrame(frameNumSignal);
    }
  }, [frameNumSignal]);

  useEffect(() => {
    if (playInterval.current) {
      clearInterval(playInterval.current);
      playInterval.current = setInterval(
        incrementFrame,
        Math.floor(1000 / playFps),
      );
    }
  }, [playFps]);

  async function sliderChangeHandler(newValue) {
    if (
      newValue >= 1 &&
      newValue <= videoMetaRef.current["totalFrameCount"] - 1
    ) {
      setSliderValue(newValue);
      if (playControl !== "play") {
        await loadOne(newValue - 1);
      } else {
        const frameNeeded = newValue - 1;
        await pauseAndLoadOne(frameNeeded);
      }
    }
  }

  async function sliderChangeCompleteHandler(newValue) {
    retrieveFollowingFrames(newValue - 1);
  }

  async function inputNumberChangeHandler(newValue) {
    if (
      typeof newValue === "number" &&
      Number.isInteger(newValue) &&
      newValue >= 1 &&
      newValue <= videoMetaRef.current["totalFrameCount"] - 1
    ) {
      setSliderValue(newValue);
      const frameNeeded = newValue - 1;
      if (playControl !== "play") {
        await loadOne(frameNeeded);
      } else {
        await pauseAndLoadOne(frameNeeded);
      }
      retrieveFollowingFrames(frameNeeded);
    }
  }

  async function loadOne(frameNumber) {
    const totalCount = videoMetaRef.current["totalFrameCount"];
    if (frameNumber >= 0 && frameNumber <= totalCount - 1) {
      if (isFetchingFrame) {
        loadOneRequestedRef.current = true;
      }

      if (
        Number.isInteger(cachedFrameRangeRef.current[0]) &&
        Number.isInteger(cachedFrameRangeRef.current[1]) &&
        frameNumber >= cachedFrameRangeRef.current[0] &&
        frameNumber <= cachedFrameRangeRef.current[1] &&
        frameDataStoreRef.current[frameNumber]
      ) {
        if (frameDataStoreRef.current[frameNumber] === "error") {
          setFrameError(`Error retrieving frame ${frameNumber}`);
        } else {
          setFrameUrl(frameDataStoreRef.current[frameNumber]);
          setFrameNum(frameNumber);
        }
      } else {
        setFrameError(null);
        const res = await getFrame(frameNumber);
        if (res["error"]) {
          setFrameError(res["error"]);
        } else {
          setFrameUrl(res);
          setFrameNum(frameNumber);
        }
      }
    }
  }

  async function pauseAndLoadOne(frameNumber) {
    setPlayControl("pause");
    clearInterval(playInterval.current);
    playInterval.current = null;
    if (isFetchingFrame && needToSetIntervalRef.current) {
      needToSetIntervalRef.current = false;
    }

    await loadOne(frameNumber);
  }

  function retrieveFollowingFrames(frameNumber) {
    const totalCount = videoMetaRef.current["totalFrameCount"];
    const nextFrame = frameNumber + 1;
    if (nextFrame <= totalCount - 1) {
      if (worker) {
        worker.postMessage({
          type: "continueFetch",
          currentFrame: nextFrame,
          fps: videoMetaRef.current["fps"],
          totalFrameNumber: totalCount,
          frameBufferSeconds: frameBufferSeconds,
        });
        isContinueFetchingRef.current = true;
        setGlobalInfo("Fetching frames from server ...");
      }
    }
  }

  let currentSliderValue = sliderValue;
  async function incrementFrame() {
    let fpsMultiple;
    if (!realFpsRef.current || realFpsRef.current >= playFps) {
      fpsMultiple = 1;
    } else {
      fpsMultiple = Math.floor(playFps / realFpsRef.current);
    }
    currentSliderValue = currentSliderValue + fpsMultiple;

    let newFrameNum = currentSliderValue;
    if (newFrameNum <= totalFrameCount) {
      setFrame(newFrameNum);
    } else if (newFrameNum - totalFrameCount < fpsMultiple) {
      newFrameNum = totalFrameCount;
      setFrame(newFrameNum);
      currentSliderValue = newFrameNum;
    } else {
      if (playInterval.current) {
        clearInterval(playInterval.current);
        playInterval.current = null;
        setPlayControl(null);
        setSliderValue(0);
      }
    }
  }

  function playClickHandler() {
    if (
      !playInterval.current &&
      totalFrameCount > 0 &&
      playFps > 0 &&
      ((playControl !== "play" && sliderValue < totalFrameCount) ||
        (!playControl && sliderValue === totalFrameCount)) &&
      !isFetchingFrame
    ) {
      if (sliderValue === 0) {
        setFrame(1);
        needToSetIntervalRef.current = true;
        return;
      }
      playInterval.current = setInterval(
        incrementFrame,
        Math.floor(1000 / playFps),
      );
      setPlayControl("play");
    }

    if (playControl === "play" && playInterval.current) {
      setPlayControl("pause");
      clearInterval(playInterval.current);
      playInterval.current = null;
    } else if (
      playControl === "play" &&
      isFetchingFrame &&
      needToSetIntervalRef.current
    ) {
      setPlayControl("pause");
      needToSetIntervalRef.current = false;
    }
  }

  function playFpsInputChangeHandler(newValue) {
    if (
      typeof newValue === "number" &&
      Number.isInteger(newValue) &&
      newValue >= 0
    ) {
      setPlayFps(newValue);
    }
  }

  async function videoPathSubmitHandler(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!projectId) {
      setSubmitError("Please initialize or upload a project first.");
      return;
    }
    setSubmitError(null);
    const id = new Date().getTime().toString();

    const form = new FormData(e.target);
    const videoPath = form.get("videoPath");
    const video = {
      projectId: projectId,
      name: videoPath,
      path: videoPath,
      additionalFields: [],
    };

    video.videoId = id;
    await postAndLoadVideo(video);
  }

  async function postAndLoadVideo(videoInfo) {
    resetVideoStatus();
    const videoId = videoInfo.videoId;

    const res = await postVideo(videoInfo);
    if (res["error"]) {
      setSubmitError(res["error"]);
    } else {
      delete videoInfo["videoId"];
      const videoDataCopy = { ...videoData };
      videoDataCopy[videoId] = { ...videoInfo };
      setVideoData(videoDataCopy);
      setVideoId(videoId);
      videoInfo["videoId"] = videoId;
      await initializePlay(videoInfo);
    }
  }

  function setFrame(newValue) {
    if (newValue) {
      setSliderValue(newValue);
      if (newValue >= 1) {
        setFrameError(null);

        const frameNeeded = newValue - 1;
        if (worker) {
          if (
            Number.isInteger(cachedFrameRangeRef.current[0]) &&
            Number.isInteger(cachedFrameRangeRef.current[1]) &&
            frameNeeded >= cachedFrameRangeRef.current[0] &&
            frameNeeded <= cachedFrameRangeRef.current[1] &&
            frameDataStoreRef.current[frameNeeded]
          ) {
            if (frameDataStoreRef.current[frameNeeded] === "error") {
              setFrameError(`Error retrieving frame ${frameNeeded}`);
            } else {
              setFrameUrl(frameDataStoreRef.current[frameNeeded]);
              setFrameNum(frameNeeded);
            }

            if (
              !isContinueFetchingRef.current &&
              cachedFrameRangeRef.current[1] <
                videoMetaRef.current["totalFrameCount"] - 1
            ) {
              worker.postMessage({
                type: "continueFetch",
                currentFrame: frameNeeded,
                fps: videoMetaRef.current["fps"],
                totalFrameNumber: videoMetaRef.current["totalFrameCount"],
                frameBufferSeconds: frameBufferSeconds,
              });
              isContinueFetchingRef.current = true;
            }
          } else {
            if (!isFetchingFrame) {
              if (playInterval.current) {
                clearInterval(playInterval.current);
                playInterval.current = null;
                needToSetIntervalRef.current = true;
              }
              worker.postMessage({
                type: "fetch",
                currentFrame: frameNeeded,
                fps: videoMetaRef.current["fps"],
                totalFrameNumber: videoMetaRef.current["totalFrameCount"],
                frameBufferSeconds: frameBufferSeconds,
              });
              setIsFetchingFrame(true);
              setGlobalInfo("Fetching frames from server ...");
            }
          }
        }
      }
    } else {
      setFrameUrl(null);
    }

    if (props.onFrameChange) {
      const e = {
        frameNum: newValue >= 1 ? newValue - 1 : undefined,
      };
      props.onFrameChange(e);
    }
  }

  function resetVideoStatus() {
    setFps(0);
    setTotalFrameCount(0);
    setSliderValue(0);
    setPlayFps(0);
    setFrameError(null);
    setSubmitError(null);
    setFrame(null);
    setVideoId(null);
    setPlayControl(null);
    cachedFrameRangeRef.current = [];
    frameDataStoreRef.current = {};
    worker.postMessage({
      type: "reset",
    });
  }

  async function initializePlay(videoInfoObj) {
    videoMetaRef.current = {};
    const meta = await getVideoMeta(videoInfoObj.videoId);
    if (meta["error"]) {
      setSubmitError(meta["error"]);
    } else {
      if (meta["frame_count"] > 0) {
        setFps(meta["fps"]);
        setPlayFps(meta["fps"]);
        setTotalFrameCount(meta["frame_count"]);
        videoMetaRef.current = {
          fps: meta["fps"],
          totalFrameCount: meta["frame_count"],
        };
      } else {
        setFps(25);
        setPlayFps(25);
        setTotalFrameCount(10000);
        videoMetaRef.current = { fps: 25, totalFrameCount: 10000 };
      }

      setAdditionalData({});
      if (additionalDataNameToRetrieve?.length > 0) {
        const res = await getAdditionalData(
          videoInfoObj.videoId,
          additionalDataNameToRetrieve,
        );
        if (res["error"]) {
          setSubmitError(res["error"]);
        } else {
          additionalDataNameToRetrieve.forEach((name) => {
            additionalDataRef.current[name] = res[name];
          });
        }
      }
      await retrieveVideoAnnotations(videoInfoObj.videoId);
      setSliderValue(1);
      await loadOne(0);
      retrieveFollowingFrames(0);
    }
  }

  async function retrieveVideoAnnotations(videoId) {
    setGlobalInfo("Retrieving video annotation from database ...");
    const res = await getVideoAnnotation(videoId);
    setGlobalInfo(null);
    if (res["error"]) {
      setGlobalInfo(res);
    } else {
      const annotations = res.annotations;
      const newRef = {};
      annotations.forEach((anno) => {
        const frameNum = anno.frameNum;
        const id = anno.id;
        if (newRef[frameNum]) {
          newRef[frameNum][id] = anno;
        } else {
          newRef[frameNum] = { [id]: anno };
        }
      });
      annotationRef.current = newRef;
    }
  }

  return (
    <div className={styles.videoUploaderContainer}>
      <Row className={styles.videoPlayControlContainer}>
        <Col sm={3} className="px-0">
          <span className="me-1">FPS</span>
          <InputNumber
            className={styles.playFpsInput}
            min={totalFrameCount == 0 ? 0 : 1}
            value={playFps}
            onChange={playFpsInputChangeHandler}
            size="small"
          />
          <InputNumber
            className={styles.sliderValueInput}
            size="small"
            min={0}
            max={totalFrameCount}
            defaultValue={0}
            value={sliderValue}
            onChange={inputNumberChangeHandler}
          />
        </Col>
        <Col sm={9} className="px-0">
          <div className={styles.videoBtnSliderContainer}>
            <div
              className={styles.videoBtnContainer}
              onClick={playClickHandler}
            >
              {playControl !== "play" ? (
                <CaretRightOutlined className=" ms-1" />
              ) : (
                <PauseOutlined className=" ms-1" />
              )}
            </div>
            <div className={styles.videoSliderContainer}>
              <span className={styles.sliderMark}>0</span>
              <Slider
                className={styles.videoSlider}
                min={0}
                max={totalFrameCount}
                onChange={sliderChangeHandler}
                onChangeComplete={sliderChangeCompleteHandler}
                value={sliderValue}
              />
              <span className={styles.sliderMark}>{totalFrameCount}</span>
            </div>
          </div>
        </Col>
      </Row>
      {frameError ? <p>{frameError}</p> : null}
      <Row>
        {props.hideSubmit ? (
          submitError ? (
            <p>{submitError}</p>
          ) : null
        ) : (
          <Form onSubmit={videoPathSubmitHandler} encType="multipart/form-data">
            <Form.Group as={Row} controlId="videoPath">
              <Form.Label column sm={2}>
                Video path
              </Form.Label>
              <Col sm={6}>
                <Form.Control
                  type="string"
                  defaultValue="/Users/pengxi/video/numbered.mp4"
                  name="videoPath"
                  placeholder="E.g. /somePath/videoName.avi"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide video path in your local computer, e.g.
                  /somePath/videoName.avi
                </Form.Control.Feedback>
                {submitError ? <p>{submitError}</p> : null}
              </Col>
              <Col sm={1}>
                <Button type="submit" className="btn-submit">
                  Submit
                </Button>
              </Col>
            </Form.Group>
          </Form>
        )}
      </Row>
    </div>
  );
}
