@echo off
call D:\emsdk\emsdk_env.bat
if not exist public\wasm mkdir public\wasm
if not exist src\wasm mkdir src\wasm

em++ -std=c++17 -O2 -Icpp/include ^
  cpp/src/Maze.cpp ^
  cpp/src/Player.cpp ^
  cpp/src/GameEngine.cpp ^
  cpp/src/LevelManager.cpp ^
  cpp/src/MazeGenerator.cpp ^
  cpp/src/PathFinder.cpp ^
  cpp/src/PuzzleValidator.cpp ^
  cpp/src/WasmBridge.cpp ^
  -o public/wasm/smartmaze_engine.js ^
  -s EXPORTED_FUNCTIONS="['_initializeGame','_initializeLevel','_getCurrentLevelId','_getLevelCount','_isLevelUnlocked','_isLevelCompleted','_completeLevel','_getLevelDifficulty','_getLevelPuzzleType','_movePlayer','_getPlayerX','_getPlayerY','_getMoveCount','_isWon','_getMazeWidth','_getMazeHeight','_getMazeStartX','_getMazeStartY','_getMazeGoalX','_getMazeGoalY','_getMazeCell','_getSwitchCount','_getSwitchX','_getSwitchY','_getSwitchState','_getSwitchTargetGateId','_getGateCount','_getGateId','_getGateX','_getGateY','_getGateState','_getPressurePlateCount','_getPressurePlateX','_getPressurePlateY','_getPressurePlateState','_getOneWayCount','_getOneWayX','_getOneWayY','_getOneWayDirection','_getMovingWallCount','_getMovingWallX','_getMovingWallY','_getMovingWallState','_getMoveLimit','_getMovesRemaining','_startChallenge','_updateChallengeTime','_isChallengeActive','_getChallengeType','_getChallengeTimeLimit','_getChallengeElapsedTime','_getChallengeMoveLimit','_isChallengeFailed','_isChallengeCompleted','_getChallengeRank','_resetCustomBuildDef','_loadCustomMaze','_addCustomSwitch','_addCustomGate','_addCustomPressurePlate','_addCustomOneWay','_addCustomMovingWall','_validateCustomMaze','_getCustomMazeSolutionMoves','_getStateChangeCount','_getStateChangeX','_getStateChangeY','_getStateChangeState','_getStateChangeWallCount','_getStateChangeWallX','_getStateChangeWallY','_getTemporaryPathCount','_getTemporaryPathX','_getTemporaryPathY','_getTemporaryPathTriggerX','_getTemporaryPathTriggerY','_getTemporaryPathState','_getTemporaryPathMovesRemaining','_getTemporaryPathDuration','_getHiddenPathCount','_getHiddenPathX','_getHiddenPathY','_getHiddenPathTriggerX','_getHiddenPathTriggerY','_getHiddenPathState','_getSequenceLockCount','_getSequenceLockTargetGateId','_getSequenceLockStep','_getSequenceLockState','_getSequenceLockRuneCount','_getSequenceLockRuneX','_getSequenceLockRuneY']" ^
  -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap']" ^
  -s MODULARIZE=1 ^
  -s EXPORT_NAME="createSmartMazeModule" ^
  -s EXPORT_ES6=1 ^
  -s ENVIRONMENT="web,worker,node"

copy /Y public\wasm\smartmaze_engine.js src\wasm\smartmaze_engine.js
copy /Y public\wasm\smartmaze_engine.wasm src\wasm\smartmaze_engine.wasm
copy /Y public\wasm\smartmaze_engine.js src\wasm\smartMazeEngineRaw.js
copy /Y public\wasm\smartmaze_engine.wasm src\wasm\smartMazeEngineRaw.wasm
echo WASM BUILD COMPLETE!
