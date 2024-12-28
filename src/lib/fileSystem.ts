import { invoke } from "@tauri-apps/api/core";

export interface FileTreeItem {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileTreeItem[];
}

export interface Project {
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
  version: string;
  path: string;
}

interface ProjectResponse {
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  version: string;
}

export class FileSystem {
  static async listFiles(projectPath: string): Promise<string[]> {
    return await invoke("list_files", { projectPath });
  }

  static async createFile(projectPath: string, name: string, isFolder: boolean): Promise<void> {
    await invoke("create_file", { projectPath, name, isFolder });
  }

  static async loadProject(path: string): Promise<Project> {
    const project = await invoke<ProjectResponse>("load_project", { path });
    return {
      name: project.name,
      description: project.description,
      created_at: new Date(project.created_at),
      updated_at: new Date(project.updated_at),
      version: project.version,
      path
    };
  }

  static async isProjectDirectory(path: string): Promise<boolean> {
    return await invoke("is_project_directory", { path });
  }

  static async createProject(path: string, name: string, description?: string): Promise<void> {
    await invoke("create_project", { path, name, description });
  }
} 