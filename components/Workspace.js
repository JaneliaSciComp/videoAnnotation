import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Workspace.module.css';
import Canvas from './Canvas';
import Rectangle from './Rectangle';



export default function Workspace(props) {
    const [frame, setFrame] = useState('/fly.png');
    // const [annotation, setAnnotation] = useState([]);
    const [rectIdList, setRectIdList] = useState([]);

    console.log('workspace');


    function addRectId(idObj) {
        // idObj is a object constructed by Rectangle, this func is called in Rectangle
        setRectIdList([...rectIdList, idObj]);
        
    }
    
    

    return (
        <div className={styles.container}>
          <main className={styles.main}>
            <Rectangle label='fly' color='red' 
                addRectId={addRectId} />
            <Canvas className='my-3' 
                img={frame}
                // annotation={annotation} 
                rectIdList={rectIdList}
                resetRectIdList={setRectIdList}/>
          </main>
        </div>
    )
}