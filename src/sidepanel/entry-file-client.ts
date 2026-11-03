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

const PICKER_CREATE_SKEW_MS = 1000;

function isFileCreatedForThisSave(
  previous: string,
  lastModified: number,
  pickerReturnedAt: number,
): boolean {
  return previous.length === 0 && lastModified >= pickerReturnedAt - PICKER_CREATE_SKEW_MS;
}

function canRemove(
  handle: FileSystemFileHandle,
): handle is FileSystemFileHandle & { remove(): Promise<void> } {
  return "remove" in handle && typeof handle.remove === "function";
}

export function isPickerAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export async function readEntryFile(): Promise<string> {
  const picker: PickerWindow = window;
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

  const pickerReturnedAt = Date.now();
  const existing = await handle.getFile();
  const previous = await existing.text();
  if (!stillCurrent()) {
    await revertUnfinishedSave(handle, previous, existing.lastModified, pickerReturnedAt);
    return false;
  }

  const writable = await handle.createWritable();
  try {
    if (!stillCurrent()) {
      await writable.abort();
      await revertUnfinishedSave(handle, previous, existing.lastModified, pickerReturnedAt);
      return false;
    }
    await writable.write(contents);
    if (!stillCurrent()) {
      await writable.abort();
      await revertUnfinishedSave(handle, previous, existing.lastModified, pickerReturnedAt);
      return false;
    }
    await writable.close();
    if (!stillCurrent()) {
      await revertUnfinishedSave(handle, previous, existing.lastModified, pickerReturnedAt);
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

async function revertUnfinishedSave(
  handle: FileSystemFileHandle,
  previous: string,
  lastModified: number,
  pickerReturnedAt: number,
): Promise<void> {
  if (isFileCreatedForThisSave(previous, lastModified, pickerReturnedAt)) {
    if (!canRemove(handle)) {
      throw new Error("Save picker cannot remove an unfinished entry file");
    }
    await handle.remove();
    return;
  }
  await restorePrevious(handle, previous);
}

async function restorePrevious(handle: FileSystemFileHandle, previous: string): Promise<void> {
  const restoring = await handle.createWritable();
  await restoring.write(previous);
  await restoring.close();
}
