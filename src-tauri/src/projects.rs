use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::SystemTime;
use royal::Message;
use crate::models::{SerializedMessage, SerializedMessageFlags, SerializedMessageHeader, BoxType};

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectConfig {
    pub name: String,
    pub description: Option<String>,
    pub created_at: SystemTime,
    pub updated_at: SystemTime,
    pub version: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectFile {
    pub id: String,
    pub name: String,
    pub text: String,
    pub output: Option<String>,
    pub attributes: Option<FileAttributes>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileAttributes {
    pub lipsync: Option<bool>,
    pub confidant_point: Option<bool>,
    pub box_type: Option<String>,
    pub confidant_id: Option<i32>,
    pub points_gained: Option<i32>,
    pub model_id: Option<i32>,
    pub character_name: Option<String>,
    pub character_checkbox: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileTreeItem {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Option<Vec<FileTreeItem>>,
}

pub struct ProjectManager;

impl ProjectManager {
    fn get_project_config_path(project_path: &Path) -> PathBuf {
        project_path.join(".anisto").join("project.json")
    }

    pub fn create_project(path: &Path, name: &str, description: Option<String>) -> Result<(), String> {
        // Create .anisto directory
        let anisto_dir = path.join(".anisto");
        fs::create_dir_all(&anisto_dir).map_err(|e| e.to_string())?;

        // Create project config
        let config = ProjectConfig {
            name: name.to_string(),
            description,
            created_at: SystemTime::now(),
            updated_at: SystemTime::now(),
            version: env!("CARGO_PKG_VERSION").to_string(),
        };

        // Save project config
        let config_path = Self::get_project_config_path(path);
        let config_str = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
        fs::write(config_path, config_str).map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn load_project(path: &Path) -> Result<ProjectConfig, String> {
        let config_path = Self::get_project_config_path(path);
        let config_str = fs::read_to_string(config_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&config_str).map_err(|e| e.to_string())
    }

    pub fn update_project(path: &Path, config: ProjectConfig) -> Result<(), String> {
        let config_path = Self::get_project_config_path(path);
        let mut updated_config = config;
        updated_config.updated_at = SystemTime::now();
        
        let config_str = serde_json::to_string_pretty(&updated_config).map_err(|e| e.to_string())?;
        fs::write(config_path, config_str).map_err(|e| e.to_string())
    }

    pub fn is_project_directory(path: &Path) -> bool {
        Self::get_project_config_path(path).exists()
    }

    pub fn get_projects_from_dir(path: &Path) -> Vec<ProjectConfig> {
        let mut projects = Vec::new();
        for entry in fs::read_dir(path).unwrap() {
            let entry = entry.unwrap();
            if Self::is_project_directory(&entry.path()) {
                projects.push(Self::load_project(&entry.path()).unwrap());
            }
        }
        projects
    }

    pub fn create_file(project_path: &Path, name: &str, is_folder: bool) -> Result<(), String> {
        let target_path = project_path.join(name);
        
        if is_folder {
            fs::create_dir_all(&target_path).map_err(|e| e.to_string())?;
        } else {
            // Ensure the file has .msg extension
            let file_name = if !name.ends_with(".msg") {
                format!("{}.msg", name)
            } else {
                name.to_string()
            };
            let target_path = project_path.join(file_name);
            
            // Create an empty file
            fs::write(&target_path, "").map_err(|e| e.to_string())?;
        }

        Ok(())
    }

    pub fn list_files(project_path: &Path) -> Result<Vec<FileTreeItem>, String> {
        Self::list_files_recursive(project_path, project_path)
    }

    fn list_files_recursive(base_path: &Path, current_path: &Path) -> Result<Vec<FileTreeItem>, String> {
        let entries = fs::read_dir(current_path).map_err(|e| e.to_string())?;
        let mut items = Vec::new();

        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            let file_name = entry.file_name();
            let file_name = file_name.to_string_lossy().into_owned();
            
            // Skip .anisto directory and any other hidden files
            if !file_name.starts_with('.') {
                let relative_path = path.strip_prefix(base_path)
                    .map_err(|e| e.to_string())?
                    .to_string_lossy()
                    .into_owned();

                let is_dir = path.is_dir();
                let children = if is_dir {
                    Some(Self::list_files_recursive(base_path, &path)?)
                } else {
                    None
                };

                items.push(FileTreeItem {
                    name: file_name,
                    path: relative_path,
                    is_dir,
                    children,
                });
            }
        }

        // Sort items: directories first, then files, both alphabetically
        items.sort_by(|a, b| {
            match (a.is_dir, b.is_dir) {
                (true, false) => std::cmp::Ordering::Less,
                (false, true) => std::cmp::Ordering::Greater,
                _ => a.name.cmp(&b.name),
            }
        });

        Ok(items)
    }

    pub fn read_msg_file(path: &Path) -> Result<Vec<SerializedMessage>, String> {
        let msg_content = Message::parse_msg(path.to_str().unwrap());
        let serialized_messages = msg_content.into_iter()
            .map(|msg| SerializedMessage {
                content: msg.content,
                flags: SerializedMessageFlags {
                    has_lipsync: msg.flags.has_lipsync,
                    wait_for_input: msg.flags.wait_for_input,
                },
                header: SerializedMessageHeader {
                    box_type: msg.header.box_type.into(),
                    message_id: msg.header.message_id,
                    character: msg.header.character,
                }
            })
            .collect();
        Ok(serialized_messages)
    }
}

#[tauri::command]
pub async fn create_project(path: String, name: String, description: Option<String>) -> Result<(), String> {
    ProjectManager::create_project(Path::new(&path), &name, description)
}

#[tauri::command]
pub async fn load_project(path: String) -> Result<ProjectConfig, String> {
    ProjectManager::load_project(Path::new(&path))
}

#[tauri::command]
pub async fn update_project(path: String, config: ProjectConfig) -> Result<(), String> {
    ProjectManager::update_project(Path::new(&path), config)
}

#[tauri::command]
pub async fn is_project_directory(path: String) -> bool {
    ProjectManager::is_project_directory(Path::new(&path))
}

#[tauri::command]
pub async fn get_projects_from_dir(path: String) -> Vec<ProjectConfig> {
    ProjectManager::get_projects_from_dir(Path::new(&path))
}

#[tauri::command]
pub async fn create_file(project_path: String, name: String, is_folder: bool) -> Result<(), String> {
    ProjectManager::create_file(Path::new(&project_path), &name, is_folder)
}

#[tauri::command]
pub async fn list_files(project_path: String) -> Result<Vec<FileTreeItem>, String> {
    ProjectManager::list_files(Path::new(&project_path))
}

#[tauri::command]
pub async fn read_msg_file(path: String) -> Result<Vec<SerializedMessage>, String> {
    ProjectManager::read_msg_file(Path::new(&path))
}
