import * as vscode from "vscode";
import { FileItem } from "./fileItem";
import * as path from "path";

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
    this.rootPath = path.normalize(rootPath);
    if (watch) {
      const pattern = new vscode.RelativePattern(this.rootPath, "*");
      this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
      this.fileWatcher.onDidChange(this.refresh.bind(this), this.handleError);
      this.fileWatcher.onDidCreate(this.refresh.bind(this), this.handleError);
      this.fileWatcher.onDidDelete(this.refresh.bind(this), this.handleError);
    }
  }

  handleError(error: Error): void {
    console.error("An error occurred:", error);
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

    const items = directoryEntries.map(([name, type]) => {
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

    if (!element) {
      const pathTipItem = this.createFocusRootItem("当前路径", "qx-tip-icon");
      pathTipItem.description = this.rootPath;
      items.unshift(pathTipItem);
      // items.push(this.createFocusRootItem("—— 根目录操作 ——"));
    }

    return items;
  }

  async getParent(item: FileItem): Promise<FileItem | undefined> {
    if (!item.resourceUri) {
      return;
    }
    const parentPath = path.dirname(item.resourceUri.fsPath);
    if (parentPath === this.rootPath) {
      return undefined;
    } else {
      return new FileItem(
        path.basename(parentPath),
        vscode.TreeItemCollapsibleState.Collapsed,
        vscode.Uri.file(parentPath)
      );
    }
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

  async revealItem(fileUri: vscode.Uri) {
    // 找到新创建的文件对应的树视图项
    const item = await this.findItem(fileUri);
    if (item) {
      // 展开到这个项，并将焦点设置到这个项上
      await this.treeView?.reveal(item, {
        select: true,
        focus: true,
        expand: true,
      });
    }
  }

  createFocusRootItem(title: string, icon?: string): FileItem {
    return new FileItem(
      title,
      vscode.TreeItemCollapsibleState.None,
      vscode.Uri.file(this.rootPath),
      true,
      icon
    );
  }
}
