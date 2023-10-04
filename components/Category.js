import {Button} from 'react-bootstrap';
import styles from '../styles/Button.module.css';

export default function Category(props) {
    /*
        To annotate entire frame.
        Props: 
            label='chase'
            color='black'
            frameNum={frameNum}
            addAnnotationObj={addAnnotationObj}
            setActiveIdObj={setActiveIdObj}
    */

    function clickHandler() {
        if (Number.isInteger(props.frameNum) || props.frameUrl) {
            const id = Date.now().toString();
            const idObj = {
                id: id,
                frameNum: props.frameNum,
                label: props.label,
                color: props.color,
                type: 'category',         
            };
            props.addAnnotationObj(idObj);
            props.setActiveIdObj(idObj);
        }
    }

    return (
        <Button className={`${styles["btn-category"]} ${styles.btn}`} 
            style={{color: props.color, background: 'white', border:'2px solid '+props.color}} 
            onClick={clickHandler}>
        {props.label}
        </Button>
    )
}
