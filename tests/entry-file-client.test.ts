import { describe, expect, it } from "vitest";

import { writeEntryFile } from "../src/sidepanel/entry-file-client";

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
