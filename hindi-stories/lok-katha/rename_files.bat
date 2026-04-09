@echo off
setlocal

REM Specify the folder path here. Use "." for the current folder.
set "folderPath=."

REM Iterate through all files ending with ".php.txt" recursively
for /r "%folderPath%" %%f in (*.php.txt) do (
    REM Get the full path of the file
    set "fullPath=%%f"

    REM Extract the filename with extension
    for %%a in ("%%f") do set "fileNameWithExt=%%~nxa"

    REM Construct the new filename by replacing ".php.txt" with ".txt"
    set "newFileName=%%fileNameWithExt:.php.txt=.txt%"

    REM Check if the new filename is different from the old one
    if not "%fileNameWithExt%"=="%newFileName%" (
        REM Rename the file
        ren "%fullPath%" "%newFileName%"
        echo Renamed "%fileNameWithExt%" to "%newFileName%"
    )
)

endlocal
pause