# upload2fir.im
nodejs实现的apk在fir.im一键上传

[api文档参考](https://fir.im/docs/publish)

## 操作
 - 1.将uploadApk2fir.js文件移动到AS的Android项目中
 - 2.改动api_token

 		..."api_token":"***"...
 - 3.改动apk文件路径

 		...'/app/build/outputs/apk/debug/app-debug.apk'...
 - 4.执行
 	
 		node uploadApk2fir.js

## 注意

此脚本自动解析git的当前的第一条日志作为changeLog、自动解析build.gradle获取applicationId,versionName,versionCode、自动解析strings.xml获取app_name