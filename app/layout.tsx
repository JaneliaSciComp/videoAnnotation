"use client";


import '../styles/globals.css';
//import Workspace from '../components/Workspace';
import { AppProvider } from '@/components/AppContext';

function App( {children,}: Readonly <{children: React.ReactNode;}>) {
  return (
    <html>
        <head>
          <title>
            VAL Library
          </title>
        </head>
        <body>
            <AppProvider>
                {children}
            </AppProvider>
        </body>
    </html>
  )
}

export default App

