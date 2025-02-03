import { A } from "@solidjs/router";
import { Window } from "@tauri-apps/api/window";
import { Maximize, Settings } from "lucide-solid";

interface WindowControlsProps {
  appWindow: Window;
}

export function WindowControls(props: WindowControlsProps) {
  return (
    <div class="flex absolute right-0">
      <button
        class="text-text hover:bg-primary transition-colors py-0.5 px-2"
        title="Settings"
      >
        <A href="/editor/settings" class="size-4">
          <Settings class="size-4" />
        </A>
      </button>
      <button
        onClick={() => props.appWindow?.minimize()}
        class="text-text hover:bg-primary px-2 py-0.5 transition-colors"
      >
        —
      </button>
      <button
        onClick={async () => await props.appWindow?.toggleMaximize()}
        class="text-text hover:bg-primary px-2 py-0.5 transition-colors"
      >
        <Maximize class="size-4" />
      </button>
      <button
        onClick={() => props.appWindow?.close()}
        class="text-text hover:bg-primary px-2 py-0.5 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
