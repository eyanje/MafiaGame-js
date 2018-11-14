@echo off
pushd C:\Users\admin\node-js\mafia
ipconfig | .\findip.exe
node index.js
popd
