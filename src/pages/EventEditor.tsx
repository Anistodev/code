import { Component } from "solid-js";
import { useParams } from "@solidjs/router";

const EventEditor: Component = () => {
  const params = useParams();

  return (
    <div class="flex flex-col">
      <main class="flex-1 bg-background p-1">
        <div class="text-text">Event editor content for {params.eventId}</div>
      </main>
    </div>
  );
};

export default EventEditor;
