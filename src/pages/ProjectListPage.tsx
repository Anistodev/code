import { Component, createSignal, onMount, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { createStore } from "solid-js/store";
import { WindowControls } from "../components/WindowControls";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ProjectSystem, type ProjectConfig } from "../lib/projectSystem";
import { documentDir } from "@tauri-apps/api/path";
import { mkdir, BaseDirectory } from "@tauri-apps/plugin-fs";
import { useProject } from "../context/projectContext";
import Stepper from "../components/ui/Stepper";
import FocusModal from "../components/ui/FocusModal";

const ProjectListPage: Component = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = createSignal<ProjectConfig[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = createSignal(false);
  const [projectDirPath, setProjectDirPath] = createSignal("");
  const { setProject } = useProject();

  const [newProject, setNewProject] = createStore({
    name: "",
    description: "",
  });

  onMount(async () => {
    const dir = await documentDir();
    const projectsDir = dir + "\\anistoprojects";

    try {
      await mkdir("anistoprojects", { baseDir: BaseDirectory.Document });
    } catch (error) {
      // Directory might already exist, that's fine
    }

    setProjectDirPath(projectsDir);
    console.log(projectsDir);
    await loadProjects();
  });

  const loadProjects = async () => {
    try {
      const loadedProjects = await ProjectSystem.getProjectsFromDir(
        projectDirPath()
      );
      setProjects(loadedProjects);
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name) return;

    try {
      const projectPath =
        projectDirPath() + "\\" + newProject.name.replace(/\s+/g, "_");
      await ProjectSystem.createProject(
        projectPath,
        newProject.name,
        newProject.description
      );
      const createdProject = await ProjectSystem.loadProject(projectPath);
      setProject(createdProject);
      setCreateModalOpen(false);
      navigate("/editor");
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleLoadProject = async (projectPath: string) => {
    try {
      const project = await ProjectSystem.loadProject(projectPath);
      setProject(project);
      localStorage.setItem("currentProject", JSON.stringify(project));
      localStorage.setItem("currentRoute", "/editor");
      navigate("/editor");
    } catch (error) {
      console.error("Failed to load project:", error);
    }
  };

  const appWindow = getCurrentWindow();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch (error) {
      return dateStr;
    }
  };

  return (
    <div class="flex flex-col font-outfit h-screen">
      <header
        class="h-[30px] bg-secondary flex items-center select-none border-b border-zinc-800"
        data-tauri-drag-region
      >
        <div class="text-text text-md px-[0.6rem]">Anisto</div>
        <WindowControls appWindow={appWindow} />
      </header>

      <div class="flex flex-1">
        <main class="flex-1 overflow-y-auto">
          <div class="flex flex-col p-8 max-w-6xl mx-auto">
            <div class="flex justify-between items-center mb-8">
              <div>
                <h1 class="text-3xl font-medium text-text">Projects</h1>
                <p class="text-zinc-400 mt-1">
                  Create a new project or select an existing one
                </p>
              </div>
              <Button
                onClick={() => setCreateModalOpen(true)}
                variant="secondary"
              >
                New Project
              </Button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <For each={projects()}>
                {(project) => (
                  <div class="bg-primary p-4 border border-zinc-800">
                    <h3 class="text-lg font-medium text-text">
                      {project.name}
                    </h3>
                    <p class="text-zinc-400 text-sm mt-1">
                      {project.description || "No description"}
                    </p>
                    <div class="mt-2 text-xs text-zinc-500">
                      Created: {formatDate(project.created_at)}
                    </div>
                    <div class="mt-4 flex justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleLoadProject(
                            projectDirPath() +
                              "\\" +
                              project.name.replace(/\s+/g, "_")
                          )
                        }
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
                <p class="text-zinc-500 text-sm mt-1">
                  Create your first project to get started
                </p>
              </div>
            </Show>

            <FocusModal
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
                    onInput={(e) =>
                      setNewProject({
                        ...newProject,
                        name: e.currentTarget.value,
                      })
                    }
                    size="full"
                    required
                  />
                </div>
                <div class="mb-4">
                  <label class="block text-sm text-text mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newProject.description}
                    onInput={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.currentTarget.value,
                      })
                    }
                    class="w-full bg-primary text-text p-2 border border-zinc-800 focus:outline-none"
                    rows={3}
                  />
                </div>
                <Button onClick={handleCreateProject}>Create Project</Button>

                <Stepper
                steps={[
                  {
                    id: "step1",
                    label: "Step 1",
                    content: <div>Step 1 content</div>,
                  },
                  {
                    id: "step2",
                    label: "Step 2",
                    content: <div>Step 2 content</div>,
                  },
                ]}
                onStepChange={(stepId) =>
                  console.log("Step changed to:", stepId)
                }
                onFinish={() => console.log("Stepper completed!")}
              />
              </div>
            </FocusModal>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectListPage;
