"use client";

import '../styles/globals.css';
import Workspace from '../components/Workspace';

function MyApp({ children,}: Readonly<{children: React.ReactNode;}>) {

  return (
    <>
      <html>
        <body>
          <Workspace>
            {children}
          </Workspace>
        </body>
      </html>
    </>
  )
  
}

export default MyApp
