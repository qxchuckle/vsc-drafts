import * as vscode from "vscode";

export class FileItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly resourceUri?: vscode.Uri,
    public readonly root?: boolean,
    public readonly icon?: string
  ) {
    super(label, collapsibleState);
    if (root) {
      this.iconPath = new vscode.ThemeIcon(icon || 'root-item-icon');
      this.contextValue = "rootItem";
      this.description = "为了避免一些BUG，这里提供了对根目录的便捷操作";
      return;
    }
    if (collapsibleState === vscode.TreeItemCollapsibleState.None) {
      this.command = {
        command: "vscode.open",
        title: "打开文件",
        arguments: [this.resourceUri],
      };
      this.iconPath = new vscode.ThemeIcon(icon || "file");
      this.contextValue = "file";
    } else {
      this.iconPath = new vscode.ThemeIcon(icon || "folder");
      this.contextValue = "folder";
    }
  }
}
