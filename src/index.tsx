/* @refresh reload */
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import App from "./App";
import { ProjectProvider } from "./context/projectProvider";
import { PortraitConfigProvider } from "./context/portraitConfigProvider";
import "./App.css";
import SettingsPage from "./pages/SettingsPage";
import EventEditor from "./pages/EventEditor";
import { createSignal } from "solid-js";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WindowControls } from "./components/WindowControls";
import { ProjectMenu } from "./components/ProjectMenu";
import FileTree from "./components/FileTree";
import KeybindListener from "./components/KeybindListener";
import ProjectListPage from "./pages/ProjectListPage";

// Root Layout Component
function RootLayout(props: any) {
  const appWindow = getCurrentWindow();
  const [menubar, setMenubar] = createSignal("");
  const [hidden, setHidden] = createSignal(false);

  const fileTree = [
    {
      id: "1",
      name: "EVENT_DATA",
      type: "folder" as const,
      children: [
        {
          id: "2",
          name: "MESSAGE",
          type: "folder" as const,
          children: [
            {
              id: "3",
              name: "E400",
              type: "folder" as const,
              children: [
                { id: "4", name: "E484_120", type: "file" as const },
                { id: "4", name: "E484_120", type: "file" as const },
                { id: "4", name: "E484_120", type: "file" as const },
                {
                  id: "4",
                  name: "E484_121",
                  type: "folder" as const,
                  children: [
                    { id: "4", name: "E484_120", type: "file" as const },
                    {
                      id: "4",
                      name: "E484_121",
                      type: "folder" as const,
                      children: [
                        { id: "4", name: "E484_120", type: "file" as const },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: "5",
              name: "E700",
              type: "folder" as const,
              children: [{ id: "6", name: "E790_001", type: "file" as const }],
            },
          ],
        },
      ],
    },
  ];

  return (
    <div class="flex flex-col font-outfit h-screen">
      {/* App Header */}
      <header
        class="h-[30px] bg-secondary flex items-center select-none border-b border-zinc-800"
        data-tauri-drag-region
      >
        <div class="text-text text-md px-[0.6rem]">Anisto</div>

        {/* Project Menu */}
        <ProjectMenu
          isOpen={menubar() === "project"}
          onToggle={() => setMenubar((m) => (m === "project" ? "" : "project"))}
        />

        {/* Window Controls */}
        <WindowControls appWindow={appWindow} />
      </header>

      {/* Main Content */}
      <div class="flex flex-1">
        <KeybindListener
          actions={{
            b: () => setHidden(!hidden()),
          }}
        />

        {/* File Tree Panel */}
        <div class="bg-secondary" hidden={hidden()}>
          <div class="h-fit">
            <FileTree items={fileTree} />
          </div>
        </div>

        {/* Main Content Area */}
        <main class="flex-1 overflow-y-auto">{props.children}</main>
      </div>
    </div>
  );
}

render(
  () => (
    <ProjectProvider project={null}>
      <PortraitConfigProvider>
        <Router>
          <Route path="/" component={ProjectListPage} />
          <Route path="/editor" component={RootLayout}>
            <Route path="/" component={App} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/event-editor/:eventId" component={EventEditor} />
          </Route>
        </Router>
      </PortraitConfigProvider>
    </ProjectProvider>
  ),
  document.getElementById("root") as HTMLElement
);
