import * as vscode from "vscode";
import { DraftsTreeDataProvider } from "../treeView/draftsTreeDataProvider";
import { DraftItem } from "../treeView/DraftItem";

export function createAddDrafts(provider: ref<DraftsTreeDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts-list.addDrafts",
    async (draftItem: DraftItem) => {
      const draftName = await vscode.window.showInputBox({
        prompt: "为该草稿本命名",
        placeHolder: "请输入草稿本名称",
      });
      if (draftName) {
        const config = vscode.workspace.getConfiguration("qx-drafts");
        const path = config.get<string>("folderPath");
        if (!path) {
          return;
        }
        provider.value?.addDraftFolder({
          name: draftName,
          path: path,
        });
      }
    }
  );
}
