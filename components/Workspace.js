import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Workspace.module.css';
import Canvas from './Canvas';
import Rectangle from './Rectangle';
import Polygon from './Polygon';
import {Row} from 'react-bootstrap';



export default function Workspace(props) {
    const [frame, setFrame] = useState('/fly.png');
    // const [annotation, setAnnotation] = useState([]);
    const [rectIdList, setRectIdList] = useState({});
    const [drawRect, setDrawRect] = useState(false);
    const [polygonIdList, setPolygonIdList] = useState({});
    const [drawPolygon, setDrawPolygon] = useState(false);


    console.log('workspace render');


    function addRectId(idObj) {
        setRectIdList({...rectIdList, [idObj.id]: idObj});
    }
    
    function addPolygonId(idObj) {
        setPolygonIdList({...polygonIdList, [idObj.id]: idObj});
    }

    return (
        <div className={styles.container}>
          <main className={styles.main}>
            <Row className='mx-1 my-1'>
                <Rectangle label='rectangle' color='red'
                    drawRect={drawRect}
                    setDrawRect={setDrawRect} 
                    addRectId={addRectId} 
                    />
                <Rectangle label='rect' color='blue'
                    drawRect={drawRect}
                    setDrawRect={setDrawRect} 
                    addRectId={addRectId} 
                    />
            </Row>
                
            <Row className='mx-1 my-1'>
                <Polygon label='polygon' color='red'
                    drawPolygon={drawPolygon}
                    setDrawPolygon={setDrawPolygon} 
                    addPolygonId={addPolygonId}
                    />
            </Row>
            
            <Row className='mx-1 my-1'>
                <Canvas 
                    img={frame}
                    drawRect={drawRect}
                    setDrawRect={setDrawRect}
                    rectIdList={rectIdList}
                    setRectIdList={setRectIdList}
                    drawPolygon={drawPolygon}
                    setDrawPolygon={setDrawPolygon}
                    polygonIdList={polygonIdList}
                    setPolygonIdList={setPolygonIdList}
                    />
            </Row>
            
          </main>
        </div>
    )
}