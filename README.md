# Tataru Helper Node Ver.2.0.0 Source Code

## Tataru Helper Node專案建置步驟

* 可使用[Visual Studio Code](https://code.visualstudio.com/)編輯

* To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/winw1010/tataru-helper-node-ver.2.0.0
# Go into the repository
cd tataru-helper-node-ver.2.0.0
# Install dependencies
npm install
# Run the app
npm start
```

## Tataru Helper Node安裝檔建立步驟

* 安裝檔會建立在build資料夾裡
* 安裝檔設定在package.json裡的build物件，打包工具為electron-builder
* 建立安裝檔之前請先npm start啟動並執行一次過螢幕擷取功能，否則打包的安裝檔無法使用螢幕擷取功能

```bash
# Distribute the app
npm run dist
```

## Tararu Helper程式修改步驟

1. 下載[Tataru Helper](https://github.com/NightlyRevenger/TataruHelper/releases)
2. 安裝後至安裝目錄刪除TataruHelper.exe和Update.exe
3. 進入安裝目錄下的app-0.9.106資料夾，將裡面的TataruHelper.exe取代為Tataru Helper Node專案裡的_Tataru_Helper/Release裡的TataruHelper.exe即可

## Tararu Helper專案修改步驟

1. 至Tararu Helper原作者的GitHub([NightlyRevenger/TataruHelper](https://github.com/NightlyRevenger/TataruHelper))，按下Code > Download ZIP下載Tataru Helper的原始碼
2. 解壓縮後將_Tataru_Helper裡的FFXIVWpfApp1資料夾與Updater資料夾複製到專案裡並取代
3. 使用Visual Studio開啟專案(.sln檔)
4. 將Debug改為Release，然後按下開始即可編譯專案
5. 編譯好的.exe檔會建立在專案裡的FFXIVWpfApp1/bin/Release裡，你也可以拿這裡的TataruHelper.exe取代原版Tataru Helper的TataruHelper.exe(Tararu Helper程式修改步驟第3步驟)