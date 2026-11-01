import { Info, Keyboard, Palette, Shield } from "lucide-react";

import { useSessionStore } from "@/shared/session-store";

import { AppHeader } from "../components/app-header";
import { Screen, ScreenBody } from "../components/screen";
import { SettingsNavCard } from "./settings-shell";

export function SettingsHubScreen() {
  const setScreen = useSessionStore((state) => state.setScreen);

  return (
    <Screen>
      <AppHeader title="设置" onBack={() => setScreen("home")} />
      <ScreenBody>
        <SettingsNavCard
          items={[
            {
              title: "通用",
              description: "外观与语言",
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
              description: "空闲锁定与剪贴板",
              icon: Shield,
              onClick: () => setScreen("settings-security"),
            },
            {
              title: "关于",
              description: "版本与反馈",
              icon: Info,
              onClick: () => setScreen("settings-about"),
            },
          ]}
        />
      </ScreenBody>
    </Screen>
  );
}
