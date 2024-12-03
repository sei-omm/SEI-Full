import { parentPort, workerData } from "worker_threads";
import { deflate } from "pako";
import { readFileSync, writeFileSync } from "fs";

interface WorkerData {
  inputFilePath: string;
  outputFilePath: string;
}

try {
  const { inputFilePath, outputFilePath } = workerData as WorkerData;

  // Read the file
  const fileBuffer = readFileSync(inputFilePath);

  // Compress the file using pako
  const compressedData = deflate(fileBuffer);

  // Save the compressed file
  writeFileSync(outputFilePath, Buffer.from(compressedData));

  // Notify the parent thread
  parentPort?.postMessage({
    success: true,
    message: `File compressed successfully and saved to ${outputFilePath}`,
  });
} catch (error) {
  parentPort?.postMessage({ success: false, message: (error as Error).message });
}
