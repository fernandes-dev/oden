import express from "express";
import cors from "cors"
import http from "node:http"
import { Server, Socket } from "socket.io"
import { SpeechClient } from "@google-cloud/speech"
import path from 'node:path'

const app = express()
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve("src", "credentials.json")

const speechClient = new SpeechClient();

const request = {
  config: {
    encoding: "LINEAR16",
    sampleRateHertz: 16000,
    languageCode: "pt-BR",
    enableWordTimeOffsets: true,
    enableAutomaticPunctuation: true,
    enableWordConfidence: true,
    enableSpeakerDiarization: true,
    model: "command_and_search",
    useEnhanced: true,
  },
  interimResults: true,
};

io.on('connection', (socket) => {
  let recognizeStream: any = null;

  socket.on("disconnect", () => {
    console.log("** user disconnected ** \n");
  });

  console.log('client connected: ', socket.id);

  socket.on("startGoogleCloudStream", function () {
    startRecognitionStream(this);
  });

  socket.on("endGoogleCloudStream", function () {
    console.log("** ending google cloud stream **\n");
    stopRecognitionStream();
  });

  socket.on("send_audio_data", async (audioData) => {
    io.emit("receive_message", "Got audio data");
    if (recognizeStream !== null) {
      try {
        recognizeStream.write(audioData.audio);
      } catch (err) {
        console.log("Error calling google api " + err);
      }
    } else {
      console.log("RecognizeStream is null");
    }
  });

  function startRecognitionStream(client: Socket) {
    console.log("* StartRecognitionStream: ", client.id);

    try {
      recognizeStream = speechClient
        .streamingRecognize(request as any)
        .on('close', e => {
          console.log('fechou', e);

        })
        .on("error", console.error)
        .on('data', data => {
          console.log('recebeu dados');

          const [result] = data.results;
          const isFinal = result?.isFinal;

          const transcription = data?.results?.map(result => result?.alternatives?.[0]?.transcript).join("\n")

          client.emit("receive_audio_text", {
            text: transcription,
            isFinal: isFinal,
          });

          if (data.results[0] && data.results[0].isFinal) {
            stopRecognitionStream();
            startRecognitionStream(client);
          }
        })
    } catch (err) {
      console.error("Error streaming google api " + err);
    }
  }

  function stopRecognitionStream() {
    if (recognizeStream) {
      console.log("* StopRecognitionStream \n");
      recognizeStream.end();
    }
    recognizeStream = null;
  }
})

server.listen(3333, () => {
  console.log("WebSocket server listening on port 8081.");
});