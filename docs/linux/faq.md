# 常见问题

## EACCES: permission denied, mkdir '/Users/wangjing/.local/share/opencode'

这个问题是创建 opencode 文件夹没有权限，解决思路

* 调整目录所有权

```shell
sudo chown -R wangjing /Users/wangjing/.local

// -R: 对目前目录下的所有文件与子目录进行相同的权限变更
```

* 增加写权限

```shell
chmod -R u+w /Users/wangjing/.local

// u: 表示该文件的拥有者
// + 表示增加权限、- 表示取消权限、= 表示唯一设定权限
// r 表示可读取，w 表示可写入，x 表示可执行，X 表示只有当该文件是个子目录或者该文件已经被设定过为可执行。
```
