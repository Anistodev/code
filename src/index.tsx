/* @refresh reload */
import { render } from "solid-js/web";
import { Route, Router, useNavigate } from "@solidjs/router";
import App from "./App";
import { ProjectProvider, useProject } from "./context/projectContext";
import { PortraitConfigProvider } from "./context/portraitConfigProvider";
import "./App.css";
import SettingsPage from "./pages/SettingsPage";
import EventEditor from "./pages/EventEditor";
import { createEffect, createSignal } from "solid-js";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { WindowControls } from "./components/WindowControls";
import { ProjectMenu } from "./components/ProjectMenu";
import FileTree from "./components/FileTree";
import KeybindListener from "./components/KeybindListener";
import ProjectListPage from "./pages/ProjectListPage";
import { ProjectSystem } from "./lib/projectSystem";
import Button from "./components/ui/Button";
import { FolderPlus, FilePlus } from "lucide-solid";
import Modal from "./components/Modal";
import Input from "./components/ui/Input";
import { invoke } from "@tauri-apps/api/core";

interface FileTreeItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileTreeItem[];
}

export interface RustFileTreeItem {
  name: string;
  path: string;
  is_dir: boolean;
  children?: RustFileTreeItem[];
}

const buildFileTree = (files: RustFileTreeItem[]): FileTreeItem[] => {
  return files.map(file => ({
    id: file.path,
    name: file.name,
    type: file.is_dir ? 'folder' : 'file',
    children: file.children ? buildFileTree(file.children) : undefined
  }));
};

// Root Layout Component
function RootLayout(props: any) {
  const appWindow = getCurrentWindow();
  const { project, setProject, setSelectedFile } = useProject();
  const navigate = useNavigate();
  const [menubar, setMenubar] = createSignal("");
  const [hidden, setHidden] = createSignal(false);
  const [files, setFiles] = createSignal<FileTreeItem[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = createSignal(false);
  const [newFileName, setNewFileName] = createSignal("");
  const [isFolder, setIsFolder] = createSignal(false);

  const loadFiles = async () => {
    if (!project) return;
    
    try {
      const fileList = await ProjectSystem.listFiles(project.path);
      const fileTree = buildFileTree(fileList);
      setFiles(fileTree);
    } catch (error) {
      console.error("Failed to load files:", error);
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName() || !project) return;

    try {
      await ProjectSystem.createFile(project.path, newFileName(), isFolder());
      await loadFiles();
      setCreateModalOpen(false);
      setNewFileName("");
    } catch (error) {
      console.error("Failed to create file:", error);
    }
  };

  createEffect(() => {
    // Try to load the last project and route from localStorage
    const savedProject = localStorage.getItem("currentProject");
    
    if (savedProject) {
      try {
        const parsed = JSON.parse(savedProject);
        ProjectSystem.loadProject(parsed.path)
          .then((loadedProject) => {
            setProject(loadedProject);
            loadFiles();
            // // Navigate to saved route or default to /editor
            // if (savedRoute) {
            //   navigate(savedRoute);
            // }
          })
          .catch(console.error);
      } catch (error) {
        console.error("Failed to load saved project:", error);
      }
    } else {
      // If no saved project, redirect to project list
      navigate("/");
    }
  });

  // Add effect to save current route
  createEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/editor')) {
      localStorage.setItem("currentRoute", currentPath);
    }
  });

  const handleFileSelect = async (file: FileTreeItem) => {
    setSelectedFile(file.name);
    const content = await invoke("read_msg_file", { path: `${project?.path}\\${file.name}` });
    console.log(content);
  };

  return (
    <div class="flex flex-col font-outfit h-screen">
      {/* App Header */}
      <header
        class="h-[30px] bg-secondary flex items-center select-none border-b border-zinc-800"
        data-tauri-drag-region
      >
        <div class="text-text text-md px-[0.6rem]">
          Anisto
        </div>

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
        <div class="bg-secondary h-full" hidden={hidden()}>
          <div class="h-full flex flex-col">
            <div class="p-2 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsFolder(true);
                  setCreateModalOpen(true);
                }}
                disabled={!project}
              >
                <FolderPlus class="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsFolder(false);
                  setCreateModalOpen(true);
                }}
                disabled={!project}
              >
                <FilePlus class="w-4 h-4" />
              </Button>
            </div>
            <div class="flex-1 overflow-y-auto">
              <FileTree onFileSelect={handleFileSelect} items={files()} />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main class="flex-1 overflow-y-auto">{props.children}</main>
      </div>

      {/* Create File Modal */}
      <Modal
        isOpen={isCreateModalOpen()}
        onClose={() => setCreateModalOpen(false)}
        title={`Create New ${isFolder() ? "Folder" : "File"}`}
      >
        <div class="p-4">
          <Input
            label={isFolder() ? "Folder Name" : "File Name"}
            value={newFileName()}
            onInput={(e) => setNewFileName(e.currentTarget.value)}
            size="full"
          />
          <div class="mt-4">
            <Button onClick={handleCreateFile}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

render(
  () => (
    <ProjectProvider>
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
