import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import type { ProjectConfig } from "../lib/projectSystem";

interface ProjectContextState {
  project: ProjectConfig | null;
  setProject: (project: ProjectConfig | null) => void;
  selectedFile: string | null;
  setSelectedFile: (file: string | null) => void;
}

const ProjectContext = createContext<ProjectContextState>();

export function ProjectProvider(props: { children: any }) {
  const [state, setState] = createStore<{ project: ProjectConfig | null, selectedFile: string | null }>({
    project: null,
    selectedFile: null,
  });

  const store: ProjectContextState = {
    get project() {
      return state.project;
    },
    setProject(project: ProjectConfig | null) {
      setState({ project });
      if (project) {
        localStorage.setItem("currentProject", JSON.stringify({
          name: project.name,
          description: project.description,
          created_at: project.created_at,
          updated_at: project.updated_at,
          version: project.version,
          path: project.path
        }));
      } else {
        localStorage.removeItem("currentProject");
      }
    },
    get selectedFile() {
      return state.selectedFile;
    },
    setSelectedFile(file: string | null) {
      setState({ selectedFile: file });
    }
  };

  return (
    <ProjectContext.Provider value={store}>
      {props.children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
} 