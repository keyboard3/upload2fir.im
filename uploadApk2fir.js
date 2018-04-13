var request = require('request-promise');
const fs = require('fs')
const { exec } = require('child_process')

getChangeLog = () => {
  exec(`cd ${currentPath} && git log --pretty="%s" -1`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    changelog = stdout;
  });
}


let currentPath = process.cwd();
let tokens = {
  keyboard3: '**'
}
let apkType = {
  debug: 'debug/app-debug.apk',
  preview: 'preview/app-preview.apk',
  release: 'release/app-release.apk'
}
let activeToken = tokens.keyboard3;
let activeApkType = apkType.debug;

let changelog;

if (!!!changelog) {
  getChangeLog();
}
let buildConfig = fs.readFileSync(currentPath + '/app/build.gradle').toString();
let strings = fs.readFileSync(currentPath + '/app/src/main/res/values/strings.xml').toString();
let packageName = buildConfig.match(/applicationId "(\S+)"/)[1];
let build = buildConfig.match(/versionCode (\S+)/)[1];
let version = buildConfig.match(/versionName "(\S+)"/)[1];
let appName = strings.match(/string name="app_name">(\S+)</)[1];
console.log(packageName, build, version, appName, activeToken);

request({
  uri: 'http://api.fir.im/apps',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: `{"type":"android", "bundle_id":"${packageName}", "api_token":"${activeToken}"}`
}).then(res => {
  return new Promise(resolve => resolve(JSON.parse(res).cert));
}).then(cert => {

  console.log('Upload icon beign');
  request({
    method: 'POST',
    uri: cert.icon.upload_url,
    formData: {
      key: cert.icon.key,
      token: cert.icon.token,
      file: fs.createReadStream(currentPath + '/app/src/main/res/mipmap-hdpi/ic_launcher.png')
    }
  }).then(res => {
    console.log('Upload icon successful!  Server responded with:', res);
  }).catch(err => {
    return console.error('upload icon failed:', err.message);
  });

  return new Promise(resolve => resolve(cert));
}).then(cert => {

  console.log('Upload binary beign');
  request({
    method: 'POST',
    uri: cert.binary.upload_url,
    formData: {
      key: cert.binary.key,
      token: cert.binary.token,
      file: fs.createReadStream(currentPath + `/app/build/outputs/apk/${activeApkType}`),
      'x:name': appName,
      'x:version': version,
      'x:build': build,
      'x:changelog': changelog
    }
  }).then(res => {
    console.log('Upload binary successful!  Server responded with:', res);
  }).catch(err => {
    return console.error('upload binary failed:', err.message);
  });
}).catch(err => {
  console.error(err);
});