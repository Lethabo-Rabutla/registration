 // Function to generate a random 6-digit account number
function generateAccountNumber() {
    // Generate a random number between 100000 and 999999
    return Math.floor(Math.random() * 900000) + 100000;
}

// Function to set the generated account number in the input field
function setAccountNumber() {
    var accountNumberInput = document.getElementById('account-number');
    accountNumberInput.value = generateAccountNumber();
}

// Call setAccountNumber when the page loads
window.onload = function() {
    setAccountNumber();
};
// Function to capture picture
function capturePicture() {
    const video = document.getElementById('camera-preview');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match the video feed
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current frame from the video onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas content to a data URL representing the picture
    const pictureDataUrl = canvas.toDataURL('image/jpeg');

    // Display the captured picture
    const pictureContainer = document.getElementById('captured-picture-container');
    pictureContainer.innerHTML = ''; // Clear previous picture if any
    const img = document.createElement('img');
    img.src = pictureDataUrl;
    img.width = 200; // Set the width of the displayed image
    img.height = 150; // Set the height of the displayed image
    pictureContainer.appendChild(img);
}

let cameraStream; // Variable to store the camera stream

// Function to activate the camera
function activateCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const video = document.getElementById('camera-preview');
            video.srcObject = stream;
            video.play();
            cameraStream = stream; // Store the camera stream
        })
        .catch(error => {
            console.error('Error accessing camera:', error);
        });
}

// Function to capture picture
function capturePicture() {
    if (!cameraStream) {
        console.error('Camera is not activated');
        return;
    }

    const video = document.getElementById('camera-preview');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match the video feed
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current frame from the video onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas content to a data URL representing the picture
    const pictureDataUrl = canvas.toDataURL('image/jpeg');

    // Display the captured picture temporarily
    const pictureContainer = document.getElementById('captured-picture-container');
    pictureContainer.innerHTML = ''; // Clear previous picture if any
    const img = document.createElement('img');
    img.src = pictureDataUrl;
    img.width = 200; // Set the width of the displayed image
    img.height = 150; // Set the height of the displayed image
    pictureContainer.appendChild(img);

    // Deactivate the camera
    deactivateCamera();
}

// Function to deactivate the camera
function deactivateCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}
window.onload = function() {
    const recordButton = document.getElementById('record-button');
    const stopButton = document.getElementById('stop-button');
    const providedWords = 'The quick brown fox jumps over the lazy dog.';

    // Function to read a message aloud
    function readMessage(message) {
        const speechSynthesis = window.speechSynthesis;
        const speechMessage = new SpeechSynthesisUtterance(message);
        speechSynthesis.speak(speechMessage);
    }

    // Function to handle button click event for recording
    function handleRecordButtonClick() {
        const message = "Please speak the following words after the system prompts you: " + providedWords;
        readMessage(message);

        // Request access to the user's microphone
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];

            // Start recording
            mediaRecorder.start();

            // Event listener for recording data
            mediaRecorder.ondataavailable = function(event) {
                chunks.push(event.data);
            };

            // Event listener for stopping recording
            mediaRecorder.onstop = function() {
                // Combine recorded chunks into a single blob
                const audioBlob = new Blob(chunks, { type: 'audio/wav' });

                // Send the recorded audio to the server (replace URL with your server endpoint)
                const formData = new FormData();
                formData.append('audio', audioBlob);
                fetch('/save-audio', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (response.ok) {
                        console.log('Audio recorded and sent to server successfully.');
                    } else {
                        console.error('Failed to send audio to server.');
                    }
                })
                .catch(error => {
                    console.error('Error occurred while sending audio to server:', error);
                });

                // Stop the media stream
                stream.getTracks().forEach(track => track.stop());

                // Perform word comparison and provide feedback
                const recognizedText = providedWords.toLowerCase();
                const transcript = ''; // Get the user's transcript from the server response
                if (transcript.toLowerCase() === recognizedText) {
                    console.log('Great! The words were pronounced correctly.');
                } else {
                    console.log('Great! The words were pronounced correctly.');
                }
            };

            // Stop recording when stop button is clicked
            stopButton.onclick = function() {
                mediaRecorder.stop();
            };
        })
        .catch(function(error) {
            console.error('Error accessing microphone:', error);
        });
    }

    // Event listener for the record button
    recordButton.onclick = handleRecordButtonClick;
};

