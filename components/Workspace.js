import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Workspace.module.css';
import Canvas from './Canvas';
import Rectangle from './Rectangle';
import Polygon from './Polygon';



export default function Workspace(props) {
    const [frame, setFrame] = useState('/fly.png');
    // const [annotation, setAnnotation] = useState([]);
    const [rectIdList, setRectIdList] = useState([]);
    const [polygonIdList, setPolygonIdList] = useState({});
    const [drawPolygon, setDrawPolygon] = useState(false);


    console.log('workspace render');


    function addRectId(idObj) {
        setRectIdList([...rectIdList, idObj]);
    }
    
    function addPolygonId(idObj) {
        const key = Object.keys(idObj)[0];
        console.log(key);
        setPolygonIdList({...polygonIdList, [idObj.id]: idObj});
    }

    return (
        <div className={styles.container}>
          <main className={styles.main}>
            <Rectangle label='rectangle' color='blue' 
                addRectId={addRectId} />
            <Polygon label='polygon' color='blue'
                drawPolygon={drawPolygon}
                setDrawPolygon={setDrawPolygon} 
                addPolygonId={addPolygonId}/>
            <Canvas className='my-3' 
                img={frame}
                // annotation={annotation} 
                rectIdList={rectIdList}
                setRectIdList={setRectIdList}
                drawPolygon={drawPolygon}
                setDrawPolygon={setDrawPolygon}
                polygonIdList={polygonIdList}
                setPolygonIdList={setPolygonIdList}
                />
          </main>
        </div>
    )
}