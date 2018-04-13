# upload2fir.im
nodejs实现的apk在fir.im一键上传

[api文档参考](https://fir.im/docs/publish)

## 操作
 - 1.配置
	
		let tokens = {
			keyboard3: '自己的token'
		}
		let apkType = {
			debug: 'debug/app-debug.apk',
			preview: 'preview/app-preview.apk',
			release: 'release/app-release.apk'
		}
		let activeToken = tokens.keyboard3;
		let activeApkType = apkType.debug;
 - 4.执行
		
		cd 项目根目录下
 		node 存放的目录/uploadApk2fir.js

## 注意

此脚本自动解析git的当前的第一条日志作为changeLog、自动解析build.gradle获取applicationId,versionName,versionCode、自动解析strings.xml获取app_name