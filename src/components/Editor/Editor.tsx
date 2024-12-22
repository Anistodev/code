import { Component, For, Show } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import Button from "../ui/Button";
import { MessageSquareMore } from "lucide-solid";

export const Editor: Component = () => {
  const navigate = useNavigate();

  return (
    <div class="flex-1 flex flex-col bg-background">
      <Show
        when={true}
        fallback={
          <div class="flex-1 flex items-center justify-center flex-col gap-4">
            <p class="text-zinc-400 text-lg font-medium">No file selected</p>
            <p class="text-zinc-500 text-sm">Select a file to start editing</p>
            <A href="/settings" class="text-zinc-500 text-sm">
              Or go to settings idk
            </A>
          </div>
        }
      >
        <div class="text-text font-outfit m-2">
          <For each={["BTTL_0", "BTTL_1", "BTTL_2"]}>
            {(event) => (
              <div class="relative flex bg-primary border-zinc-800 border mb-2 p-3">
                <div class="flex gap-1">
                  <MessageSquareMore />
                  <p class="text-md">{event}</p>
                </div>

                <div class="absolute self-center right-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/event-editor/${event}`)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </For>

          <div class="flex justify-center">
            <Button variant="secondary">Add Event</Button>
          </div>
        </div>
      </Show>
    </div>
  );
};
