

## Quick Start

We will use React, Next.js and our library to create a simply video annotation web like this:

![web_page.png](/public/web_page.png)


If you’re new to React or Next.js, check out [React](https://react.dev/learn) and [Next.js](https://nextjs.org/learn/foundations/about-nextjs).



### Step 1: Initialize a new project

First of all, you need to install [Node.js](https://nodejs.org/en/) for local development.

Then run
```bash
npx create-next-app@13.2.4  # The version used to create the page
```

Answer the popup questions. For my test, I used these settings. You can also customize your own settings.

![nextjs_settings.png](/public/nextjs_settings.png)


### Step 2: Copy our library to your project and install dependencies

> [!NOTE]
> This step will be replace by `npm install ourLib` after we release this library

Copy package.json, components, utils and styles folders from this repo to your root dir.

Go to the root dir of your project, and install the dependencies.
```bash
npm install
```

### Step 3: Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


### Step 4: Modifying `pages/index.js` 
You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

For the web in the above image, the index.js file should look like this

```javascript
import React from 'react';
import Workspace from '../components/Workspace.js';
import Canvas from '../components/Canvas.js';
import BtnContainer from '../components/BtnContainer.js';
import VideoUploader from '../components/VideoUploader.js';
import BtnConfiguration from '../components/BtnConfiguration.js';
import AnnotationTable from '../components/AnnotationTable.js';
import SaveBtn from '../components/SaveBtn.js';
import TrainBtn from '../components/TrainBtn.js';
import {Row, Col} from 'react-bootstrap'; // for layout

export default function Home() {
  return (
    <Workspace >
        <BtnConfiguration 
          groupType='skeleton' 
          btnType='skeleton'
          disableGroupTypeSelect
          disableBtnTypeSelect/>
        
        <Row>
          <Col xl='auto'>
            <canvas width={350} height={200} style={{border: 'solid'}}/>
            <AnnotationTable width={350} height={200} scrollY={160} ellipsis />
            <BtnContainer />
            <SaveBtn />
            <TrainBtn onClick={()=>{console.log('TrainBtn clicked')}}/>
            
          </Col>
          <Col xl='auto'>
            <Canvas width={700} height={500} />
            <VideoUploader />
          </Col>
        </Row>

    </Workspace>
  )
}
```
The page should look like this:

![init_page.png](/public/init_page.png)

> [!NOTE]
> The `<BtnConfiguration>` component will disapear after creating the buttons.

Here we used react-bootstrap for the layout. Check the tutorial [here](https://react-bootstrap.netlify.app/docs/layout/grid/#auto-layout-columns).


