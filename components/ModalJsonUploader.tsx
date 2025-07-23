import JsonUploader from "./JsonUploader";
import { Modal } from "antd";

interface ModalJsonUploaderProps {
  setOpen: (open: boolean)=> void,
  type: string,
  open: boolean,
  onCancel?: ()=> void
}
/**
 *  props:
 *      type: required, 'annotation' or 'configuration'
 *      open: boolean. Whether to open the modal window
 *      setOpen: setter of open. In order to give controll to ProjectManager's internal buttons.
 *      onCancel: function. Called when the modal is closed.
 */
export default function ModalJsonUploader( {setOpen, type, open, onCancel}: ModalJsonUploaderProps ) {
  function cancelClickHandler() {
    setOpen(false);
  
    if (onCancel) {
      onCancel();
    }
  
  }

  return (
    <Modal
      title={`Upload ${type === "annotation" ? "annotation" : "project configuration"} file (.json)`}
      open={open}
      onCancel={cancelClickHandler}
      footer={() => null}
    >
      <div className="my-4 d-flex justify-content-center">
        <div style={{ width: "50%" }}>
          <JsonUploader type={type} setModalOpen={setOpen} />
        </div>
      </div>
    </Modal>
  );
}
