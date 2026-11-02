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

const JSON_PICKER_TYPE: JsonPickerType = {
  description: "JSON",
  accept: { "application/json": [".json"] },
};

async function discardEmptyFile(handle: FileSystemFileHandle): Promise<void> {
  const existing = await handle.getFile();
  if (existing.size > 0) {
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
    return readWithInput();
  }

  try {
    const [handle] = await picker.showOpenFilePicker({
      multiple: false,
      types: [JSON_PICKER_TYPE],
    });
    const file = await handle.getFile();
    return file.text();
  } catch (error) {
    if (isPickerAbort(error)) {
      throw error;
    }
    return readWithInput();
  }
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
      types: [JSON_PICKER_TYPE],
    });
  } catch (error) {
    if (isPickerAbort(error) || !stillCurrent()) {
      return false;
    }
    throw error;
  }

  if (!stillCurrent()) {
    await discardEmptyFile(handle);
    return false;
  }

  const previous = await (await handle.getFile()).text();
  const writable = await handle.createWritable();
  try {
    if (!stillCurrent()) {
      if (previous.length === 0) {
        await writable.abort();
        await discardEmptyFile(handle);
        return false;
      }
      await writable.write(previous);
      await writable.close();
      return false;
    }
    await writable.write(contents);
    if (!stillCurrent()) {
      await writable.abort();
      if (previous.length === 0) {
        await discardEmptyFile(handle);
        return false;
      }
      const restoring = await handle.createWritable();
      await restoring.write(previous);
      await restoring.close();
      return false;
    }
    await writable.close();
    return true;
  } catch (error) {
    try {
      await writable.abort();
    } catch {
      // Report the write error. Abort is only here to avoid leaving a partial file.
    }
    throw error;
  }
}

function readWithInput(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    const fail = (error: unknown) => {
      input.remove();
      reject(error);
    };
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) {
        fail(abortError());
        return;
      }
      try {
        const text = await file.text();
        input.remove();
        resolve(text);
      } catch (error) {
        fail(error);
      }
    });
    input.addEventListener("cancel", () => {
      fail(abortError());
    });
    document.body.append(input);
    input.click();
  });
}

function abortError(): DOMException {
  return new DOMException("The user aborted a request.", "AbortError");
}
