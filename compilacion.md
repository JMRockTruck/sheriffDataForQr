- compilacion

./gradlew.bat assembleRelease
adb uninstall com.cameratest
adb install android/app/build/outputs/apk/release/app-release.apk

- run local
npm run android