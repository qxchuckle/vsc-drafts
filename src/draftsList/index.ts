import * as vscode from "vscode";
import { createDraftsListTreeView } from "./treeView/createTreeView";
import {
  createAddDrafts,
  createDeleteDrafts,
  createRenameDrafts,
} from "./commends";
import { DraftsTreeDataProvider } from "./treeView/draftsTreeDataProvider";

export function draftsListInit(context: vscode.ExtensionContext) {
  let draftsTreeDataProvider: ref<DraftsTreeDataProvider> = { value: null };
  draftsTreeDataProvider.value = createDraftsListTreeView(context);

  context.subscriptions.push(
    createAddDrafts(draftsTreeDataProvider),
    createDeleteDrafts(draftsTreeDataProvider),
    createRenameDrafts(draftsTreeDataProvider)
  );
}
