import * as vscode from 'vscode';
import { FileItem } from './fileItem';
import { basename, dirname } from 'path';
import { isSubPath, safeMoveOrCopyFile } from '../../utils';

/**
 * 树状视图的拖拽和放置控制器
 */
export abstract class TreeDragAndDropController
  implements vscode.TreeDragAndDropController<FileItem>
{
  dropMimeTypes = ['text/uri-list', 'files'];
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
    let dragPaths: string[] = [];

    // 处理标准text/uri-list
    const externalTransferItem = sources.get('text/uri-list');
    if (externalTransferItem) {
      const uriList = externalTransferItem.value as string;
      dragPaths = uriList
        .split('\n')
        .filter((line) => line.trim() && !line.startsWith('#'))
        .map((uri) => vscode.Uri.parse(uri.trim()).fsPath);
    } else {
      // 处理通用文件拖拽（从系统文件管理器或其他应用程序）
      const filesTransferItem = sources.get('files');
      if (filesTransferItem) {
        const files = filesTransferItem.value as vscode.DataTransferFile[];
        // 从 DataTransferFile 对象中提取文件路径
        dragPaths = files.map((file) => file.uri?.fsPath || '');
      }
    }
    console.log(dragPaths);

    // 如果没有找到拖拽数据，返回
    if (dragPaths.length === 0) {
      return;
    }

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
    const { target, sources, _token } = props;
    const dragPaths = props.dragPaths.filter((path) => !!path);
    // const dragItems = await this.findItems(dragPaths);
    let targetPath = target?.resourceUri?.fsPath || this.rootPath;
    const result: vscode.Uri[] = [];

    // 如果目标节点是可展开的，则放置到其中
    if (
      targetPath === this.rootPath ||
      target?.collapsibleState !== vscode.TreeItemCollapsibleState.None
    ) {
      for (const path of dragPaths) {
        // 如果是rootPath中的子文件，则移动到目标节点，否则复制到目标节点
        const type = isSubPath(path, this.rootPath) ? 'move' : 'copy';
        result.push(
          await safeMoveOrCopyFile({
            type,
            sourcePath: path,
            targetFolderPath: targetPath,
          }),
        );
      }
      return result;
    }

    // 对于其他节点，则放到该节点所处文件夹
    for (const path of dragPaths) {
      const targetDir = dirname(targetPath);
      const type = isSubPath(path, this.rootPath) ? 'move' : 'copy';
      result.push(
        await safeMoveOrCopyFile({
          type,
          sourcePath: path,
          targetFolderPath: targetDir,
        }),
      );
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
    // 设置标准的text/uri-list格式，支持拖拽到VSCode原生文件管理器
    const uris = source
      .map((node) => node.resourceUri)
      .filter((uri): uri is vscode.Uri => uri !== undefined);

    if (uris.length > 0) {
      // text/uri-list 格式：每行一个URI
      const uriList = uris.map((uri) => uri.toString()).join('\n');
      treeDataTransfer.set(
        'text/uri-list',
        new vscode.DataTransferItem(uriList),
      );
    }
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
