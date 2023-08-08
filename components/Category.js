import {Button} from 'react-bootstrap';
import styles from '../styles/Button.module.css';

export default function Category(props) {
    function clickHandler() {
        const id = Date.now().toString();
        props.addCategoryId({
            id: id,
            label: props.label,
            color: props.color,
            type: 'category',         
        });
    }

    return (
        <Button className={`${styles["btn-category"]} ${styles.btn}`} 
            style={{color: props.color, background: 'white', border:'2px solid '+props.color}} 
            onClick={clickHandler}>
        {props.label}
        </Button>
    )
}
