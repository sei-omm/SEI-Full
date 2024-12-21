export const convartImgToWebp = (file: File) : Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("../../public/imageWorker.ts", import.meta.url),
      {
        type: "module",
      }
    );

    worker.onmessage = (e: MessageEvent<Blob | { error: string }>) => {
      if ("error" in e.data) {
        reject(new Error(e.data.error));
        worker.terminate();
        return;
      }

      resolve(e.data);
      worker.terminate();
    };

    worker.onerror = (err) => {
      reject(new Error(err.message));
      worker.terminate();
    };

    // Send the image file to the worker
    worker.postMessage(file);
  });
};
