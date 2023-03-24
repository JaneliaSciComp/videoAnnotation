const pointSize = 4


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');


// display image in canvas
const img = document.getElementById("img"); // Create new img element
img.addEventListener(
  "load",
  () => {
    ctx.drawImage(img, 0, 0); //when img loaded, display image on canvas
  },
  false
);
img.src = "background.png"; // Set source path


// get coordinate of mouse click
function getMouseClickPosition(e) {
    let canvasBox = canvas.getBoundingClientRect();
    let clickX = e.clientX - canvasBox.left; 
    let clickY = e.clientY - canvasBox.top;
    return [clickX, clickY];
}

canvas.addEventListener('click', (e)=>{drawClickPoint(e, 'black', 'circle')} );


// draw a point on canvas
function drawPoint(x, y, color, shape) {
    
    switch (shape) {
        case 'cross':
            ctx.beginPath();
            ctx.moveTo(x-pointSize, y);
            ctx.lineTo(x+pointSize, y);
            ctx.moveTo(x, y-pointSize);
            ctx.lineTo(x, y+pointSize);
            // ctx.closePath();
            ctx.strokeStyle = color;
            ctx.stroke();
            break;
        case 'circle':
            ctx.beginPath();
            ctx.arc(x, y, pointSize-1, 0, Math.PI*2, true);
            ctx.stroke();
            break;
    }
    
}

// draw a point at the click position
function drawClickPoint(e, color='black', shape='cross') {
    clickPos = getMouseClickPosition(e);
    console.log(color, shape);
    drawPoint(clickPos[0], clickPos[1], color, shape);
}
