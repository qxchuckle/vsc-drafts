import * as vscode from 'vscode';
import * as path from 'path';

/**
 * 安全的移动文件，当重名时，提示用户是否覆盖
 * @param sourcePath 源文件路径
 * @param targetFolderPath 目标文件夹路径
 * @param overwrite 是否覆盖
 */
export async function safeMoveOrCopyFile(props: {
  type: 'move' | 'copy';
  sourcePath: string;
  targetFolderPath: string;
  overwrite?: boolean;
}): Promise<vscode.Uri> {
  const { sourcePath, targetFolderPath, overwrite = false, type } = props;
  const typeText = type === 'move' ? '移动' : '复制';
  const sourceUri = vscode.Uri.file(sourcePath);
  const targetUri = vscode.Uri.file(targetFolderPath);
  const fileName = path.basename(sourcePath);
  const resultUri = vscode.Uri.file(path.join(targetFolderPath, fileName));
  // 如果移动的文件和目标文件路径相同，则跳过
  if (sourceUri.fsPath === resultUri.fsPath) {
    return sourceUri;
  }

  const _operateFn = async (_overwrite: boolean) => {
    if (type === 'move') {
      await vscode.workspace.fs.rename(sourceUri, resultUri, {
        overwrite: _overwrite,
      });
    } else {
      await vscode.workspace.fs.copy(sourceUri, resultUri, {
        overwrite: _overwrite,
      });
    }
  };

  const sourceIsExistInTarget = await isFileExist(resultUri);
  try {
    // console.log(sourceIsExistInTarget, moveUri, sourcePath, targetPath);
    if (sourceIsExistInTarget && !overwrite) {
      const result = await vscode.window.showQuickPick(
        [
          { label: '是', description: '覆盖', value: 'overwrite' },
          { label: '否', description: '不覆盖，取消操作', value: 'cancel' },
        ],
        {
          title: `${fileName} ${typeText}到 ${targetFolderPath}，目标文件已存在，是否覆盖？`,
        },
      );
      if (result?.value === 'overwrite') {
        await _operateFn(true);
      } else {
        return sourceUri;
      }
    } else {
      await _operateFn(overwrite);
    }
    return resultUri;
  } catch (error) {
    console.error(error);
    vscode.window.showErrorMessage(
      `${typeText}文件失败: ${sourcePath} 到 ${targetFolderPath}，${
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

/**
 * 判断一个路径是否是另一个路径的子路径
 * @param path 路径
 * @param parentPath 父路径
 * @returns 是否是子路径
 */
export function isSubPath(path: string, parentPath: string) {
  return path.startsWith(parentPath) && path !== parentPath;
}
