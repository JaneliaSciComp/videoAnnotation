import BtnPrototype from './BtnPrototype';

export default function Rectangle(props) {

    return (
        <BtnPrototype
         label={props.label}
         color={props.color}
         type='rect' 
         drawObj={props.drawRect}
         setDraw={props.setDrawRect}
         addId={props.addRectId}
         >
        </BtnPrototype>
    )
}