const start = document.querySelector('.start');
// const stop = document.querySelector('.stop');
// const cancel = document.querySelector('.cancel');
const clips = document.querySelector('.clips');
const audioStatus = document.querySelector('.audioStatus');

let blinking = false;

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
    
                    start.innerHTML = 'STOP';
                    listening = true;

                    toggleBlinking();

                    clips.replaceChildren();
                }
                else
                {
                    mediaRecorder.stop();
                    console.log(mediaRecorder.state);
                    console.log("Recording Stopped..")
    
                    start.innerHTML = 'REC';
                    listening = false;
                    toggleBlinking();
                }

            }
            

            mediaRecorder.onstop = ()=>{

                // Create elements to display and control audio
                const clip = document.createElement('div');
                const clipName = document.createElement('p');
                const audio = document.createElement('audio');
                const deleteButton = document.createElement('button');
                const downloadButton = document.createElement('a');
                const postButton = document.createElement('button');

                clip.className = 'clip';

                deleteButton.className = 'delete';
                deleteButton.textContent = 'Delete';

                downloadButton.className = 'download';
                downloadButton.textContent = 'Download';

                postButton.className = 'post';
                postButton.textContent = 'Predict'

                audio.setAttribute('controls', '');

                clip.appendChild(clipName);
                clip.appendChild(audio);
                clip.appendChild(deleteButton);
                clip.appendChild(downloadButton);
                clip.appendChild(postButton)
                
                clips.appendChild(clip);

                audio.setAttribute('controls', '');

                const dBlob = new Blob(chunks, { type : 'audio/wav' }); 
                const audioFile = new File([dBlob], "audio.wav");
            
                chunks = [];

                const audioURL = window.URL.createObjectURL(audioFile);
                audio.src = audioURL;

                downloadButton.setAttribute('href', audioURL);
                downloadButton.setAttribute('download', "filename.wav");

                console.log("recorder stopped");

                deleteButton.onclick = (e)=> {
                    e.target.closest(".clip").remove();
                    audioStatus.innerHTML = '';
                }

                postButton.onclick = async (e)=>{

                    postButton.disabled = true;

                    const formData = new FormData();
                    formData.append('audio', audioFile);

                    url = 'https://ap0k01gnn8.execute-api.us-east-1.amazonaws.com/Prod/upload_audio' 
                    
                    try {
                        const presignedUrlResponse = await fetch(url, {method: 'GET'});
                        const { presigned_url, s3_key } = await presignedUrlResponse.json();
                        console.log(presigned_url, s3_key);
                
                        if (presigned_url && s3_key) {
                            // Upload audio file to S3 using presigned URL
                            const s3UploadResponse = await fetch(presigned_url, {
                                method: 'PUT',
                                body: audioFile
                            });

                            console.log('S3 Upload Response:', s3UploadResponse.status, s3UploadResponse.statusText);
                            console.log('S3 Upload Response Body:', await s3UploadResponse.text());
                
                            if (s3UploadResponse.ok) {
                                console.log('Upload to S3 successful.');

                                const statusLabel = document.createElement('label');
                                audioStatus.appendChild(statusLabel);

                                // Further query and update the status of the audio file
                                // Function to query and update the status of the audio file
                                const queryAudioStatus = async () => {
                                    try {
                                        const statusResponse = await fetch(`https://ap0k01gnn8.execute-api.us-east-1.amazonaws.com/Prod/audio_status?s3_key=${s3_key}`);
                                        const statusData = await statusResponse.json();
                                        const status = statusData.status;
                                        const iclass1 = statusData.iclass1;
                                        const iclass2 = statusData.iclass2;

                                        console.log('Audio Status:', statusData);
                                    
                                        if (status === 'Uploading' || status === 'Processing') {
                                            // Continue querying until the status changes
                                            statusLabel.textContent = `${status}`;
                                            statusLabel.className = 'statusLabel';
                                            setTimeout(queryAudioStatus, 500); // Adjust the polling interval (e.g., 5 seconds)
                                        } else {
                                            statusLabel.textContent = `${status} Tags:`;
                                            console.log('Audio status changed:', status);
                                            // Add further handling based on the updated status

                                            // Add the predicted class to the audioStatus div
                                            const iclass1Label = document.createElement('label');
                                            const iclass2Label = document.createElement('label');
                                            iclass1Label.className = 'iclass1Label';
                                            iclass2Label.className = 'iclass2Label';
                                            iclass1Label.textContent = `${iclass1}`;
                                            iclass2Label.textContent = `${iclass2}`;
                                            audioStatus.appendChild(iclass1Label);
                                            audioStatus.appendChild(iclass2Label);

                                        }
                                    } catch (error) {
                                        console.error('Error querying audio status:', error);
                                        statusLabel.textContent = `Error uploading to S3: ${s3UploadResponse.statusText}`;
                                    }
                                };

                                // Start querying audio status
                                queryAudioStatus();

                            } else {
                                console.error('Error uploading to S3:', s3UploadResponse.statusText);
                            }
                        } else {
                            console.error('Error getting presigned URL from Lambda.');
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        statusLabel.textContent = `Error: ${error}`;
                    }          
                    
                }
            }

            mediaRecorder.ondataavailable = (event)=>{
                chunks.push(event.data);
            }

            function toggleBlinking() {
                const blinkingDot = document.querySelector('.blinking-dot');
                blinking = !blinking;
                if (blinking) {
                    blinkingDot.classList.add('blinking');
                } else {
                    blinkingDot.classList.remove('blinking');
                }
            }


        });
    
}
else
{
    prompt("Audio recording not supported on this device!");
}
