'use client'

import React, { useEffect, useRef, useState } from "react";
import * as io from "socket.io-client";
interface WordRecognized {
  isFinal: boolean;
  text: string;
}

const sampleRate = 16000;

const getMediaStream = () =>
  navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: "default",
      sampleRate: sampleRate,
      sampleSize: 16,
      channelCount: 1,
    },
    video: false,
  });

export default function Home() {
  const [connection, setConnection] = useState<io.Socket>();
  const [currentRecognition, setCurrentRecognition] = useState<string>();
  const [recognitionHistory, setRecognitionHistory] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recorder, setRecorder] = useState<any>();
  const processorRef = useRef<any>();
  const audioContextRef = useRef<any>();
  const audioInputRef = useRef<any>();

  const speechRecognized = (data: WordRecognized) => {
    if (data.isFinal) {
      setCurrentRecognition("...");
      setRecognitionHistory((old) => [data.text, ...old]);
    } else setCurrentRecognition(data.text + "...");
  };

  const connect = () => {
    connection?.disconnect();
    const socket = io.connect("http://localhost:3333");
    socket.on("connect", () => {
      console.log("connected", socket.id);
      setConnection(socket);
    });

    socket.emit("startGoogleCloudStream");

    socket.on("receive_audio_text", (data) => {
      speechRecognized(data);
      console.log("received audio text", data);
    });

    socket.on("disconnect", () => {
      console.log("disconnected", socket.id);
    });
  };

  const disconnect = () => {
    if (!connection) return;
    connection?.emit("endGoogleCloudStream");
    connection?.disconnect();
    processorRef.current?.disconnect();
    audioInputRef.current?.disconnect();
    audioContextRef.current?.close();
    setConnection(undefined);
    setRecorder(undefined);
    setIsRecording(false);
  };

  useEffect(() => {
    (async () => {
      if (connection) {
        if (isRecording) return

        const stream = await getMediaStream()

        audioContextRef.current = new window.AudioContext();

        await audioContextRef.current.audioWorklet.addModule(
          "/src/worklets/recorderWorkletProcessor.js"
        );

        audioContextRef.current.resume();

        audioInputRef.current =
          audioContextRef.current.createMediaStreamSource(stream);

        processorRef.current = new AudioWorkletNode(
          audioContextRef.current,
          "recorder.worklet"
        );

        processorRef.current.connect(audioContextRef.current.destination);
        audioContextRef.current.resume();

        audioInputRef.current.connect(processorRef.current);

        processorRef.current.port.onmessage = (event: any) => {
          const audioData = event.data;
          connection.emit("send_audio_data", { audio: audioData });
        };
        setIsRecording(true);
      }
    })()
  }, [connection, isRecording, recorder])

  return (
    <React.Fragment>
      <div className="py-5 text-center">
        <div className="py-5 bg-primary text-light text-center ">
          <div>
            <button
              className={isRecording ? "btn-danger" : "btn-outline-light"}
              onClick={connect}
              disabled={isRecording}
            >
              Start
            </button>
            <button
              className="btn-outline-light"
              onClick={disconnect}
              disabled={!isRecording}
            >
              Stop
            </button>
          </div>
        </div>
        <div className="py-5 text-center">
          {recognitionHistory.map((tx, idx) => (
            <p key={idx}>{tx}</p>
          ))}
          <p>{currentRecognition}</p>
        </div>
      </div>
    </React.Fragment>
  );
}