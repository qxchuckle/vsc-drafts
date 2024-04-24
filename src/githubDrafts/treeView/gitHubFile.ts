import * as vscode from "vscode";

export class GitHubFile extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly path: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly root: boolean = false,
    public readonly icon?: string
  ) {
    super(label, collapsibleState);
    if (root) {
      this.iconPath = new vscode.ThemeIcon(icon || "root-item-icon");
      this.contextValue = "rootItem";
      this.description = "为了避免一些BUG，这里提供了对根目录的便捷操作";
      return;
    }
    if (collapsibleState === vscode.TreeItemCollapsibleState.None) {
      this.iconPath = new vscode.ThemeIcon(icon || "file");
      this.contextValue = "file";
      this.command = {
        command: "qx-drafts-github.openFile",
        title: "打开文件",
        arguments: [this],
      };
    } else {
      this.iconPath = new vscode.ThemeIcon(icon || "folder");
      this.contextValue = "folder";
    }
  }
}
