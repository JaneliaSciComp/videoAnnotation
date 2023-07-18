import Head from 'next/head';
import React, {useState, useEffect, useRef} from 'react';
import Workspace from '../components/Workspace.js';
import styles from '../styles/Home.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import {fabric} from 'fabric';



export default function Home() {
  // const [annotation, setAnnotation] = useState({});


  return (
    <div className={styles.container}>
      <Head>
        <title>Annotator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.workspaceContainer}>
        <Workspace />
      </main>

      <footer className={styles.footer}>
       
      </footer>
    </div>
  )
}
