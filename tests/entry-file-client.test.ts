import { describe, expect, it } from "vitest";

import { readEntryFile, writeEntryFile } from "../src/sidepanel/entry-file-client";

describe("readEntryFile", () => {
  it("rejects when the open picker is unavailable", async () => {
    const hadWindow = "window" in globalThis;
    const previousWindow = globalThis.window;
    globalThis.window = {} as Window & typeof globalThis;

    try {
      await expect(readEntryFile()).rejects.toThrow("Open picker is unavailable");
    } finally {
      if (hadWindow) {
        globalThis.window = previousWindow;
      } else {
        Reflect.deleteProperty(globalThis, "window");
      }
    }
  });
});

describe("writeEntryFile", () => {
  it("creates no entry file when the vault locks before the write finishes", async () => {
    const chosenPath = "chosen-entries.json";
    const files = new Map<string, string>();
    let vaultLocked = false;

    const wrote = await writeEntryFile('{"version":1,"entries":[]}\n', () => !vaultLocked, {
      async showSaveFilePicker() {
        // The save picker creates the chosen file before it resolves.
        files.set(chosenPath, "");
        vaultLocked = true;
        return {
          async getFile() {
            return new File([files.get(chosenPath) ?? ""], chosenPath);
          },
          async createWritable() {
            files.set(chosenPath, "");
            let next = "";
            return {
              async write(data: string) {
                next += data;
              },
              async close() {
                files.set(chosenPath, next);
              },
              async abort() {
                // Chrome does not restore bytes truncated by createWritable.
              },
            };
          },
          async remove() {
            files.delete(chosenPath);
          },
        } as unknown as FileSystemFileHandle;
      },
    });

    expect(wrote).toBe(false);
    expect(files.has(chosenPath)).toBe(false);
  });

  it("keeps an existing entry file's bytes when the vault locks before the write finishes", async () => {
    const chosenPath = "chosen-entries.json";
    const previous = "previous-export\n";
    const files = new Map<string, string>([[chosenPath, previous]]);
    let vaultLocked = false;

    const wrote = await writeEntryFile('{"version":1,"entries":[]}\n', () => !vaultLocked, {
      async showSaveFilePicker() {
        return {
          async getFile() {
            return new File([files.get(chosenPath) ?? ""], chosenPath);
          },
          async createWritable() {
            // Chrome truncates the chosen file when the writable opens.
            files.set(chosenPath, "");
            vaultLocked = true;
            let next = "";
            return {
              async write(data: string) {
                next += data;
              },
              async close() {
                files.set(chosenPath, next);
              },
              async abort() {
                // Chrome does not restore bytes truncated by createWritable.
              },
            };
          },
          async remove() {
            files.delete(chosenPath);
          },
        } as unknown as FileSystemFileHandle;
      },
    });

    expect(wrote).toBe(false);
    expect(files.get(chosenPath)).toBe(previous);
  });

  it("keeps an existing empty entry file when the vault locks before the write finishes", async () => {
    const chosenPath = "chosen-entries.json";
    const files = new Map<string, string>([[chosenPath, ""]]);
    let vaultLocked = false;

    const wrote = await writeEntryFile('{"version":1,"entries":[]}\n', () => !vaultLocked, {
      async showSaveFilePicker() {
        return {
          async getFile() {
            // The file was already empty before this save, so its timestamp is earlier.
            return new File([files.get(chosenPath) ?? ""], chosenPath, { lastModified: 0 });
          },
          async createWritable() {
            // Chrome truncates the chosen file when the writable opens.
            files.set(chosenPath, "");
            vaultLocked = true;
            let next = "";
            return {
              async write(data: string) {
                next += data;
              },
              async close() {
                files.set(chosenPath, next);
              },
              async abort() {
                // Chrome does not restore bytes truncated by createWritable.
              },
            };
          },
          async remove() {
            files.delete(chosenPath);
          },
        } as unknown as FileSystemFileHandle;
      },
    });

    expect(wrote).toBe(false);
    expect(files.has(chosenPath)).toBe(true);
    expect(files.get(chosenPath)).toBe("");
  });

  it("keeps an existing entry file's bytes when the vault locks after new bytes are written", async () => {
    const chosenPath = "chosen-entries.json";
    const previous = "previous-export\n";
    const files = new Map<string, string>([[chosenPath, previous]]);
    let vaultLocked = false;

    const wrote = await writeEntryFile('{"version":1,"entries":[]}\n', () => !vaultLocked, {
      async showSaveFilePicker() {
        return {
          async getFile() {
            return new File([files.get(chosenPath) ?? ""], chosenPath);
          },
          async createWritable() {
            // Chrome truncates the chosen file when the writable opens.
            files.set(chosenPath, "");
            let next = "";
            return {
              async write(data: string) {
                next += data;
                vaultLocked = true;
              },
              async close() {
                files.set(chosenPath, next);
              },
              async abort() {
                // Chrome does not restore bytes truncated by createWritable.
              },
            };
          },
          async remove() {
            files.delete(chosenPath);
          },
        } as unknown as FileSystemFileHandle;
      },
    });

    expect(wrote).toBe(false);
    expect(files.get(chosenPath)).toBe(previous);
  });

  it("keeps an existing empty entry file when the vault locks after new bytes are written", async () => {
    const chosenPath = "chosen-entries.json";
    const files = new Map<string, string>([[chosenPath, ""]]);
    let vaultLocked = false;

    const wrote = await writeEntryFile('{"version":1,"entries":[]}\n', () => !vaultLocked, {
      async showSaveFilePicker() {
        return {
          async getFile() {
            // The file was already empty before this save, so its timestamp is earlier.
            return new File([files.get(chosenPath) ?? ""], chosenPath, { lastModified: 0 });
          },
          async createWritable() {
            // Chrome truncates the chosen file when the writable opens.
            files.set(chosenPath, "");
            let next = "";
            return {
              async write(data: string) {
                next += data;
                vaultLocked = true;
              },
              async close() {
                files.set(chosenPath, next);
              },
              async abort() {
                // Chrome does not restore bytes truncated by createWritable.
              },
            };
          },
          async remove() {
            files.delete(chosenPath);
          },
        } as unknown as FileSystemFileHandle;
      },
    });

    expect(wrote).toBe(false);
    expect(files.has(chosenPath)).toBe(true);
    expect(files.get(chosenPath)).toBe("");
  });

  it("creates no entry file when the vault locks after the chosen file is opened", async () => {
    const chosenPath = "chosen-entries.json";
    const files = new Map<string, string>();
    let vaultLocked = false;

    const wrote = await writeEntryFile('{"version":1,"entries":[]}\n', () => !vaultLocked, {
      async showSaveFilePicker() {
        // The save picker creates the chosen file before it resolves.
        files.set(chosenPath, "");
        return {
          async getFile() {
            return new File([files.get(chosenPath) ?? ""], chosenPath);
          },
          async createWritable() {
            // Chrome truncates the chosen file when the writable opens.
            files.set(chosenPath, "");
            vaultLocked = true;
            let next = "";
            return {
              async write(data: string) {
                next += data;
              },
              async close() {
                files.set(chosenPath, next);
              },
              async abort() {
                // Chrome does not restore bytes truncated by createWritable.
              },
            };
          },
          async remove() {
            files.delete(chosenPath);
          },
        } as unknown as FileSystemFileHandle;
      },
    });

    expect(wrote).toBe(false);
    expect(files.has(chosenPath)).toBe(false);
  });

  it("creates no entry file when the vault locks after new bytes are written", async () => {
    const chosenPath = "chosen-entries.json";
    const files = new Map<string, string>();
    let vaultLocked = false;

    const wrote = await writeEntryFile('{"version":1,"entries":[]}\n', () => !vaultLocked, {
      async showSaveFilePicker() {
        // The save picker creates the chosen file before it resolves.
        files.set(chosenPath, "");
        return {
          async getFile() {
            return new File([files.get(chosenPath) ?? ""], chosenPath);
          },
          async createWritable() {
            // Chrome truncates the chosen file when the writable opens.
            files.set(chosenPath, "");
            let next = "";
            return {
              async write(data: string) {
                next += data;
                vaultLocked = true;
              },
              async close() {
                files.set(chosenPath, next);
              },
              async abort() {
                // Chrome does not restore bytes truncated by createWritable.
              },
            };
          },
          async remove() {
            files.delete(chosenPath);
          },
        } as unknown as FileSystemFileHandle;
      },
    });

    expect(wrote).toBe(false);
    expect(files.has(chosenPath)).toBe(false);
  });

  it("keeps an existing entry file's bytes when the vault locks while the export is being saved", async () => {
    const chosenPath = "chosen-entries.json";
    const previous = "previous-export\n";
    const files = new Map<string, string>([[chosenPath, previous]]);
    let vaultLocked = false;

    const wrote = await writeEntryFile('{"version":1,"entries":[]}\n', () => !vaultLocked, {
      async showSaveFilePicker() {
        return {
          async getFile() {
            return new File([files.get(chosenPath) ?? ""], chosenPath);
          },
          async createWritable() {
            files.set(chosenPath, "");
            let next = "";
            return {
              async write(data: string) {
                next += data;
              },
              async close() {
                files.set(chosenPath, next);
                vaultLocked = true;
              },
              async abort() {},
            };
          },
          async remove() {
            files.delete(chosenPath);
          },
        } as unknown as FileSystemFileHandle;
      },
    });

    expect(wrote).toBe(false);
    expect(files.get(chosenPath)).toBe(previous);
  });

  it("restores an existing entry file when the export write fails", async () => {
    const chosenPath = "chosen-entries.json";
    const previous = "previous-export\n";
    const files = new Map<string, string>([[chosenPath, previous]]);

    await expect(
      writeEntryFile('{"version":1,"entries":[]}\n', () => true, {
        async showSaveFilePicker() {
          return {
            async getFile() {
              return new File([files.get(chosenPath) ?? ""], chosenPath);
            },
            async createWritable() {
              files.set(chosenPath, "");
              let next = "";
              return {
                async write(data: string) {
                  if (data !== previous) {
                    throw new Error("disk full");
                  }
                  next += data;
                },
                async close() {
                  files.set(chosenPath, next);
                },
                async abort() {},
              };
            },
            async remove() {
              files.delete(chosenPath);
            },
          } as unknown as FileSystemFileHandle;
        },
      }),
    ).rejects.toThrow("disk full");

    expect(files.get(chosenPath)).toBe(previous);
  });

  it("creates no entry file when the vault locks while the export is being saved", async () => {
    const chosenPath = "chosen-entries.json";
    const files = new Map<string, string>();
    let vaultLocked = false;

    const wrote = await writeEntryFile('{"version":1,"entries":[]}\n', () => !vaultLocked, {
      async showSaveFilePicker() {
        files.set(chosenPath, "");
        return {
          async getFile() {
            return new File([files.get(chosenPath) ?? ""], chosenPath);
          },
          async createWritable() {
            files.set(chosenPath, "");
            let next = "";
            return {
              async write(data: string) {
                next += data;
              },
              async close() {
                files.set(chosenPath, next);
                vaultLocked = true;
              },
              async abort() {
                // Chrome does not restore bytes truncated by createWritable.
              },
            };
          },
          async remove() {
            files.delete(chosenPath);
          },
        } as unknown as FileSystemFileHandle;
      },
    });

    expect(wrote).toBe(false);
    expect(files.has(chosenPath)).toBe(false);
  });
});
