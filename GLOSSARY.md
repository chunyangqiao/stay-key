# Stay Key

Stay Key is a local password vault. It keeps website entries on this computer.

## Language

**Vault**:
The encrypted collection of entries kept on this computer. The interface calls this 保险库.
_Avoid_: database, account

**Entry**:
One saved record in the vault: a host, an account, a password, and that entry's tags. The interface calls this 条目.
_Avoid_: account (for the whole record), credential, login

**Host**:
The site string stored on an entry. The interface calls this 站点. Two hosts are the same only when those strings are the same.
_Avoid_: domain, URL, hostname

**Account**:
The username stored on an entry. The interface calls this 账号.
_Avoid_: entry, user

**Tag**:
A label attached to an entry. The interface calls this 标签.
_Avoid_: folder, group

**Entry file**:
A plaintext JSON document of entries. It has no PIN, no recovery question, and no vault settings.
_Avoid_: backup, vault file

**Export**:
Writing the vault's entries out as an entry file. An entry whose host, account, and password are all empty is left out.
_Avoid_: backup, sync

**Import**:
A merge of an entry file into the vault, written only after the user confirms it. An exact entry is skipped, an entry whose host, account, and password are all empty is left out, every other entry is added, and entries missing from the file stay.
_Avoid_: restore, replace, sync
