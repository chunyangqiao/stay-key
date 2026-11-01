import { Info, Keyboard, Palette, Shield } from "lucide-react";

import { useSessionStore } from "@/shared/session-store";

import { SettingsHeader, SettingsNavCard } from "./settings-shell";

export function SettingsHubScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);

  return (
    <div className="flex flex-col gap-4">
      <SettingsHeader title="设置" backTo="home" onBack={setScreen} />
      <SettingsNavCard
        items={[
          {
            title: "通用",
            description: "外观 · 语言",
            icon: Palette,
            onClick: () => setScreen("settings-general"),
          },
          {
            title: "快捷操作",
            description: "打开面板的快捷键",
            icon: Keyboard,
            onClick: () => setScreen("settings-shortcuts"),
          },
          {
            title: "安全",
            description: "空闲锁定 · 剪贴板清除",
            icon: Shield,
            onClick: () => setScreen("settings-security"),
          },
          {
            title: "关于",
            description: "版本 · 反馈",
            icon: Info,
            onClick: () => setScreen("settings-about"),
          },
        ]}
      />
    </div>
  );
}
