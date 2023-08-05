import BtnPrototype from './BtnPrototype';

export default function KeyPoint(props) {

    return (
        <BtnPrototype
         label={props.label}
         color={props.color}
         type='keyPoint' 
         drawObj={props.drawKeyPoint}
         setDraw={props.setDrawKeyPoint}
         addId={props.addKeyPointId}
         >
        </BtnPrototype>
    )
}