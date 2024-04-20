import * as vscode from "vscode";
import { FileItem } from "./fileItem";

export class FileTreeDataProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined> =
    new vscode.EventEmitter<FileItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<FileItem | undefined> =
    this._onDidChangeTreeData.event;
  private _selectedItem: FileItem | undefined;

  private rootPath: string;
  private fileWatcher: vscode.FileSystemWatcher | null = null;

  public treeView: vscode.TreeView<FileItem> | undefined;

  constructor(rootPath: string, watch: boolean = true) {
    this.rootPath = rootPath;
    if (watch) {
      const pattern = new vscode.RelativePattern(this.rootPath, "*");
      this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
      this.fileWatcher.onDidChange(this.refresh.bind(this));
      this.fileWatcher.onDidCreate(this.refresh.bind(this));
      this.fileWatcher.onDidDelete(this.refresh.bind(this));
    }
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: FileItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getRootPath(): string {
    return this.rootPath;
  }

  setSelectedItem(item: FileItem | undefined) {
    this._selectedItem = item;
  }

  getSelectedItem(): FileItem | undefined {
    return this._selectedItem;
  }

  async getChildren(element?: FileItem): Promise<FileItem[]> {
    let directoryEntries: [string, vscode.FileType][];
    if (element) {
      if (
        element.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed
      ) {
        directoryEntries = await vscode.workspace.fs.readDirectory(
          element.resourceUri!
        );
      } else {
        return [];
      }
    } else {
      directoryEntries = await vscode.workspace.fs.readDirectory(
        vscode.Uri.file(this.rootPath)
      );
    }

    // 对文件项进行排序，文件夹在前，文件在后
    directoryEntries.sort(([name1, type1], [name2, type2]) => {
      if (
        type1 === vscode.FileType.Directory &&
        type2 !== vscode.FileType.Directory
      ) {
        return -1;
      } else if (
        type1 !== vscode.FileType.Directory &&
        type2 === vscode.FileType.Directory
      ) {
        return 1;
      } else {
        return name1.localeCompare(name2);
      }
    });

    return directoryEntries.map(([name, type]) => {
      const filePath = element
        ? vscode.Uri.file(`${element.resourceUri!.fsPath}/${name}`)
        : vscode.Uri.file(`${this.rootPath}/${name}`);
      return new FileItem(
        name,
        type === vscode.FileType.Directory
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.None,
        filePath
      );
    });
  }

  async findItem(uri: vscode.Uri): Promise<FileItem | undefined> {
    const searchPath = uri.fsPath;
    const queue: FileItem[] = [];

    const rootItems = await this.getChildren();
    queue.push(...rootItems);

    while (queue.length > 0) {
      const item = queue.shift();
      if (item) {
        if (item.resourceUri?.fsPath === searchPath) {
          return item;
        }
        const children = await this.getChildren(item);
        queue.push(...children);
      }
    }

    return undefined;
  }
}
