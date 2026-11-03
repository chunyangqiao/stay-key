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

type SaveHandleOptions = {
  lastModified?: number;
  onWritable?: () => void;
  onWrite?: (data: string) => void;
  onClose?: () => void;
};

function saveHandle(
  files: Map<string, string>,
  path: string,
  options: SaveHandleOptions = {},
): FileSystemFileHandle {
  return {
    async getFile() {
      return new File(
        [files.get(path) ?? ""],
        path,
        options.lastModified === undefined ? undefined : { lastModified: options.lastModified },
      );
    },
    async createWritable() {
      // Chrome truncates the chosen file when the writable opens.
      files.set(path, "");
      options.onWritable?.();
      let next = "";
      return {
        async write(data: string) {
          options.onWrite?.(data);
          next += data;
        },
        async close() {
          files.set(path, next);
          options.onClose?.();
        },
        async abort() {
          // Chrome does not restore bytes truncated by createWritable.
        },
      };
    },
    async remove() {
      files.delete(path);
    },
  } as unknown as FileSystemFileHandle;
}

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
        return saveHandle(files, chosenPath);
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
        return saveHandle(files, chosenPath, {
          onWritable() {
            vaultLocked = true;
          },
        });
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
        return saveHandle(files, chosenPath, {
          // The file was already empty before this save, so its timestamp is earlier.
          lastModified: 0,
          onWritable() {
            vaultLocked = true;
          },
        });
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
        return saveHandle(files, chosenPath, {
          onWrite() {
            vaultLocked = true;
          },
        });
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
        return saveHandle(files, chosenPath, {
          // The file was already empty before this save, so its timestamp is earlier.
          lastModified: 0,
          onWrite() {
            vaultLocked = true;
          },
        });
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
        return saveHandle(files, chosenPath, {
          onWritable() {
            vaultLocked = true;
          },
        });
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
        return saveHandle(files, chosenPath, {
          onWrite() {
            vaultLocked = true;
          },
        });
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
        return saveHandle(files, chosenPath, {
          onClose() {
            vaultLocked = true;
          },
        });
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
          return saveHandle(files, chosenPath, {
            onWrite(data) {
              if (data !== previous) {
                throw new Error("disk full");
              }
            },
          });
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
        return saveHandle(files, chosenPath, {
          onClose() {
            vaultLocked = true;
          },
        });
      },
    });

    expect(wrote).toBe(false);
    expect(files.has(chosenPath)).toBe(false);
  });

  it("keeps an existing empty entry file written after export was clicked", async () => {
    const chosenPath = "chosen-entries.json";
    const files = new Map<string, string>([[chosenPath, ""]]);
    let vaultLocked = false;

    const wrote = await writeEntryFile('{"version":1,"entries":[]}\n', () => !vaultLocked, {
      async showSaveFilePicker() {
        const touchedAt = Date.now();
        await new Promise((resolve) => {
          setTimeout(resolve, 1_500);
        });
        vaultLocked = true;
        return saveHandle(files, chosenPath, {
          lastModified: touchedAt,
        });
      },
    });

    expect(wrote).toBe(false);
    expect(files.has(chosenPath)).toBe(true);
    expect(files.get(chosenPath)).toBe("");
  });

  it("keeps an existing empty entry file when the vault locks after the file is chosen", async () => {
    const chosenPath = "chosen-entries.json";
    const files = new Map<string, string>([[chosenPath, ""]]);
    let vaultLocked = false;

    const wrote = await writeEntryFile('{"version":1,"entries":[]}\n', () => !vaultLocked, {
      async showSaveFilePicker() {
        vaultLocked = true;
        return saveHandle(files, chosenPath, {
          // The file was already empty before this save, so its timestamp is earlier.
          lastModified: 0,
        });
      },
    });

    expect(wrote).toBe(false);
    expect(files.has(chosenPath)).toBe(true);
    expect(files.get(chosenPath)).toBe("");
  });

  it("keeps an existing empty entry file when the vault locks while the export is being saved", async () => {
    const chosenPath = "chosen-entries.json";
    const files = new Map<string, string>([[chosenPath, ""]]);
    let vaultLocked = false;

    const wrote = await writeEntryFile('{"version":1,"entries":[]}\n', () => !vaultLocked, {
      async showSaveFilePicker() {
        return saveHandle(files, chosenPath, {
          // The file was already empty before this save, so its timestamp is earlier.
          lastModified: 0,
          onClose() {
            vaultLocked = true;
          },
        });
      },
    });

    expect(wrote).toBe(false);
    expect(files.has(chosenPath)).toBe(true);
    expect(files.get(chosenPath)).toBe("");
  });

  it("throws when restoring the entry file fails after the export write fails", async () => {
    const chosenPath = "chosen-entries.json";
    const previous = "previous-export\n";
    const files = new Map<string, string>([[chosenPath, previous]]);

    await expect(
      writeEntryFile('{"version":1,"entries":[]}\n', () => true, {
        async showSaveFilePicker() {
          return saveHandle(files, chosenPath, {
            onWrite(data) {
              if (data === previous) {
                throw new Error("restore failed");
              }
              throw new Error("disk full");
            },
          });
        },
      }),
    ).rejects.toThrow("restore failed");

    expect(files.get(chosenPath)).toBe("");
  });
});
