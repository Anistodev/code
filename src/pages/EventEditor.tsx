import { Component, createEffect, createSignal, Show } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import Input from "../components/ui/Input";
import Dropdown from "../components/Dropdown";
import { BoxTypes, Icons } from "../utils/options";
import { IPreviewSettings, processCodePreview } from "../utils/helpers";
import { createStore } from "solid-js/store";
import Button from "../components/ui/Button";
import Modal from "../components/Modal";
import { useProject } from "../context/projectContext";
import { handleInsertIcons } from "../utils/strings";
import Popover from "../components/Popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/Accordion";

const EventEditor: Component = () => {
  const params = useParams();
  const [message, setMessage] = createSignal("");
  const [iconModal, setIconModal] = createSignal(false);
  const { project } = useProject();
  const navigate = useNavigate();

  createEffect(() => {
    if (project == null) {
      navigate("/");
    }
  });

  const [tempVar, setTempVar] = createSignal(null);

  const [previewSettings, setPreviewSettings] = createStore<IPreviewSettings>({
    msg_id: params.eventId,
    content: message(),
    boxType: "MSG",
  });

  return (
    <div class="flex flex-col">
      <main class="flex-1 bg-background font-outfit text-text p-1">
        <div class="absolute right-1">
          <div class="w-80">
            <Dropdown
              options={BoxTypes}
              label="Box type"
              value={previewSettings.boxType}
              onChange={(e) => setPreviewSettings({ boxType: e.toString() })}
            />
          </div>
        </div>

        <Input
          label="Message"
          onInput={(e) => {
            setMessage(e.currentTarget.value);
            setPreviewSettings({ content: e.currentTarget.value });
          }}
          onKeyPress={(e) => {
            if (e.code === "Enter") {
              setPreviewSettings({ content: message() + "[n]" });
            }
          }}
          value={previewSettings.content}
          class="w-[27rem]"
          placeholder="Write your message..."
        />
        <Popover
          class="z-0"
          align="center"
          trigger={<Button variant="secondary">+</Button>}
        >
          <div class="p-2 text-text font-outfit">
            <Button variant="secondary" onClick={() => setIconModal(true)}>
              Open insert menu
            </Button>
            <Button variant="secondary">New dialog</Button>
          </div>
        </Popover>

        <div class="bg-secondary text-text mt-2 p-1 w-fit">
          <code class="font-outfit">
            {JSON.stringify(previewSettings, null, 2)}
          </code>
        </div>

        <Accordion type="single" collapsible class="w-full">
  <AccordionItem value="item-1">
    <AccordionTrigger>First Item</AccordionTrigger>
    <AccordionContent>
      Content for first item
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Second Item</AccordionTrigger>
    <AccordionContent>
      Content for second item
    </AccordionContent>
  </AccordionItem>
</Accordion>

        <div class="absolute bottom-1 w-[50rem] max-h-[300px] overflow-y-auto bg-secondary text-text p-1">
          <p class="text-zinc-400 text-sm font-medium select-none">
            Live preview
          </p>
          <pre>
            <Show
              when={message()}
              fallback={<p class="text-zinc-400 text-sm">No text to preview</p>}
            >
              <code class="text-sm whitespace-pre-wrap break-words font-mono">
                {processCodePreview(previewSettings)}
              </code>
            </Show>
          </pre>
        </div>
      </main>

      <Modal
        isOpen={iconModal()}
        onClose={() => setIconModal(false)}
        title="Insert icon"
      >
        <div class="p-2">
          <Dropdown
            options={Icons}
            label="Icon"
            value={`${tempVar()}`}
            onChange={setTempVar}
          />

          <div class="absolute bottom-2 right-2">
            <Button
              variant="secondary"
              onClick={() => {
                handleInsertIcons(
                  setPreviewSettings,
                  setTempVar,
                  message,
                  tempVar
                );
                setIconModal(false);
              }}
            >
              Insert
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventEditor;
