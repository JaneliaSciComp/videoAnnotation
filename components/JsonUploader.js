import React, { useState, useEffect } from "react";
import { InboxOutlined } from "@ant-design/icons";
import { Upload } from "antd";
import { useStateSetters } from "./AppContext";

/**
 *  props:
 *      type: required, 'annotation' or 'configuration'
 *      onLoad: called after the file is successfully loaded, with the file obj as argument. Will be called after inherent behavior.
 *      setModalOpen: only useful when put inside a modal window. setter of modalOpen.
 */
export default function JsonUploader({type, onLoad, setModalOpen}) {
  const [info, setInfo] = useState("Click or drag file to this area to upload");

  const setUploader = useStateSetters().setUploader;

  const { Dragger } = Upload;

  useEffect(() => {
    if (
      !type ||
      (type !== "annotation" && type !== "configuration")
    ) {
      throw Error(
        "Type property is required, either annotation or configuration",
      );
    }
  }, [type]);

  function changeHandler(e) {
    if (e.file.status === "done") {
      uploadFile(e.file);
    } else if (e.file.status === "error") {
      setInfo(`${e.file.name} file upload failed.`);
    }
  }

  function uploadFile(file) {
    if (setModalOpen) {
      setModalOpen(false);
    }
    setUploader({
      type,
      file: file,
    });

    if (onLoad) {
      onLoad(file);
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <Dragger
        id="jsonFile"
        name="jsonFile"
        type="file"
        accept="json"
        showUploadList={false}
        beforeUpload={() => {
          setInfo("Click or drag file to this area to upload");
        }}
        onChange={changeHandler}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{info}</p>
        {}
      </Dragger>
    </div>
  );
}
