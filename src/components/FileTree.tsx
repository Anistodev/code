import { Component, For, Show, createSignal } from "solid-js";
import { ChevronRight, ChevronDown, Folder, MessageSquareCode } from "lucide-solid";
import ContextMenuV2 from "./ContextMenu";

interface FileTreeItem {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileTreeItem[];
}

interface FileTreeProps {
  items: FileTreeItem[];
  onFileSelect?: (file: FileTreeItem) => void;
  selectedFileId?: string;
  onCreateFile?: (parentId: string) => void;
  onDeleteFile?: (fileId: string) => void;
}

const FileTreeNode: Component<{
  item: FileTreeItem;
  level: number;
  onFileSelect?: (file: FileTreeItem) => void;
  selectedFileId?: string;
  onCreateFile?: (parentId: string) => void;
  onDeleteFile?: (fileId: string) => void;
  onContextMenu: (e: MouseEvent, item: FileTreeItem) => void;
}> = (props) => {
  const [isOpen, setIsOpen] = createSignal(true);

  const handleClick = () => {
    if (props.item.type === "folder") {
      setIsOpen(!isOpen());
    } else {
      props.onFileSelect?.(props.item);
    }
  };

  return (
    <div class="select-none">
      <div
        class={`flex items-center gap-1 px-2 py-0.5 hover:bg-primary cursor-pointer ${
          props.selectedFileId === props.item.id ? "bg-primary" : ""
        }`}
        style={{ "padding-left": `${props.level * 12 + 4}px` }}
        onClick={handleClick}
        onContextMenu={(e) => props.onContextMenu(e, props.item)}
      >
        <Show
          when={props.item.type === "folder"}
          fallback={
            <div class="w-8 flex items-center">
              <MessageSquareCode class="w-4 h-4 text-zinc-400 ml-4" />
            </div>
          }
        >
          <Show
            when={isOpen()}
            fallback={<ChevronRight class="w-4 h-4 text-zinc-400" />}
          >
            <ChevronDown class="w-4 h-4 text-zinc-400" />
          </Show>
          <Folder class="w-4 h-4 text-zinc-400" />
        </Show>
        <span class="text-sm text-text">{props.item.name}</span>
      </div>

      <Show when={props.item.type === "folder" && isOpen()}>
        <For each={props.item.children}>
          {(child) => (
            <FileTreeNode
              item={child}
              level={props.level + 1}
              onFileSelect={props.onFileSelect}
              selectedFileId={props.selectedFileId}
              onCreateFile={props.onCreateFile}
              onDeleteFile={props.onDeleteFile}
              onContextMenu={props.onContextMenu}
            />
          )}
        </For>
      </Show>
    </div>
  );
};

const FileTree: Component<FileTreeProps> = (props) => {
  const [contextMenu, setContextMenu] = createSignal<{
    x: number;
    y: number;
    item: FileTreeItem;
  } | null>(null);

  const handleContextMenu = (e: MouseEvent, item: FileTreeItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  return (
    <div class="w-60 h-full bg-secondary border-zinc-800 overflow-y-auto" onClick={() => setContextMenu(null)}>
      <For each={props.items}>
        {(item) => (
          <FileTreeNode
            item={item}
            level={0}
            onFileSelect={props.onFileSelect}
            selectedFileId={props.selectedFileId}
            onCreateFile={props.onCreateFile}
            onDeleteFile={props.onDeleteFile}
            onContextMenu={handleContextMenu}
          />
        )}
      </For>

      <Show when={contextMenu()}>
        <ContextMenuV2
          x={contextMenu()!.x}
          y={contextMenu()!.y}
          actions={[
            ...(contextMenu()!.item.type === "folder"
              ? [{
                  label: "New File",
                  action: () => {
                    props.onCreateFile?.(contextMenu()!.item.id);
                    setContextMenu(null);
                  },
                }]
              : []),
            {
              label: "Delete",
              action: () => {
                props.onDeleteFile?.(contextMenu()!.item.id);
                setContextMenu(null);
              },
            },
          ]}
        />
      </Show>
    </div>
  );
};

export default FileTree;
