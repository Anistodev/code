use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum BoxType {
    Help,
    Message,
    Mind,
    System,
    Trivia,
    Devil,
    Progress,
    Unknown,
}

#[derive(Serialize, Deserialize)]
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

#[derive(Serialize, Deserialize)]
pub struct File {
    pub id: String,
    pub name: String,
    pub text: String,
    pub output: Option<String>,
    pub attributes: Option<FileAttributes>,
}

#[derive(Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub files: Vec<File>,
} 

#[derive(Serialize, Deserialize)]
pub struct MessageAttributes {
    pub has_lipsync: bool,
    pub wait_for_input: bool
}

#[derive(Serialize, Deserialize)]
pub struct SerializableMessage {
    pub content: String,
    pub attributes: MessageAttributes,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SerializedMessage {
    pub content: String,
    pub flags: SerializedMessageFlags,
    pub header: SerializedMessageHeader,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SerializedMessageFlags {
    pub has_lipsync: bool,
    pub wait_for_input: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SerializedMessageHeader {
    pub box_type: BoxType,
    pub message_id: String,
    pub character: Option<String>,
}

// TODO: kill this with fire
impl From<royal::BoxType> for BoxType {
    fn from(box_type: royal::BoxType) -> Self {
        match box_type {
            royal::BoxType::Help => BoxType::Help,
            royal::BoxType::Message => BoxType::Message,
            royal::BoxType::Mind => BoxType::Mind,
            royal::BoxType::System => BoxType::System,
            royal::BoxType::Trivia => BoxType::Trivia,
            royal::BoxType::Devil => BoxType::Devil,
            royal::BoxType::Progress => BoxType::Progress,
            _ => BoxType::Unknown,
        }
    }
}
