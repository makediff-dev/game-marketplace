import { compressImage } from "@/lib/compress-image";

const KB = 1024;

function file(type: string, size: number, name = "photo.png") {
  const result = new File(["x"], name, { type });
  Object.defineProperty(result, "size", { value: size });
  return result;
}

function mockCanvas(blobSizes: Array<number | null>, context: unknown = { drawImage: jest.fn() }) {
  const sizes = [...blobSizes];
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as never);
  jest.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (callback) {
    const size = sizes.length > 1 ? sizes.shift()! : sizes[0];
    callback(size == null ? null : ({ size } as Blob));
  });
}

const bitmap = { width: 3200, height: 1600, close: jest.fn() };

beforeEach(() => {
  (globalThis as { createImageBitmap?: unknown }).createImageBitmap = jest.fn().mockResolvedValue(bitmap);
});

afterEach(() => jest.restoreAllMocks());

describe("compressImage", () => {
  it("leaves gifs, non-images and small jpegs alone", async () => {
    for (const input of [file("image/gif", 5000 * KB), file("text/plain", 10), file("image/jpeg", 100 * KB)]) {
      await expect(compressImage(input)).resolves.toBe(input);
    }
    expect(createImageBitmap).not.toHaveBeenCalled();
  });

  it("returns the original when the image cannot be decoded", async () => {
    (createImageBitmap as jest.Mock).mockRejectedValue(new Error("bad"));
    const input = file("image/png", 2000 * KB);

    await expect(compressImage(input)).resolves.toBe(input);
  });

  it("returns the original without a 2d context", async () => {
    mockCanvas([100], null);
    const input = file("image/png", 2000 * KB);

    await expect(compressImage(input)).resolves.toBe(input);
    expect(bitmap.close).toHaveBeenCalled();
  });

  it("scales down to 1600px and lowers quality until it fits", async () => {
    const draw = jest.fn();
    mockCanvas([900 * KB, 800 * KB, 600 * KB], { drawImage: draw });

    const result = await compressImage(file("image/png", 3000 * KB, "shot.final.png"));

    expect(draw).toHaveBeenCalledWith(bitmap, 0, 0, 1600, 800);
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledTimes(3);
    expect(result.name).toBe("shot.final.jpg");
    expect(result.type).toBe("image/jpeg");
  });

  it("keeps a small original when compression does not help", async () => {
    mockCanvas([700 * KB]);
    const input = file("image/png", 600 * KB);

    await expect(compressImage(input)).resolves.toBe(input);
  });

  it("returns the original when the canvas gives no blob", async () => {
    mockCanvas([null]);
    const input = file("image/webp", 2000 * KB);

    await expect(compressImage(input)).resolves.toBe(input);
  });
});
