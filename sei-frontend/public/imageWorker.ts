export {};

self.onmessage = async (event: MessageEvent<File>) => {
  const file = event.data;

  try {
    const imgBitmap = await createImageBitmap(file);

    const canvas = new OffscreenCanvas(imgBitmap.width, imgBitmap.height);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      self.postMessage({ error: "Failed to create canvas context" });
      return;
    }

    ctx.drawImage(imgBitmap, 0, 0);

    const webpBlob = await canvas.convertToBlob({ type: "image/webp", quality: 0.8 });
    self.postMessage(webpBlob);
  } catch (error) {
    self.postMessage({ error: (error as Error).message });
  }
};
