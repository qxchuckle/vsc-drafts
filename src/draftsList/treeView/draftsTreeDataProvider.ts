import * as vscode from "vscode";
import { DraftItem } from "./DraftItem";

export class DraftsTreeDataProvider
  implements vscode.TreeDataProvider<DraftItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<DraftItem | undefined> =
    new vscode.EventEmitter<DraftItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<DraftItem | undefined> =
    this._onDidChangeTreeData.event;

  public treeView: vscode.TreeView<DraftItem> | undefined;

  constructor(private context: vscode.ExtensionContext) {}

  getTreeItem(element: DraftItem): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(element.name);
    treeItem.description = element.path;
    if (element.root) {
      treeItem.iconPath = new vscode.ThemeIcon("qx-tip-icon");
      treeItem.contextValue = "rootItem";
      return treeItem;
    }
    // 附加命令
    if (element.path.startsWith("GitHub:")) {
      const infoArr = element.path.split(":")[1].split("/");
      const config: GithubConfig = {
        owner: infoArr[0],
        repo: infoArr[1],
        token: "",
      };
      treeItem.command = {
        command: "qx-drafts-github.showTreeView",
        title: "打开 Github 草稿本",
        arguments: [config],
      };
    } else {
      treeItem.command = {
        command: "qx-drafts.showFileTree",
        title: "打开草稿本",
        arguments: [element.path],
      };
    }
    return treeItem;
  }

  getChildren(element?: DraftItem): Thenable<DraftItem[]> {
    if (element) {
      // 如果有元素，返回其子元素
      return Promise.resolve([]);
    } else {
      // 如果没有元素，返回顶级元素
      return Promise.resolve(this.getDraftFolders());
    }
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getDraftFolders(): DraftItem[] {
    // 从 globalState 中读取草稿文件夹的路径
    const drafts = this.context.globalState.get<DraftItem[]>(
      "qx-draftFolders",
      []
    );
    const rootItem = this.createFocusRootItem(
      "提示",
      "切换远端仓库后，将不会追踪同步其它仓库文件的修改，请注意保存后再切换"
    );
    drafts.unshift(rootItem);
    return drafts;
  }

  addDraftFolder(item: DraftItem) {
    const findDraft = this.findDraft(item);
    if (findDraft.index !== -1) {
      vscode.window.showErrorMessage(
        `${findDraft.draft.name}: ${findDraft.draft.path} 草稿本已存在，名称或路径都不能重复`
      );
      return;
    }
    // 将新的草稿文件夹路径添加到 globalState 中
    const draftFolders = this.getDraftFolders();
    draftFolders.push(item);
    this.context.globalState.update("qx-draftFolders", draftFolders);
    this.refresh();
  }

  findDraft(item: DraftItem) {
    const draftFolders = this.getDraftFolders();
    // 名字和路径都不能重复
    const index = draftFolders.findIndex(
      (i) => i.name === item.name || i.path === item.path
    );
    return {
      index,
      draft: draftFolders[index],
    };
  }

  deleteDraftFolder(item: DraftItem) {
    const draftFolders = this.getDraftFolders();
    const index = this.findDraft(item).index;
    if (index !== -1) {
      draftFolders.splice(index, 1);
      this.context.globalState.update("qx-draftFolders", draftFolders);
      this.refresh();
    }
  }

  renameDraftFolder(item: DraftItem, newName: string) {
    const draftFolders = this.getDraftFolders();
    const index = this.findDraft(item).index;
    if (index !== -1) {
      draftFolders[index].name = newName;
      this.context.globalState.update("qx-draftFolders", draftFolders);
      this.refresh();
    }
  }

  createFocusRootItem(title: string, describe: string): DraftItem {
    return new DraftItem(title, describe, true);
  }
}
