"use client";

import '../styles/globals.css';
import Workspace from '../components/Workspace';

function App( {children,}: Readonly <{children: React.ReactNode;}>) {
  return (
    <html>
        <head>
          <title>
            VAL Library
          </title>
        </head>
        <body>
            <Workspace>
                {children}
            </Workspace>
        </body>
    </html>
  )
}

export default App
