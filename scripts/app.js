const start = document.querySelector('.start');
// const stop = document.querySelector('.stop');
// const cancel = document.querySelector('.cancel');
const clips = document.querySelector('.clips');



if (navigator.mediaDevices.getUserMedia) 
{
    console.log('getUserMedia supported.');

    const constraints = { audio: true };
    let chunks = [];
    let listening = false;

    

    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream)=>{

            const mediaRecorder = new MediaRecorder(stream);
            

            
            start.onclick = ()=>{
                
                if(!listening)
                {
                    console.log("Start is clicked!");
                    mediaRecorder.start();
    
                    console.log(mediaRecorder.state);
                    console.log("Recording Started..")
    
                    start.innerHTML = 'Stop';
                    listening = true;

                    clips.replaceChildren();
                }
                else
                {
                    mediaRecorder.stop();
                    console.log(mediaRecorder.state);
                    console.log("Recording Stopped..")
    
                    start.innerHTML = 'Start';
                    listening = false;
                }

            }
            

            mediaRecorder.onstop = ()=>{

                // Create elements to display and control audio
                const clip = document.createElement('div');
                const clipName = document.createElement('p');
                const audio = document.createElement('audio');
                const deleteButton = document.createElement('button');
                const downloadButton = document.createElement('a');

                clip.className = 'clip';

                deleteButton.className = 'delete';
                deleteButton.textContent = 'Delete';

                downloadButton.className = 'download';
                downloadButton.textContent = 'Download';

                audio.setAttribute('controls', '');

                clip.appendChild(clipName);
                clip.appendChild(audio);
                clip.appendChild(deleteButton);
                clip.appendChild(downloadButton);
                
                clips.appendChild(clip);
                
                // audio.controls = true;
                audio.setAttribute('controls', '');

                const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
                console.log(chunks);
                chunks = [];
                const audioURL = window.URL.createObjectURL(blob);
                audio.src = audioURL;

                downloadButton.setAttribute('href', audioURL);
                downloadButton.setAttribute('download', 'myaudio');

                console.log("recorder stopped");

                deleteButton.onclick = (e)=> {
                    e.target.closest(".clip").remove();
                }
            }

            

            mediaRecorder.ondataavailable = (event)=>{
                chunks.push(event.data);
            }


        });
    
}
else
{
    prompt("Audio recording not supported on this device!");
}

