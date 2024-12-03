import { deflate } from "pako";

// Web Worker entry point
self.onmessage = (event: MessageEvent<File>) => {
  const file = event.data; // Received file

  const reader = new FileReader();

  reader.onload = () => {
    const fileContent = reader.result as ArrayBuffer;

    try {
      // Compress the file content using pako's deflate
      const compressed = deflate(new Uint8Array(fileContent));

      // Convert the compressed data into a Blob
      const compressedBlob = new Blob([compressed], {
        type: "application/octet-stream", // Generic binary data MIME type
      });

      // Send the compressed Blob back to the main thread
      self.postMessage({ compressedBlob });
    } catch (error) {
      self.postMessage({ error: (error as Error).message });
    }
  };

  reader.onerror = () => {
    self.postMessage({ error: "Error reading file" });
  };

  reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
};


//past code in your main thrade
    // Dynamically create the Worker
    const worker = new Worker(new URL("../../../public/fileCompressorWorker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (e: MessageEvent<{ compressedBlob?: Blob; error?: string }>) => {
      if (e.data.error) {
        // setError(e.data.error);
        worker.terminate();
        return;
      }

      if (e.data.compressedBlob) {
        const compressedBlobUrl = URL.createObjectURL(e.data.compressedBlob);
         console.log(compressedBlobUrl)
        // setCompressedFileUrl(compressedBlobUrl);
        worker.terminate();
      }
    };

    worker.onerror = (err) => {
      console.error(err);
      // setError(`Worker error: ${err.message}`);
      worker.terminate();
    };

    // Send the file to the worker
    // worker.postMessage(file);