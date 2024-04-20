import { publicDecrypt } from "crypto";
import * as vscode from "vscode";

export class FileItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly resourceUri?: vscode.Uri
  ) {
    super(label, collapsibleState);
    if (collapsibleState === vscode.TreeItemCollapsibleState.None) {
      this.command = {
        command: "vscode.open",
        title: "打开文件",
        arguments: [this.resourceUri],
      };
      this.iconPath = new vscode.ThemeIcon("file");
      this.contextValue = "file";
    } else {
      this.iconPath = new vscode.ThemeIcon("folder");
      this.contextValue = "folder";
    }
  }
}