@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 设置图片所在文件夹路径（默认为当前文件夹，可以修改）
set "folder=."

:: 设置计数器
set /a count=1

:: 遍历所有图片文件（支持jpg、png、gif等格式）
for %%f in ("%folder%\*.jpg" "%folder%\*.png" "%folder%\*.gif" "%folder%\*.jpeg") do (
    :: 构建新文件名
    set "newname=!count!"
    
    :: 如果数字小于10，前面加0
    if !count! lss 10 set "newname=0!count!"
    
    :: 获取文件扩展名
    set "ext=%%~xf"
    
    :: 重命名文件
    ren "%%f" "!newname!!ext!"
    
    :: 计数器加1
    set /a count+=1
)

echo 重命名完成！
echo 共处理了 %count% 个文件
pause