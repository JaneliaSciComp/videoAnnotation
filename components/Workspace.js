import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Workspace.module.css';
import Canvas from './Canvas';
import Rectangle from './Rectangle';



export default function Workspace(props) {
    const [frame, setFrame] = useState('/fly.png');


    return (
        <div className={styles.container}>
          <main className={styles.main}>
            <Rectangle label='fly' />
            <Canvas className='my-3' img={frame}></Canvas>
          </main>
        </div>
      )
}