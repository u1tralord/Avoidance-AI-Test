{"filter":false,"title":"GitCommitAndPush.sh","tooltip":"/client/GitCommitAndPush.sh","undoManager":{"mark":0,"position":0,"stack":[[{"group":"doc","deltas":[{"start":{"row":0,"column":0},"end":{"row":10,"column":45},"action":"insert","lines":["#!/bin/bash  ","read -p \"Commit description: \" desc ","","current_time=$(date \"+%Y.%m.%d-%H:%M:%S\")","echo [$current_time] - $desc >> updateLog.log","","git add .  ","git commit -m \"$desc\" ","git push origin master","","echo \"Git repository updated @ $current_time\""]}]}]]},"ace":{"folds":[],"scrolltop":2,"scrollleft":0,"selection":{"start":{"row":10,"column":45},"end":{"row":10,"column":45},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":0},"timestamp":1427773847216,"hash":"8a3d154c1956ef9945217c370c87cc52fb8f3f27"}