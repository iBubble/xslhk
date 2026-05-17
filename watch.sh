#!/bin/bash
export PATH=$HOME/.local/bin:$PATH
# 使用 npx 直接调用本地 nodemon，监视整个项目并在文件变化时重新启动 next dev
npx nodemon --watch . --exec "npm run dev"
