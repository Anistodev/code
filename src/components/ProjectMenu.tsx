import { Match, Show, Switch } from "solid-js";

interface ProjectMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  menu: string;
}

export function ProjectMenu(props: ProjectMenuProps) {
  return (
    <div class="relative">
      <button
        onClick={props.onToggle}
        class="text-text hover:bg-primary px-2 py-0.5 transition-colors"
      >
        Project
      </button>

      <Show when={props.isOpen}>
        <Switch>
          <Match when={props.menu === "project"}>
            <div class="fixed z-50 bg-secondary border border-zinc-800 shadow-lg py-1">
              <button class="w-full px-4 py-1.5 disabled:opacity-50 text-sm text-text disabled:hover:bg-secondary hover:bg-primary text-left">
                Close project
              </button>
            </div>
          </Match>
        </Switch>
      </Show>
    </div>
  );
}
