import { spawn } from "child_process";
import temp from "tempfile";

function recordAudio(outputFile: string | undefined): Promise<{
  file: string;
  save: boolean;
}> {
  return new Promise((resolve, reject) => {
    console.log("Recording voice memo... Press Enter to stop.");
    let saveOutputFile = Boolean(outputFile);
    if (outputFile === undefined) {
      outputFile = temp({ extension: ".wav" });
    }
    const proc = spawn("rec", ["-q", "-r", "16000", outputFile], {
      stdio: ["pipe", "ignore", "ignore"],
    });

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (key: Buffer) => {
      const keyStr = key.toString();
      if (keyStr === "\r" || keyStr === "\n" || keyStr === "\u0003") {
        proc.kill("SIGINT");
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeAllListeners("data");
        console.log(`\nRecording stopped`);
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to start SoX: ${err.message}`));
    });

    proc.on("exit", (code) => {
      console.log(`SoX exited with code ${code}`);
      if (code !== 0 && code !== null) {
        reject(new Error(`SoX exited with code ${code}`));
      }
      resolve({ file: outputFile as string, save: saveOutputFile });
    });
  });
}

export { recordAudio };
