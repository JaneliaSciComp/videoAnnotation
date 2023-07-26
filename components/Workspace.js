import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Workspace.module.css';
import Canvas from './Canvas';
import Rectangle from './Rectangle';



export default function Workspace(props) {
    const [frame, setFrame] = useState('/fly.png');
    // const [annotation, setAnnotation] = useState({});
    const [rectIdList, setRectIdList] = useState([]);

    // console.log(typeof(rectIdList));
    // console.log(rectIdList);

    function addRectId(idObj) {
        // idObj is a object constructed by Rectangle, this func is called in Rectangle
        // console.log(rectIdList, rectIdList.length);
        setRectIdList([...rectIdList, idObj]);
        
    }
    console.log(rectIdList, rectIdList.length);
    
    function removeRectId(id) {
        // this func is called in Canvas
        console.log(rectIdList, id);
        console.log(rectIdList[0].id, id, rectIdList[0].id!==id)
        setRectIdList(rectIdList.filter(idObj =>  idObj.id !== id))
        //
    }

    // console.log(rectIdList);


    return (
        <div className={styles.container}>
          <main className={styles.main}>
            <Rectangle label='fly' color='red' 
                addRectId={addRectId} />
            <Canvas className='my-3' 
                img={frame}
                // annotation={annotation} 
                rectIdList={rectIdList}
                removeRectId={removeRectId}/>
          </main>
        </div>
    )
}