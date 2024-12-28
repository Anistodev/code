import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";
import { RustFileTreeItem } from "..";

export const projectConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  version: z.string(),
  path: z.string(),
});

export const fileAttributesSchema = z.object({
  lipsync: z.boolean().optional(),
  confidant_point: z.boolean().optional(),
  box_type: z.string().optional(),
  confidant_id: z.number().optional(),
  points_gained: z.number().optional(),
  model_id: z.number().optional(),
  character_name: z.string().optional(),
  character_checkbox: z.boolean().optional(),
});

export const projectFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  text: z.string(),
  output: z.string().optional(),
  attributes: fileAttributesSchema.optional(),
});

export type ProjectConfig = z.infer<typeof projectConfigSchema>;
export type ProjectFile = z.infer<typeof projectFileSchema>;

interface ProjectResponse {
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  version: string;
}

export class ProjectSystem {
  static async createProject(path: string, name: string, description?: string): Promise<void> {
    await invoke('create_project', { path, name, description });
  }

  static async loadProject(path: string): Promise<ProjectConfig> {
    const config = await invoke<ProjectResponse>('load_project', { path });
    return {
      name: config.name,
      description: config.description,
      created_at: config.created_at,
      updated_at: config.updated_at,
      version: config.version,
      path
    };
  }

  static async updateProject(path: string, config: ProjectConfig): Promise<void> {
    await invoke('update_project', { path, config });
  }

  static async isProjectDirectory(path: string): Promise<boolean> {
    return await invoke('is_project_directory', { path });
  }

  static async getProjectsFromDir(path: string): Promise<ProjectConfig[]> {
    const projects = await invoke<ProjectResponse[]>('get_projects_from_dir', { path });
    return projects.map(project => ({
      ...project,
      created_at: project.created_at,
      updated_at: project.updated_at,
      path: path + "\\" + project.name.replace(/\s+/g, "_")
    }));
  }

  static async listFiles(projectPath: string): Promise<RustFileTreeItem[]> {
    return await invoke("list_files", { projectPath });
  }

  static async createFile(projectPath: string, name: string, isFolder: boolean): Promise<void> {
    await invoke("create_file", { projectPath, name, isFolder });
  }
} 