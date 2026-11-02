# Entry files are plaintext JSON

Entries leave the vault as a plaintext JSON entry file so a person can batch-edit them and import them again. An encrypted bundle would stay inside Stay Key's PIN, which does not serve that interchange. The file holds `version` and entries (`host`, `username`, `password`, `tags`) only. Import and export run while the vault is unlocked. Export warns that locking the vault does not encrypt the file. Import merges: an exact match is skipped, anything else is appended, and entries absent from the file stay. An invalid file writes nothing.

Considered options: an encrypted file only Stay Key can read; a CSV of the same fields.

Consequences: the chosen file is a copy of passwords outside the vault. The user picks where it is saved. A host is the site string already stored on the entry, not a URL parsed into a hostname. If the vault locks before that write finishes, the export creates no file and the import leaves the vault unchanged.
