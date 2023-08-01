import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Workspace.module.css';
import Canvas from './Canvas';
import Rectangle from './Rectangle';
import Polygon from './Polygon';



export default function Workspace(props) {
    const [frame, setFrame] = useState('/fly.png');
    // const [annotation, setAnnotation] = useState([]);
    const [rectIdList, setRectIdList] = useState([]);
    const [polygonIdList, setPolygonIdList] = useState([]);
    const [drawPolygon, setDrawPolygon] = useState(false);


    console.log('workspace render');


    function addRectId(idObj) {
        // idObj is a object constructed by Rectangle, this func is called in Rectangle
        setRectIdList([...rectIdList, idObj]);
    }
    
    

    return (
        <div className={styles.container}>
          <main className={styles.main}>
            <Rectangle label='rectangle' color='blue' 
                addRectId={addRectId} />
            <Polygon label='polygon' color='blue'
                drawPolygon={drawPolygon}
                setDrawPolygon={setDrawPolygon} />
            <Canvas className='my-3' 
                img={frame}
                // annotation={annotation} 
                rectIdList={rectIdList}
                resetRectIdList={setRectIdList}
                drawPolygon={drawPolygon}
                setDrawPolygon={setDrawPolygon}
                polygonIdList={polygonIdList}
                setPolygonIdList={setPolygonIdList}
                />
          </main>
        </div>
    )
}