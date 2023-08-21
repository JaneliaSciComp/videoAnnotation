addEventListener('message', (msg) => {
    if (msg.data.cmd === 'decode') {
        decodeVideo(msg.data.arr);
    }
})


function decodeVideo(data) {
    console.log('worker called');
    const js_processVideo = pyscript.interpreter.globals.get('process_video');
    const res = js_processVideo(data);
    postMessage(res);
}