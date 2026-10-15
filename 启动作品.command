#!/bin/zsh
cd "${0:A:h}"
print '请在浏览器打开 http://127.0.0.1:8765'
print '按 Control+C 可停止本地服务。'
python3 -m http.server 8765 --bind 127.0.0.1
