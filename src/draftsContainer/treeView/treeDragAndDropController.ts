import * as vscode from 'vscode';
import { DraftsContainerDragDataTransferMimeType } from './mimeType';
import { FileItem } from './fileItem';
import { basename, dirname } from 'path';
import { safeMoveFile } from '../../utils';

export interface DragData {
  paths: string[];
}

/**
 * 树状视图的拖拽和放置控制器
 */
export abstract class TreeDragAndDropController
  implements vscode.TreeDragAndDropController<FileItem>
{
  // dropMimeTypes 和 dragMimeTypes 与树状视图的 id 关联
  // 用来告诉 Vscode 该控制器只处理从 dragMimeTypes 指定的视图 A 拖拽到 dropMimeTypes 指定的视图 B
  dropMimeTypes = ['application/vnd.code.tree.qx-drafts'];
  // 文件管理器拖拽的标准MIME_TYPE
  dragMimeTypes = ['text/uri-list'];

  abstract rootPath: string;

  protected abstract context: vscode.ExtensionContext;
  /** 刷新树状视图 */
  protected abstract refresh(node?: FileItem): void;

  abstract findItems(uris: vscode.Uri[]): Promise<FileItem[]>;
  abstract findItem(uri: vscode.Uri): Promise<FileItem | undefined>;
  abstract treeView: vscode.TreeView<FileItem> | undefined;

  // 处理放置操作
  public async handleDrop(
    target: FileItem | undefined,
    sources: vscode.DataTransfer,
    _token: vscode.CancellationToken,
  ): Promise<void> {
    const transferItem = sources.get(DraftsContainerDragDataTransferMimeType);
    if (!transferItem) {
      return;
    }

    // 获取拖拽节点
    const dragData = transferItem.value as DragData;
    const dragPaths = dragData.paths;
    // 放置前的安全检查
    if (!this.checkSafeToDrop(target, dragPaths)) {
      return;
    }

    // 实际的放置操作
    try {
      const moveUris = await this.doDrop({
        target,
        dragPaths,
        sources,
        _token,
      });
      this.refresh();
      Promise.resolve().then(() => {
        async () => {
          if (moveUris.length === 0) {
            return;
          }
          const dragItem = await this.findItem(moveUris[0]);
          if (!dragItem) {
            return;
          }
          this.treeView?.reveal(dragItem, {
            focus: true,
          });
        };
      });
    } catch (error) {
      console.error(error);
      vscode.window.showErrorMessage(
        `移动文件失败: ${error instanceof Error ? error.message : error}`,
      );
    } finally {
      this.refresh();
    }
  }

  /** 实际的放置操作 */
  private async doDrop(props: {
    target: FileItem | undefined;
    dragPaths: string[];
    sources: vscode.DataTransfer;
    _token: vscode.CancellationToken;
  }): Promise<vscode.Uri[]> {
    const { target, dragPaths, sources, _token } = props;
    // const dragItems = await this.findItems(dragPaths);
    let targetPath = target?.resourceUri?.fsPath || this.rootPath;
    const result: vscode.Uri[] = [];

    // 添加到根节点
    if (targetPath === this.rootPath) {
      for (const path of dragPaths) {
        result.push(await safeMoveFile(path, targetPath));
      }
      return result;
    }

    // 如果目标节点是可展开的，则放置到其中
    if (target?.collapsibleState !== vscode.TreeItemCollapsibleState.None) {
      for (const path of dragPaths) {
        result.push(await safeMoveFile(path, targetPath));
      }
      return result;
    }

    // 对于其他节点，则放到该节点所处文件夹
    for (const path of dragPaths) {
      const targetDir = dirname(targetPath);
      result.push(await safeMoveFile(path, targetDir));
    }
    return result;
  }

  // 处理拖拽源
  // 知道拖拽开始于哪个元素，将数据使用MIME_TYPE进行标记，传递给handleDrop。
  public async handleDrag(
    source: FileItem[],
    treeDataTransfer: vscode.DataTransfer,
    _token: vscode.CancellationToken,
  ): Promise<void> {
    // 只传递id
    const dragData: DragData = {
      paths: source
        .map((node) => node.resourceUri?.fsPath)
        .filter((path) => path !== undefined),
    };
    treeDataTransfer.set(
      DraftsContainerDragDataTransferMimeType,
      new vscode.DataTransferItem(dragData),
    );
  }

  // 放置前的安全检查
  private checkSafeToDrop(
    target: FileItem | undefined,
    dragPaths: string[],
  ): boolean {
    const targetPath = target?.resourceUri?.fsPath;
    // 目标节点没有路径，放行，后面会放到根节点
    if (!targetPath) {
      return true;
    }
    // 没有拖被拽节点，则不进行放置
    if (dragPaths.length === 0) {
      return false;
    }
    for (const path of dragPaths) {
      // 目标节点是否是拖拽节点的父级
      if (targetPath.startsWith(path)) {
        return false;
      }
    }
    return true;
  }
}
