import { useSessionStore } from "@/shared/session-store";

import { SettingsHeader, SettingsNavRow } from "./settings-shell";

export function SettingsHubScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);

  return (
    <div className="flex flex-col gap-3">
      <SettingsHeader title="设置" backTo="home" onBack={setScreen} />
      <div className="flex flex-col gap-2">
        <SettingsNavRow
          title="通用"
          description="外观 · 语言"
          onClick={() => setScreen("settings-general")}
        />
        <SettingsNavRow
          title="快捷操作"
          description="打开面板的快捷键"
          onClick={() => setScreen("settings-shortcuts")}
        />
        <SettingsNavRow
          title="安全"
          description="空闲锁定 · 剪贴板清除"
          onClick={() => setScreen("settings-security")}
        />
        <SettingsNavRow
          title="关于"
          description="版本 · 反馈"
          onClick={() => setScreen("settings-about")}
        />
      </div>
    </div>
  );
}
