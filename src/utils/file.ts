import * as vscode from 'vscode';
import * as path from 'path';

/**
 * 安全的移动文件，当重名时，提示用户是否覆盖
 * @param sourcePath 源文件路径
 * @param targetPath 目标文件路径
 * @param overwrite 是否覆盖
 */
export async function safeMoveFile(
  sourcePath: string,
  targetPath: string,
  overwrite: boolean = false,
): Promise<vscode.Uri> {
  const sourceUri = vscode.Uri.file(sourcePath);
  const targetUri = vscode.Uri.file(targetPath);
  const fileName = path.basename(sourcePath);
  const moveUri = vscode.Uri.file(path.join(targetPath, fileName));
  // 如果移动的文件和目标文件路径相同，则跳过
  if (sourceUri.fsPath === moveUri.fsPath) {
    return sourceUri;
  }
  const sourceIsExistInTarget = await isFileExist(moveUri);
  try {
    // console.log(sourceIsExistInTarget, moveUri, sourcePath, targetPath);
    if (sourceIsExistInTarget && !overwrite) {
      const result = await vscode.window.showQuickPick(
        [
          { label: '是', description: '覆盖', value: 'overwrite' },
          { label: '否', description: '不覆盖，取消移动', value: 'cancel' },
        ],
        {
          title: `${fileName} 移动到 ${targetPath}，目标文件已存在，是否覆盖？`,
        },
      );
      if (result?.value === 'overwrite') {
        await vscode.workspace.fs.rename(sourceUri, moveUri, {
          overwrite: true,
        });
      } else {
        return sourceUri;
      }
    } else {
      await vscode.workspace.fs.rename(sourceUri, moveUri, { overwrite });
    }
    return moveUri;
  } catch (error) {
    console.error(error);
    vscode.window.showErrorMessage(
      `移动文件失败: ${sourcePath} 到 ${targetPath}，${
        error instanceof Error ? error.message : error
      }`,
    );
    return sourceUri;
  }
}

/**
 * 判断文件是否存在
 * @param path 文件路径
 * @returns 是否存在
 */
export async function isFileExist(uri: vscode.Uri) {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch (error) {
    return false;
  }
}
