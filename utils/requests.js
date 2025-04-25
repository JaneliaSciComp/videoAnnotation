const ROOT_URL = "http://localhost:8000/api";
const PROJECTS_URL = ROOT_URL + "/projects";
const PROJECT_URL = ROOT_URL + "/project";
const BTN_URL = ROOT_URL + "/btn";
const BTNS_URL = ROOT_URL + "/btns";
const VIDEO_URL = ROOT_URL + "/video";
const VIDEOS_URL = ROOT_URL + "/videos";
const FRAME_URL_ROOT = ROOT_URL + "/frame";
const ADDITIONAL_URL_ROOT = ROOT_URL + "/additionaldata";
const VIDEO_META_URL = ROOT_URL + "/videometa";
const PROJECT_ANNOTATION_URL = ROOT_URL + "/projectannotation";
const VIDEO_ANNOTATION_URL = ROOT_URL + "/videoannotation";
const ANNOTATION_FOR_CHART_URL = ROOT_URL + "/annotationforchart";

export async function postProject(projectInfoObj) {
  const res = await fetch(PROJECT_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectInfoObj),
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "POST project request failed" };
  }
}

export async function editProject(projectInfoObj) {
  const res = await fetch(PROJECT_URL, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectInfoObj),
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "PUT project request failed" };
  }
}

export async function getAllProjects() {
  try {
    const res = await fetch(PROJECTS_URL, {
      method: "GET",
    });

    if (res.ok) {
      return await res.json();
    } else {
      return { error: "GET all projects request failed" };
    }
  } catch (error) {
    console.error("Error fetching all projects:", error);
    return { error: "GET all projects request failed" };
  }
}

export async function getProject(id) {
  const res = await fetch(`${PROJECT_URL}?id=${id}`, {
    method: "GET",
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "GET project request failed" };
  }
}

export async function deleteProject(id) {
  const res = await fetch(`${PROJECT_URL}?id=${id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "DELETE project request failed" };
  }
}

export async function postBtnGroup(btnGroupObj) {
  const res = await fetch(BTN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(btnGroupObj),
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "POST btn group request failed" };
  }
}

export async function deleteBtnGroup(btnGroupId) {
  const res = await fetch(`${BTN_URL}?btnGroupId=${btnGroupId}`, {
    method: "DELETE",
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "DELETE btn group request failed" };
  }
}

export async function getProjectBtn(projectId) {
  const res = await fetch(`${BTNS_URL}?projectId=${projectId}`, {
    method: "GET",
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "GET project btn configuration data request failed" };
  }
}

export async function deleteProjectBtn(projectId) {
  const res = await fetch(`${BTNS_URL}?projectId=${projectId}`, {
    method: "DELETE",
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "DELETE project btn request failed" };
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
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "POST project btn request failed" };
  }
}

export async function postVideo(videoInfoObj) {
  const res = await fetch(VIDEO_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(videoInfoObj),
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "POST video request failed" };
  }
}

export async function editVideo(videoInfoObj) {
  const res = await fetch(VIDEO_URL, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(videoInfoObj),
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "PUT video request failed" };
  }
}

export async function deleteVideo(videoId) {
  const res = await fetch(`${VIDEO_URL}?id=${videoId}`, {
    method: "DELETE",
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "DELETE video request failed" };
  }
}

export async function getProjectVideo(projectId) {
  const res = await fetch(`${VIDEOS_URL}?projectId=${projectId}`, {
    method: "GET",
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "GET project video data request failed" };
  }
}

export async function deleteProjectVideo(projectId) {
  const res = await fetch(`${VIDEOS_URL}?projectId=${projectId}`, {
    method: "DELETE",
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "DELETE project video request failed" };
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
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "POST project videos request failed" };
  }
}

export async function getVideoMeta(videoId) {
  const res = await fetch(`${VIDEO_META_URL}?id=${videoId}`, {
    method: "GET",
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "GET video meta request failed" };
  }
}

export async function getFrame(frameNum) {
  const res = await fetch(`${FRAME_URL_ROOT}?num=${frameNum}`, {
    method: "GET",
  });

  if (res.ok) {
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    return url;
  } else {
    return { error: "GET frame request failed" };
  }
}

export async function getAdditionalData(videoId, additionalDataNameToRetrieve) {
  const res = await fetch(
    `${ADDITIONAL_URL_ROOT}/${videoId}?names=${additionalDataNameToRetrieve.join("@@")}`,
    {
      method: "GET",
    },
  );

  if (res.ok) {
    return await res.json();
  } else {
    return { error: `GET additional data request failed` };
  }
}

export async function postProjectAnnotation(data) {
  /**
     * data: {
            annotations: [anno1, anno2, ...],
            projectId: str
            videos: [videoId1, videoId2, ...]
        } 
     */
  const res = await fetch(PROJECT_ANNOTATION_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "POST project annotation request failed" };
  }
}

export async function getProjectAnnotation(projectId) {
  const res = await fetch(`${PROJECT_ANNOTATION_URL}?projectId=${projectId}`, {
    method: "GET",
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "GET project annotation request failed" };
  }
}

export async function postVideoAnnotation(data) {
  /**
     * data: {
            annotations: [anno1, anno2, ...],
            videoId: str
        } 
     */
  const res = await fetch(VIDEO_ANNOTATION_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "POST video annotation request failed" };
  }
}

export async function getVideoAnnotation(videoId) {
  const res = await fetch(`${VIDEO_ANNOTATION_URL}?videoId=${videoId}`, {
    method: "GET",
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "GET video annotation request failed" };
  }
}

export async function getAnnotationForChart(
  videoId,
  frameNum,
  labelList,
  range,
) {
  const res = await fetch(
    `${ANNOTATION_FOR_CHART_URL}?videoId=${videoId}&frameNum=${frameNum}&labels=${labelList.join("@@")}&range=${range}`,
    {
      method: "GET",
    },
  );

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "GET annotationForChart request failed" };
  }
}

export async function deleteProjectAnnotation(projectId) {
  const res = await fetch(`${PROJECT_ANNOTATION_URL}?projectId=${projectId}`, {
    method: "DELETE",
  });

  if (res.ok) {
    return await res.json();
  } else {
    return { error: "DELETE project annotation request failed" };
  }
}
