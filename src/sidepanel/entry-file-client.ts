import { ENTRY_FILE_NAME } from "@/shared/entries/entry-file";

type JsonPickerType = {
  description: string;
  accept: Record<string, string[]>;
};

type SavePicker = {
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    types?: JsonPickerType[];
  }) => Promise<FileSystemFileHandle>;
};

type PickerWindow = Window & {
  showOpenFilePicker?: (options?: {
    multiple?: boolean;
    types?: JsonPickerType[];
  }) => Promise<FileSystemFileHandle[]>;
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    types?: JsonPickerType[];
  }) => Promise<FileSystemFileHandle>;
};

const jsonPickerType: JsonPickerType = {
  description: "JSON",
  accept: { "application/json": [".json"] },
};

function isFileCreatedForThisSave(
  previous: string,
  lastModified: number,
  saveStartedAt: number,
): boolean {
  return previous.length === 0 && lastModified >= saveStartedAt;
}

async function discardEmptyFile(
  handle: FileSystemFileHandle,
  saveStartedAt: number,
): Promise<void> {
  const existing = await handle.getFile();
  const previous = await existing.text();
  if (!isFileCreatedForThisSave(previous, existing.lastModified, saveStartedAt)) {
    return;
  }
  if (!canRemove(handle)) {
    throw new Error("Save picker cannot remove an unfinished entry file");
  }
  await handle.remove();
}

function canRemove(
  handle: FileSystemFileHandle,
): handle is FileSystemFileHandle & { remove(): Promise<void> } {
  return "remove" in handle && typeof handle.remove === "function";
}

function pickerWindow(): PickerWindow {
  return window;
}

export function isPickerAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export async function readEntryFile(): Promise<string> {
  const picker = pickerWindow();
  if (typeof picker.showOpenFilePicker !== "function") {
    throw new Error("Open picker is unavailable");
  }

  const [handle] = await picker.showOpenFilePicker({
    multiple: false,
    types: [jsonPickerType],
  });
  const file = await handle.getFile();
  return file.text();
}

export async function writeEntryFile(
  contents: string,
  stillCurrent: () => boolean,
  picker: SavePicker | Window,
): Promise<boolean> {
  const saveStartedAt = Date.now();
  if (!stillCurrent()) {
    return false;
  }
  if (!("showSaveFilePicker" in picker) || typeof picker.showSaveFilePicker !== "function") {
    throw new Error("Save picker is unavailable");
  }

  let handle: FileSystemFileHandle;
  try {
    handle = await picker.showSaveFilePicker({
      suggestedName: ENTRY_FILE_NAME,
      types: [jsonPickerType],
    });
  } catch (error) {
    if (isPickerAbort(error) || !stillCurrent()) {
      return false;
    }
    throw error;
  }

  if (!stillCurrent()) {
    await discardEmptyFile(handle, saveStartedAt);
    return false;
  }

  const existing = await handle.getFile();
  const previous = await existing.text();
  const writable = await handle.createWritable();
  try {
    if (!stillCurrent()) {
      // A file created for this save is stamped during the attempt. An older empty file already existed.
      if (isFileCreatedForThisSave(previous, existing.lastModified, saveStartedAt)) {
        await writable.abort();
        await discardEmptyFile(handle, saveStartedAt);
        return false;
      }
      await writable.write(previous);
      await writable.close();
      return false;
    }
    await writable.write(contents);
    if (!stillCurrent()) {
      await writable.abort();
      if (isFileCreatedForThisSave(previous, existing.lastModified, saveStartedAt)) {
        await discardEmptyFile(handle, saveStartedAt);
        return false;
      }
      await restorePrevious(handle, previous);
      return false;
    }
    await writable.close();
    if (!stillCurrent()) {
      if (isFileCreatedForThisSave(previous, existing.lastModified, saveStartedAt)) {
        if (!canRemove(handle)) {
          throw new Error("Save picker cannot remove an unfinished entry file");
        }
        await handle.remove();
        return false;
      }
      await restorePrevious(handle, previous);
      return false;
    }
    return true;
  } catch (error) {
    try {
      await writable.abort();
    } catch {
      // Report the write error. Abort is only here to avoid leaving a partial file.
    }
    await restorePrevious(handle, previous);
    throw error;
  }
}

async function restorePrevious(handle: FileSystemFileHandle, previous: string): Promise<void> {
  const restoring = await handle.createWritable();
  await restoring.write(previous);
  await restoring.close();
}
