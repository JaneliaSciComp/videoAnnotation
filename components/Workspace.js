import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Workspace.module.css';
import Canvas from './Canvas';
import Rectangle from './Rectangle';
import Polygon from './Polygon';
import KeyPoint from './Keypoint';
import Category from './Category';
import AnnotationDisplay from './AnnotationDisplay';
import {Row, Col} from 'react-bootstrap';



export default function Workspace(props) {
    const [frame, setFrame] = useState('/fly.png');
    // const [annotation, setAnnotation] = useState([]);
    const [activeId, setActiveId] = useState();
    const [categoryIdList, setCategoryIdList] = useState({});
    const [keyPointIdList, setKeyPointIdList] = useState({});
    const [drawKeyPoint, setDrawKeyPoint] = useState(false);
    const [rectIdList, setRectIdList] = useState({});
    const [drawRect, setDrawRect] = useState(false);
    const [polygonIdList, setPolygonIdList] = useState({});
    const [drawPolygon, setDrawPolygon] = useState(false);


    console.log('workspace render');

    function addCategoryId(idObj) {
        setCategoryIdList({...categoryIdList, [idObj.id]: idObj});
    }

    function addKeyPointId(idObj) {
        setKeyPointIdList({...keyPointIdList, [idObj.id]: idObj});
    }

    function addRectId(idObj) {
        setRectIdList({...rectIdList, [idObj.id]: idObj});
    }
    
    function addPolygonId(idObj) {
        setPolygonIdList({...polygonIdList, [idObj.id]: idObj});
    }

    return (
        <div className={styles.container}>
          <main className={styles.main}>
            <Row >
                <Col xs={6}>
                    <Row className='mx-1 my-1'>
                        <Category
                            label='chase'
                            color='black'
                            addCategoryId={addCategoryId}
                            >
                        </Category>
                    </Row>
                    <Row className='mx-1 my-1'> 
                        <KeyPoint
                            label='head'
                            color='lightblue'
                            type='keyPoint' 
                            drawKeyPoint={drawKeyPoint}
                            setDrawKeyPoint={setDrawKeyPoint}
                            addKeyPointId={addKeyPointId}
                            >
                        </KeyPoint>
                    </Row>
                
                    <Row className='mx-1 my-1'>
                        <Rectangle 
                            label='rectangle' 
                            color='red'
                            drawRect={drawRect}
                            setDrawRect={setDrawRect} 
                            addRectId={addRectId} 
                            />
                        <Rectangle 
                            label='rect' 
                            color='blue'
                            drawRect={drawRect}
                            setDrawRect={setDrawRect} 
                            addRectId={addRectId} 
                            />
                    </Row>
                        
                    <Row className='mx-1 my-1'>
                        <Polygon 
                            label='polygon' 
                            color='red'
                            drawPolygon={drawPolygon}
                            setDrawPolygon={setDrawPolygon} 
                            addPolygonId={addPolygonId}
                            />
                    </Row>
                </Col>
                <Col xs={6}>
                    <AnnotationDisplay idObj={rectIdList[activeId]}/>
                </Col>
            </Row>
            
            <Row className='mx-1 my-1'>
                <Canvas 
                    img={frame}
                    drawKeyPoint={drawKeyPoint}
                    setDrawKeyPoint={setDrawKeyPoint}
                    keyPointIdList={keyPointIdList}
                    setKeyPointIdList={setKeyPointIdList}
                    drawRect={drawRect}
                    setDrawRect={setDrawRect}
                    rectIdList={rectIdList}
                    setRectIdList={setRectIdList}
                    drawPolygon={drawPolygon}
                    setDrawPolygon={setDrawPolygon}
                    polygonIdList={polygonIdList}
                    setPolygonIdList={setPolygonIdList}
                    setActiveId={setActiveId}
                    />
                
            </Row>
            
          </main>
        </div>
    )
}