"use client";

import '../styles/globals.css';
//import Workspace from '../components/Workspace';
import StatesProvider from '@/components/AppContext';

function App( {children,}: Readonly <{children: React.ReactNode;}>) {
  return (
    <html>
        <head>
          <title>
            VAL Library
          </title>
        </head>
        <body>
            <StatesProvider>
                {children}
            </StatesProvider>
        </body>
    </html>
  )
}

export default App
