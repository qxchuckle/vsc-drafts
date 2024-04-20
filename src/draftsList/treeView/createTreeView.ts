import * as vscode from "vscode";
import { DraftsTreeDataProvider } from "./draftsTreeDataProvider";

export function createDraftsListTreeView(context: vscode.ExtensionContext) {
  const provider = new DraftsTreeDataProvider(context);
  const treeView = vscode.window.createTreeView("qx-drafts-list", {
    treeDataProvider: provider,
  });
  provider.treeView = treeView;
  return provider;
}
