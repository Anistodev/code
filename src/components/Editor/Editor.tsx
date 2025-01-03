import { Component, createEffect, createSignal, Show } from "solid-js";
import KeybindListener from "../KeybindListener";
import ChromaKeyVideo from "../experiments/ChromaKeyVideo";
import { useProject } from "../../context/projectContext";
import { useNavigate } from "@solidjs/router";

export const Editor: Component = () => {
  const [showVideo, setShowVideo] = createSignal(false);
  const navigate = useNavigate();

  const { project, selectedFile } = useProject();

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

  return (
    <div class="flex-1 flex flex-col bg-background">
      <KeybindListener actions={{
        ü: () => setShowVideo(true)
      }} />
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
        when={selectedFile != null}
        fallback={
          <div class="flex items-center justify-center h-96 flex-col gap-4">
            <p class="text-zinc-400 text-lg font-medium">No file selected</p>
            <p class="text-zinc-500 text-sm">Select a file to start editing</p>
          </div>
        }
      >
        <div class="text-text font-outfit p-4">
          <h2 class="text-lg font-medium mb-4">{selectedFile}</h2>
          <pre class="whitespace-pre-wrap">{JSON.stringify(selectedFile)}</pre>
        </div>
      </Show>
    </div>
  );
};
