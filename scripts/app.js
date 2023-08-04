const start = document.querySelector('.start');
const stop = document.querySelector('.stop');
const cancel = document.querySelector('.cancel');
const clips = document.querySelector('.clips');

stop.disabled = true;

if (navigator.mediaDevices.getUserMedia) 
{
    console.log('getUserMedia supported.');

    const constraints = { audio: true };
    let chunks = [];

    

    navigator.mediaDevices.getUserMedia(constraints)
        .then((stream)=>{

            const mediaRecorder = new MediaRecorder(stream);
            

            start.onclick = ()=>{
                console.log("Start is clicked!");
                mediaRecorder.start();

                console.log(mediaRecorder.state);
                console.log("Recording Started..")

                stop.disabled = false;
                start.disabled = true;

            }

            stop.onclick = ()=>{

                mediaRecorder.stop();
                console.log(mediaRecorder.state);
                console.log("Recording Stopped..")

                stop.disabled = true;
                start.disabled = false;
            }

            mediaRecorder.onstop = ()=>{

                // Create elements to display and control audio
                const clip = document.createElement('div');
                const clipName = document.createElement('p');
                const audio = document.createElement('audio');
                const deleteButton = document.createElement('button');
                const downloadButton = document.createElement('download');

                clip.className = 'clip';

                deleteButton.className = 'delete';
                deleteButton.textContent = 'Delete';

                audio.setAttribute('controls', '');

                clip.appendChild(clipName);
                clip.appendChild(audio);
                clip.appendChild(deleteButton);
                clip.appendChild(downloadButton);
                
                clips.appendChild(clip);
                
                audio.controls = true;

                const blob = new Blob(chunks, { 'type' : 'audio/mp4; codecs=opus' });
                console.log(chunks);
                chunks = [];
                const audioURL = window.URL.createObjectURL(blob);
                audio.src = audioURL;
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

