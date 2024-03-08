

## Quick Start

We will use ***React, Next.js*** and our library to create a simple video annotation web like this:

![web_page.png](/public/web_page.png)


If you’re new to React or Next.js, check out [React](https://react.dev/learn) and [Next.js](https://nextjs.org/learn/foundations/about-nextjs).



### Step 1: Initialize a new project

First of all, you need to install [Node.js](https://nodejs.org/en/) (>=19.0.0).

Then clone this repo.

Then outside of the repo dir, run
```bash
npx create-next-app@13.2.4  # The version used to create the page
```

Answer the popup questions. For my test, I used these settings. You can also customize your own.

![nextjs_settings.png](/public/nextjs_settings.png)


### Step 2: Copy our library to your project and install dependencies

> [!NOTE]
> This step will be replaced by `npm install ourLib` after we release this library

Copy ***package.json, components, utils*** and ***styles*** folders from the repo dir to the root dir of the project you just created.

In the root dir of your project, install the dependencies.
```bash
npm install
```


### Step 3: Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



### Step 4: Modify `pages/index.js` 
You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

For the web in the image above, the index.js file should look like this

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
import ProjectDropdown from '../components/ProjectDropdown.js';
import {Container, Row, Col} from 'react-bootstrap'; // for layout


export default function Home() {
  return (
    <Workspace >
        <ProjectDropdown />
        
        <Row>
            <Col >
                <canvas width={350} height={200} style={{border: 'solid'}}/>
                <AnnotationTable width={350} height={200} scrollY={160} ellipsis />
                <BtnContainer />
                <SaveBtn />
                <TrainBtn />
            </Col>
            <Col >
                <Canvas width={500} height={500} />
                <VideoUploader />
            </Col>
        </Row>
    </Workspace>
  )
}
```

> [!NOTE]
> In order to process the video, you need to set up a backend server. We will cover this in another [repo](https://github.com/JaneliaSciComp/videoAnnotation_backend/tree/local_usage).

Here we used react-bootstrap for the layout. Check out the [tutorial](https://react-bootstrap.netlify.app/docs/layout/grid/#auto-layout-columns).


