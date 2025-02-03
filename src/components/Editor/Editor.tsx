import { Component, createEffect, createSignal, For, Show } from "solid-js";
import KeybindListener from "../KeybindListener";
import ChromaKeyVideo from "../experiments/ChromaKeyVideo";
import { useProject } from "../../context/projectContext";
import { A, useNavigate } from "@solidjs/router";
import { invoke } from "@tauri-apps/api/core";
import Button from "../ui/Button";

export const Editor: Component = () => {
  const [showVideo, setShowVideo] = createSignal(false);
  const navigate = useNavigate();

  const { project, getSelectedFile } = useProject();

  const [content, setContent] = createSignal<any>(null);

  createEffect(() => {
    if (showVideo()) {
      setTimeout(() => {
        setShowVideo(false);
      }, 18000);
    }
  });

  createEffect(() => {
    if (project == null) {
      navigate("/");
    }
  });

  createEffect(async () => {
    const content = await invoke("read_msg_file", {
      path: `${project?.path}\\${getSelectedFile()}`,
    });
    setContent(content);
  });

  return (
    <div class="flex-1 flex flex-col bg-background">
      <KeybindListener
        actions={{
          ü: () => setShowVideo(true),
        }}
      />
      <Show when={showVideo()}>
        <div class="z-50 absolute top-0 left-0">
          <ChromaKeyVideo
            src="/videos/joke.mov"
            colorToRemove=""
            smoothness={0}
            similarity={0.7}
            class="w-screen h-screen"
            muted={false}
          />
        </div>
      </Show>
      <Show
        when={getSelectedFile() != null || content() != null}
        fallback={
          <div class="flex items-center justify-center h-96 flex-col gap-4">
            <p class="text-zinc-400 text-lg font-medium">No file selected</p>
            <p class="text-zinc-500 text-sm">Select a file to start editing</p>
          </div>
        }
      >
        <div class="text-text font-outfit px-2">
          <div class="overflow-y-auto max-h-96">
            <Show
              when={content().length > 0}
              fallback={
                <div class="flex flex-col items-center justify-center h-32">
                  <p class="text-zinc-400">No messages found in this file</p>
                  <div class="flex justify-center">
                    <Button variant="secondary">Add message</Button>
                  </div>
                </div>
              }
            >
              <For each={content()}>
                {(line) => (
                  <div class="flex justify-between bg-primary border border-zinc-800 p-2 my-2">
                    <p class="self-center">{line.header.message_id}</p>

                    <div>
                      <A
                        href={
                          "/editor/event-editor/" +
                          line.header.message_id.slice(4)
                        }
                      >
                        <Button size="sm" variant="secondary">
                          Edit
                        </Button>
                      </A>
                    </div>
                  </div>
                )}
              </For>
              <div class="flex justify-center">
                <Button variant="secondary">Add message</Button>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
};
