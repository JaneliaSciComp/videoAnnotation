import BtnPrototype from './BtnPrototype';

export default function Polygon(props) {

    return (
        <BtnPrototype
         label={props.label}
         color={props.color}
         type='polygon' 
         drawObj={props.drawPolygon}
         setDraw={props.setDrawPolygon}
         addId={props.addPolygonId}
         >
        </BtnPrototype>
    )
}