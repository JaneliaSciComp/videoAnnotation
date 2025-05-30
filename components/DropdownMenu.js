import { useStateSetters, useStates } from "./AppContext";
import { Dropdown, Modal } from "antd";

/**
 * This component is meant to take a list of modal components, such as ProjectManager, ProjectList.
 * Can also take other entries like string, icon, etc.
 *
 * props:
 *     name: str, the name of the dropdown button
 *     menu: [
 *      {
 *          label: str,
 *          icon: react icon,
 *          disabled: boolean,
 *          //key: str,
 *          compName: str, // only required if use component from this library, e.g. 'ProjectManager' for <ProjectManager>
 *          component: component, // a react node, e.g. <ProjectList key='0' open={open} setOpen={setOpen} />. If it's a modal comp, the open/close behavior is handled automatically if the open and setOpen attributes are defined.  remember to pass a 'key' attribute
 *          preventDefault: boolean, //there are default behaviors when click on some components of this lib, e.g. clicking on ProjectManager will trigger a modal window. Set this to true to prevent the default behavior when needed.
 * },
 *      ...]
 *    onClick: (e) => {}. It will be called after the default behavior of each child if preventDefault is not set. Otherwise, it will be called directly. e is the event object, which contains a key property corresponding to the index (integer) of each child in the menu prop. Note: This key property may differ from the key prop of the component passed to each child."
 */
export default function DropdownMenu({menu, name, ...props}) {
  const projectId = useStates().projectId;
  const videoId = useStates().videoId;
  const setDownloadConfig = useStateSetters().setDownloadConfig;
  const setDownloadAnnotation = useStateSetters().setDownloadAnnotation;
  const setGlobalInfo = useStateSetters().setGlobalInfo;
  const frameUrl = useStates().frameUrl;
  const setSaveAnnotation = useStateSetters().setSaveAnnotation;

  const items = menu.map((item, i) => {
    return {
      label: item.label,
      key: i.toString(),
      icon: item.icon,
      disabled: item.disabled,
    };
  });

  const components = [];
  menu.forEach((item, i) => (components[i] = item.component));

  const onClick = async (e) => {
    const index = parseInt(e.key);
    const target = menu[index];
    const comp = components[index];
    if (target && !target.preventDefault && comp) {
      if (
        target.compName === "ProjectManager" &&
        comp.props.status === "new" &&
        projectId
      ) {
        confirm(comp);
      } else if (target.compName === "DownloadBtn") {
        if (comp.props.type === "configuration") {
          setDownloadConfig(true);
        } else if (comp.props.type === "annotation") {
          setDownloadAnnotation(true);
        }
      } else if (target.compName === "SaveAnnotationBtn") {
        if (videoId || frameUrl) {
          setSaveAnnotation(true);
        } else {
          setGlobalInfo("No video to save.");
        }
      } else {
        if (comp?.props?.setOpen) {
          comp.props.setOpen(true);
        }
      }
    }

    e.key = index;
    if (props.onClick) {
      props.onClick(e);
    }
  };

  function confirmOkClickHandler(comp) {
    comp.props.setOpen(true);
  }

  function cancelClickHandler(comp) {
    comp.props.open = false;
  }

  function confirm(comp) {
    Modal.confirm({
      title: "Alert",
      content:
        "The current project data including annotation buttons and unsaved annotations will be removed!",
      onOk: () => confirmOkClickHandler(comp),
      onCancel: () => cancelClickHandler(comp),
    });
  }

  return (
    <>
      <Dropdown
        menu={{
          items,
          onClick,
        }}
        trigger={["click"]}
      >
        <a
          style={{ width: "6em", textDecoration: "none", cursor: "pointer" }}
          onClick={(e) => e.preventDefault()}
        >
          {name}
        </a>
      </Dropdown>
      {components}
    </>
  );
}
