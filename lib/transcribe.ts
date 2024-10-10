import decodeAudio from "audio-decode";

import fs from "node:fs";
import { Whisper, manager } from "smart-whisper";

async function readWav(file: string): Promise<Float32Array> {
  const audioBuffer = await decodeAudio(
    fs.readFileSync(file) as unknown as ArrayBuffer
  );

  if (audioBuffer.sampleRate !== 16000) {
    throw new Error(`Invalid sample rate: ${audioBuffer.sampleRate}`);
  }
  if (audioBuffer.numberOfChannels !== 1) {
    throw new Error(`Invalid channel count: ${audioBuffer.numberOfChannels}`);
  }

  return audioBuffer.getChannelData(0);
}

async function transcribeAudio(filePath: string): Promise<string> {
  const whisper = new Whisper(
    manager.resolve(process.env.WHISPER_MODEL as string),
    {
      gpu: true,
    }
  );
  const audio = await readWav(filePath);
  const task = await whisper.transcribe(audio);
  const result = (await task.result)[0].text;
  await whisper.free();
  fs.rmSync(filePath);
  return result;
}

async function whisperInit() {
  try {
    manager.resolve(process.env.WHISPER_MODEL as string);
  } catch (error) {
    console.log(`Model ${process.env.WHISPER_MODEL} not found, downloading...`);
    await manager.download(process.env.WHISPER_MODEL as string);
  }
  console.log(`Model ${process.env.WHISPER_MODEL} loaded`);
}

export { transcribeAudio, whisperInit };
