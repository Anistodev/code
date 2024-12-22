import { invoke } from "@tauri-apps/api/core";
import { z } from "zod";

export const projectConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  version: z.string(),
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

export class ProjectSystem {
  static async createProject(path: string, name: string, description?: string): Promise<void> {
    await invoke('create_project', { path, name, description });
  }

  static async loadProject(path: string): Promise<ProjectConfig> {
    const config = await invoke<any>('load_project', { path });
    return {
      ...config,
      created_at: new Date(config.created_at),
      updated_at: new Date(config.updated_at),
    };
  }

  static async updateProject(path: string, config: ProjectConfig): Promise<void> {
    await invoke('update_project', { path, config });
  }

  static async isProjectDirectory(path: string): Promise<boolean> {
    return await invoke('is_project_directory', { path });
  }

  static async getProjectsFromDir(path: string): Promise<ProjectConfig[]> {
    return await invoke('get_projects_from_dir', { path });
  }
} 