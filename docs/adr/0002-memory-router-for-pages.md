# Pages live in a React Router memory history

Side-panel navigation is a React Router memory history. The session store keeps the vault, the unlocked key, and lock state. The panel has no shareable URL, and entry data is already in that store, so a memory history replaces the old `screen` switch without putting secrets in an address bar. TanStack Router would add typed loaders this panel does not use.

Three regions never share a back stack: first-time setup when no vault exists, unlock when a vault is locked, and home plus the settings pages that are reachable today after unlock. Lock, idle lock, and system-screen lock clear that history so Back cannot open an unlocked page. Creating and editing an entry stays inside home.

Consequences: route params must not carry passwords or the in-memory key. The unlinked general and shortcuts screens stay unrouted.
