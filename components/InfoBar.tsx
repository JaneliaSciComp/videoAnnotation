import { useStates } from "./AppContext";

/**
 * To display global info and custom info.
 *
 * props:
 *     customInfo: string. If not null, will be displayed with system info.
 */

type InfoBarProps = {
  customInfo?: string
};

export default function InfoBar({ customInfo }: InfoBarProps) : React.ReactElement {
  const {globalInfo: info} = useStates();

  return (
    <>
      {info ? <div className="py-1">{info}</div> : null}
      {customInfo ? <div className="py-1">{customInfo}</div> : null}
    </>
  );
}
