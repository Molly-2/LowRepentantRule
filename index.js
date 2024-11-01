const express = require('express');
const axios = require('axios');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Constants (replace these with actual values)
const XI_API_KEY = "sk_c68443d5e9d5c33712245a1f23998fc2f11a5ffd239e226e"; // Add your API key here
const VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // Add your Voice ID here
const OUTPUT_PATH = "output.mp3"; // Path to save the output audio file

// Endpoint for Text-to-Speech conversion
app.get('/textspeech', async (req, res) => {
    const textToSpeak = req.query.query;
    if (!textToSpeak) {
        return res.status(400).send("Please provide text to convert to speech using 'query' parameter.");
    }

    // Construct the URL for the Text-to-Speech API request
    const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`;

    // Set up headers for the API request, including the API key for authentication
    const headers = {
        "Accept": "application/json",
        "xi-api-key": XI_API_KEY
    };

    // Set up the data payload for the API request, including the text and voice settings
    const data = {
        text: textToSpeak,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true
        }
    };

    try {
        // Make the POST request to the TTS API with headers and data, enabling streaming response
        const response = await axios.post(ttsUrl, data, { headers, responseType: 'stream' });

        // Stream the audio response to a file
        const writer = fs.createWriteStream(OUTPUT_PATH);
        response.data.pipe(writer);

        writer.on('finish', () => {
            console.log("Audio stream saved successfully.");
            res.download(OUTPUT_PATH, 'output.mp3'); // Send the file as a download
        });

        writer.on('error', (err) => {
            console.error("Error saving the audio stream:", err);
            res.status(500).send("Failed to save the audio stream.");
        });
    } catch (error) {
        console.error("Error with Text-to-Speech API request:", error.response ? error.response.data : error.message);
        res.status(500).send("Error processing Text-to-Speech request.");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
