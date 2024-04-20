import * as vscode from "vscode";
import { DraftsTreeDataProvider } from "../treeView/draftsTreeDataProvider";
import { DraftItem } from "../treeView/DraftItem";

export function createRenameDrafts(provider: ref<DraftsTreeDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts-list.renameDrafts",
    async (draftItem: DraftItem) => {
      const draftName = await vscode.window.showInputBox({
        prompt: "修改草稿本名称",
        placeHolder: "请输入新的草稿本名称",
      });
      if (draftName) {
        provider.value?.renameDraftFolder(draftItem, draftName);
      }
    }
  );
}