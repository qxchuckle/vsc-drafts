import * as vscode from "vscode";
import { FileTreeDataProvider } from "../treeView/fileTreeDataProvider";
import { FileItem } from "../treeView/fileItem";
import * as path from "path";
import { spawn } from "child_process";

export function createOpenInExplorer(provider: ref<FileTreeDataProvider>) {
  return vscode.commands.registerCommand(
    "qx-drafts.openInExplorer",
    async (fileItem: FileItem | undefined) => {
      if (!fileItem?.resourceUri) {
        explorer(provider.value?.getRootPath() || "");
        return;
      }
      let folderPath = fileItem.resourceUri.fsPath;
      // 如果是文件，获取文件所在目录
      if (fileItem.contextValue === "file") {
        folderPath = path.dirname(folderPath);
      }
      explorer(folderPath);
    }
  );
}

function explorer(folderPath: string) {
  if (!folderPath) {
    return;
  }
  if (containsNonAscii(folderPath)) {
    // 存在非ascii字符则使用spawn打开
    try {
      switch (process.platform) {
        case "darwin":
          spawn("open", [folderPath]);
          break;
        case "win32":
          spawn("explorer", [folderPath]);
          break;
        default:
          spawn("xdg-open", [folderPath]);
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    // openExternal 只支持ascii字符路径
    vscode.env.openExternal(vscode.Uri.file(folderPath));
  }
}

// 判断是否包含非ascii字符
function containsNonAscii(str: string) {
  return /[^\x00-\x7F]/.test(str);
}
