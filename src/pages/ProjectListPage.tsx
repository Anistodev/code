import { Component, createSignal, onMount, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { type Project } from "../lib/projectManagment";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/Modal";
import { useProject } from "../context/projectProvider";
import { createStore } from "solid-js/store";
import { WindowControls } from "../components/WindowControls";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ProjectSystem } from "../lib/projectSystem";
import { documentDir } from '@tauri-apps/api/path';
import { mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';

const ProjectListPage: Component = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = createSignal<Project[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = createSignal(false);
  const [projectDirPath, setProjectDirPath] = createSignal("");

  const [_, { setProject }] = useProject();

  const [newProject, setNewProject] = createStore({
    name: "",
    description: ""
  });

  onMount(async () => {
    const dir = await documentDir();

    if (!dir) {
      await mkdir('anistoprojects', { baseDir: BaseDirectory.Document });
    }
  
    setProjectDirPath(await documentDir() + "\\anistoprojects");
    
    await loadProjects();
  });

  const loadProjects = async () => {
    const loadedProjects: any = await ProjectSystem.getProjectsFromDir(projectDirPath());
    setProjects(loadedProjects);
  };

  const handleCreateProject = async () => {
    if (!newProject.name) return;

    const project = await ProjectSystem.createProject(projectDirPath() + "\\" + newProject.name.replace(/\s+/g, "_"), newProject.name, newProject.description);
    setProject(project);
    setCreateModalOpen(false);
    navigate("/editor");
  };

  const handleLoadProject = async (projectId: string) => {
    const project = await ProjectSystem.loadProject(projectId);
    if ("error" in project) return;
    setProject(project);
    console.log(project);
    navigate("/editor");
  };

  const appWindow = getCurrentWindow();

  return (
    <div class="flex flex-col font-outfit h-screen">
    {/* App Header */}
    <header
      class="h-[30px] bg-secondary flex items-center select-none border-b border-zinc-800"
      data-tauri-drag-region
    >
      <div class="text-text text-md px-[0.6rem]">Anisto</div>

      {/* Window Controls */}
      <WindowControls appWindow={appWindow} />
    </header>

    {/* Main Content */}
    <div class="flex flex-1">
    

      {/* Main Content Area */}
      <main class="flex-1 overflow-y-auto">
      <div class="flex flex-col p-8 max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-medium text-text">Projects</h1>
          <p class="text-zinc-400 mt-1">Create a new project or select an existing one</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} variant="secondary">New Project</Button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <For each={projects()}>
          {(project) => (
            <div class="bg-primary p-4 border border-zinc-800">
              <h3 class="text-lg font-medium text-text">{project.name}</h3>
              <p class="text-zinc-400 text-sm mt-1">{project.description || "No description"}</p>
              <div class="mt-2 text-xs text-zinc-500">
                Created: {new Date(project.created_at).toLocaleDateString()}
              </div>
              <div class="mt-4 flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleLoadProject(projectDirPath() + "\\" + project.name.replace(/\s+/g, "_"))}
                >
                  Open Project
                </Button>
              </div>
            </div>
          )}
        </For>
      </div>

      <Show when={projects().length === 0}>
        <div class="text-center py-12">
          <p class="text-zinc-400">No projects yet</p>
          <p class="text-zinc-500 text-sm mt-1">Create your first project to get started</p>
        </div>
      </Show>

      <Modal
        isOpen={isCreateModalOpen()}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Project"
      >
        <div class="p-4">
          <div class="mb-4">
            <Input
              type="text"
              label="Project Name"
              value={newProject.name}
              onInput={(e) => setNewProject({ ...newProject, name: e.currentTarget.value })}
              size="full"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm text-text mb-1">Description (optional)</label>
            <textarea
              value={newProject.description}
              onInput={(e) => setNewProject({ ...newProject, description: e.currentTarget.value })}
              class="w-full bg-primary text-text p-2 border border-zinc-800 focus:outline-none"
              rows={3}
            />
          </div>
          <Button onClick={handleCreateProject}>Create Project</Button>
        </div>
      </Modal>
    </div>
      </main>
    </div>
  </div>
  );
};

export default ProjectListPage; 