const fs = require('fs');
const { exec } = require('child_process');
var request = require('request-promise');

/* 从git从读取最新变更日志 */
getChangeLog = ()=> {
  exec(
    ` cd ${currentPath} && git log --pretty="%s" -1`, 
    (err, stdout, stderr) => {
      if(err){
       console.error(err);
       return;
      } 
      changelog = stdout;
    }
  );
}
/* 配置获取token的参数 */
configFetchToken = (packageName,  activeToken) => ({
  uri: 'http://api.fir.im/apps',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: `{ 
          "type":"android", 
          "bundle_id":"${packageName}", 
          "api_token":"${activeToken}"
         }`
});
/* 配置上传icon参数 */
confifUploadIcon = (cert, icon_url) => ({
    method: 'POST',
    uri: cert.icon.upload_url,
    formData: 
    {
      key: cert.icon.key,
      token: cert.icon.token,
      file: fs.createReadStream(icon_url)
    }
});
/* 配置上传apk文件参数 */
configUploadfile = cert => ({
    method: 'POST',
    uri: cert.binary.upload_url,
    formData: 
    {
      key: cert.binary.key,
      token: cert.binary.token,
      file: fs.createReadStream(currentPath + `/app/build/outputs/apk/${activeApkType}.apk`),
      'x:name': appName,
      'x:version': version,
      'x:build': build,
      'x:changelog': changelog
    }
});



/*读取相关执行输入参数*/
let currentPath = process.cwd();
var myArgs = process.argv.slice(2);
console.log ('myArgs',myArgs);

let activeToken = myArgs[1];
let activeApkType = myArgs[0];
let changelog = myArgs.length > 2 ? myArgs[2]: null;

if (!changelog) { getChangeLog(); }

let buildConfig = fs.readFileSync(currentPath + '/app/build.gradle').toString();

/* get app_name */
let strings = fs.readFileSync(currentPath + '/app/src/main/res/values/strings.xml').toString();
if (strings.indexOf('app_name') < 0) {
  strings = fs.readFileSync(currentPath + `/app/build/generated/res/resValues/${activeApkType}/values/generated.xml`).toString();
}
/*get icon_url*/
let androidManifest = fs.readFileSync(currentPath + '/app/src/main/AndroidManifest.xml').toString();
let icon_url = `${currentPath}/app/src/main/res/mipmap-xhdpi/${androidManifest.match(/icon=".+\/(.+)"/)[1]}.png`;

let packageName = buildConfig.match(/applicationId "(\S+)"/)[1];
let build = buildConfig.match(/versionCode (\S+)/)[1];
let version = buildConfig.match(/versionName "(\S+)"/)[1];
let appName = strings.match(/string name="app_name".*>(\S+)</)[1];

console.log(packageName, build, version, appName, activeToken);

request(configFetchToken(packageName, activeToken))
.then(res => new Promise(resolve => resolve(JSON.parse(res))))
.then(response => {

  console.log('Upload icon beign');
  request(confifUploadIcon(response.cert, icon_url))
  .then(res => console.log('Upload icon successful!'))
  .catch(err => console.error('upload icon failed:', err.message));

  return new Promise(resolve => resolve(response));
})
.then(response => {

  console.log('Upload binary beign');
  request(configUploadfile(response.cert))
  .then(res => console.log('Upload binary successful!  https://fir.im/apps/'+response.id,`https://fir.im/${response.short}`))
  .catch(err => console.error('upload binary failed:', err.message));
})
.catch(err => console.error(err));
