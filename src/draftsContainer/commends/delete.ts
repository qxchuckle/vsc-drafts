import * as vscode from 'vscode';
import { FileTreeDataProvider } from '../treeView/fileTreeDataProvider';
import { FileItem } from '../treeView/fileItem';
import * as path from 'path';

export function createDelete(provider: ref<FileTreeDataProvider>) {
  return vscode.commands.registerCommand(
    'qx-drafts.delete',
    async (fileItem: FileItem, fileItems?: FileItem[]) => {
      const deleteFiles = fileItems ? fileItems : [fileItem];
      await deleteMultipleFiles(deleteFiles);
    },
  );

  /**
   * 删除多个文件
   */
  async function deleteMultipleFiles(fileItems: FileItem[]) {
    if (!provider.value || !fileItems.length) {
      return;
    }
    const len = fileItems.length;
    const fileNames = fileItems
      .map((item) => path.basename(item.resourceUri?.fsPath ?? ''))
      .filter((item) => item !== '')
      .join('\n');
    const confirm = await vscode.window.showWarningMessage(
      `确定要删除 ${len} 个文件吗？\n${fileNames}`,
      { modal: true },
      '确定',
    );
    if (confirm === '确定') {
      for (const fileItem of fileItems) {
        if (!fileItem.resourceUri) {
          continue;
        }
        try {
          await vscode.workspace.fs.delete(fileItem.resourceUri, {
            useTrash: true, // 使用回收站
            recursive: true, // 递归删除
          });
        } catch (error) {}
      }
      provider.value.refresh();
    }
  }
}
