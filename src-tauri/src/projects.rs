use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::SystemTime;

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
