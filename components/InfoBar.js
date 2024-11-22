import { useStates} from './AppContext';


/**
 * To display global info and custom info.
 * 
 * props:
 *     customInfo: string. If not null, will be displayed with system info.
 */
export default function InfoBar(props) {
    const info = useStates().globalInfo;

    return (
        <>
            {info ? <div className='py-1'>{info}</div> : null}
            {props.customInfo ? <div className='py-1'>{props.customInfo}</div> : null}
        </>
    )
}