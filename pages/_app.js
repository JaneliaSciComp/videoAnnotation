import '../styles/globals.css';
import Script from 'next/script';
import Workspace from '../components/Workspace';
// import React, {useState, useEffect, useRef} from 'react';

function MyApp({ Component, pageProps }) {
  // const [opencvReady, setOpencvReady ] = useState(false);
  // function onRuntimeInitialized() {
  //   // https://emscripten.org/docs/api_reference/module.html#Module.onRuntimeInitialized
  //   console.log('ready');
  //   setOpencvReady(true);
  // }

  return (
    <>
      <Workspace>
      {/* <Script src='./opencv.js' strategy='beforeInteractive'/>  */}
        <Component {...pageProps} />
      </Workspace>
    </>
  )
  
}

export default MyApp
