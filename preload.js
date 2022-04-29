'use strict';

// communicate with main process
const { ipcRenderer } = require('electron');

// exec
const { execSync } = require('child_process');

// download github repo
const downloadGitRepo = require('download-git-repo');

// axios
const axios = require('axios').default;

// server module
const { startServer } = require('./module/server-module');

// image processing module
const { takeScreenshot } = require('./module/image-module');

// correction module
const { correctionEntry } = require('./module/correction-module');
const { loadJSON_JP } = require('./module/correction-module-jp');
const { loadJSON_EN } = require('./module/correction-module-en');

// audio module
const { startPlaying } = require('./module/audio-module');

// dialog module
const { appendBlankDialog, updateDialog, appendNotification, showDialog, moveToBottom } = require('./module/dialog-module');

// click through temp
let isClickThrough = false;

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    // F12
    document.addEventListener('keydown', (event) => {
        if (event.code === 'F12') {
            ipcRenderer.send('open-devtools');
        }
    });

    setHTML();
    loadJSON();
    startServer();
    startPlaying();
});

// set html
function setHTML() {
    setView();
    setEvent();
    setButton();
}

// set view
function setView() {
    const config = ipcRenderer.sendSync('load-config');

    if (config.translation.autoPlay) {
        document.getElementById('img_button_auto_play').setAttribute('src', './img/ui/volume_up_white_24dp.svg');
    } else {
        document.getElementById('img_button_auto_play').setAttribute('src', './img/ui/volume_off_white_24dp.svg');
    }

    resetView(config);
}

// set event
function setEvent() {
    // document click through
    document.addEventListener('mouseenter', () => {
        if (isClickThrough) {
            ipcRenderer.send('set-click-through', true, { forward: true });
        } else {
            ipcRenderer.send('set-click-through', false);
        }
    });

    document.addEventListener('mouseleave', () => {
        const config = ipcRenderer.sendSync('load-config');

        ipcRenderer.send('set-click-through', false);

        // hide button
        document.querySelectorAll('.auto_hidden').forEach((value) => {
            value.hidden = config.preloadWindow.hideButton;
        });
    });

    // button click through
    let buttonArray = document.getElementsByClassName('img_button');
    for (let index = 0; index < buttonArray.length; index++) {
        const element = buttonArray[index];

        element.addEventListener('mouseenter', () => {
            ipcRenderer.send('set-click-through', false);
        });

        element.addEventListener('mouseleave', () => {
            if (isClickThrough) {
                ipcRenderer.send('set-click-through', true, { forward: true });
            } else {
                ipcRenderer.send('set-click-through', false);
            }
        });
    }

    // mouse move event
    document.addEventListener('mousemove', () => {
        // show dialog
        showDialog();

        // show button
        document.querySelectorAll('.auto_hidden').forEach((value) => {
            value.hidden = false;
        });
    });

    // download json
    ipcRenderer.on('download-json', () => {
        downloadJSON();
    });

    // read json
    ipcRenderer.on('read-json', () => {
        readJSON();
    });

    // start server
    ipcRenderer.on('start-server', () => {
        startServer();
    });

    // append dialog
    ipcRenderer.on('append-dialog', (event, id, code, name, text) => {
        appendBlankDialog(id, code);
        updateDialog(id, name, text);
        moveToBottom();
    });

    // start translation
    ipcRenderer.on('start-translation', (event, dialogData, translation) => {
        correctionEntry(dialogData, translation);
    });

    // restart translation
    ipcRenderer.on('restart-translation', (event, dialogData, translation) => {
        correctionEntry(dialogData, translation, false);
    });

    // reset view
    ipcRenderer.on('reset-view', (event, ...args) => {
        resetView(...args);
    });

    // start screen translation
    ipcRenderer.on('start-screen-translation', (event, ...args) => {
        takeScreenshot(...args);
    });

    // show notification
    ipcRenderer.on('show-notification', (event, text) => {
        appendNotification(text);
    });
}

// set button
function setButton() {
    // upper buttons
    // update
    document.getElementById('img_button_update').onclick = () => {
        try {
            execSync('explorer "https://home.gamer.com.tw/artwork.php?sn=5323128"');
        } catch (error) {
            console.log(error);
        }
    };

    // config
    document.getElementById('img_button_config').onclick = () => {
        ipcRenderer.send('create-window', 'config');
    };

    // capture
    document.getElementById('img_button_capture').onclick = () => {
        ipcRenderer.send('create-window', 'capture');
    };

    // throught
    document.getElementById('img_button_through').onclick = () => {
        isClickThrough = !isClickThrough;

        if (isClickThrough) {
            document.getElementById('img_button_through').setAttribute('src', './img/ui/near_me_white_24dp.svg');
        } else {
            document.getElementById('img_button_through').setAttribute('src', './img/ui/near_me_disabled_white_24dp.svg');
        }
    };

    // minimize
    document.getElementById('img_button_minimize').onclick = () => {
        ipcRenderer.send('minimize-window');
    };

    // close
    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-app');
    };

    // lower buttons
    // auto play
    document.getElementById('img_button_auto_play').onclick = () => {
        let config = ipcRenderer.sendSync('load-config');
        config.translation.autoPlay = !config.translation.autoPlay;
        ipcRenderer.send('save-config', config)
        ipcRenderer.send('mute-window', !config.translation.autoPlay);

        if (config.translation.autoPlay) {
            document.getElementById('img_button_auto_play').setAttribute('src', './img/ui/volume_up_white_24dp.svg');
            startPlaying();
        } else {
            document.getElementById('img_button_auto_play').setAttribute('src', './img/ui/volume_off_white_24dp.svg');
        }
    };

    // read log
    document.getElementById('img_button_read_log').onclick = () => {
        ipcRenderer.send('create-window', 'read_log');
    };

    // delete last one
    document.getElementById('img_button_backspace').onclick = () => {
        try {
            document.getElementById('div_dialog').lastElementChild.remove();
        } catch (error) {
            console.log(error);
        }
    };

    // delete all
    document.getElementById('img_button_clear').onclick = () => {
        document.getElementById('div_dialog').replaceChildren();
    };
}

// reset view
function resetView(config) {
    // set always on top
    ipcRenderer.send('set-always-on-top', config.preloadWindow.alwaysOnTop);

    // set advance buttons
    document.getElementById('div_lower_button').hidden = !config.preloadWindow.advance;

    // set button
    document.querySelectorAll('.auto_hidden').forEach((value) => {
        value.hidden = config.preloadWindow.hideButton;
    });

    // set dialog
    const dialogs = document.querySelectorAll('#div_dialog div');
    if (dialogs.length > 0) {
        dialogs.forEach((value) => {
            value.style.color = config.channel[value.getAttribute('class')];
            value.style.fontSize = config.dialog.fontSize + 'rem';
            value.style.marginTop = config.dialog.spacing + 'rem';
            value.style.borderRadius = config.dialog.radius + 'rem';
            value.style.backgroundColor = config.dialog.backgroundColor;
        });

        document.getElementById('div_dialog').firstElementChild.style.marginTop = 0;
    }

    showDialog();

    // set background color
    document.getElementById('div_dialog').style.backgroundColor = config.preloadWindow.backgroundColor;
}

// load json
function loadJSON() {
    const config = ipcRenderer.sendSync('load-config');

    if (config.system.autoDownloadJson) {
        downloadJSON();
    } else {
        readJSON();
    }
}

// download json
function downloadJSON() {
    try {
        // delete text
        execSync('rmdir /Q /S json\\text');

        // clone json
        downloadGitRepo('winw1010/tataru-helper-node-text-ver.2.0.0#main', 'json/text', (err) => {
            if (err) {
                console.error(err);
            } else {
                appendNotification('對照表下載完畢');
                readJSON();
            }
        });
    } catch (error) {
        console.log(error);
    }
}

// read json
function readJSON() {
    const config = ipcRenderer.sendSync('load-config');

    loadJSON_JP(config.translation.to);
    loadJSON_EN(config.translation.to);

    appendNotification('對照表讀取完畢');

    // version check
    versionCheck();
}

// version check
async function versionCheck() {
    try {
        const response = await axios({
            method: 'get',
            url: 'https://raw.githubusercontent.com/winw1010/tataru-helper-node-text-ver.2.0.0/main/version.json',
            headers: {
                'content-type': 'application/json'
            }
        });
        const latestVersion = response.data.number;
        const appVersion = ipcRenderer.sendSync('get-version');

        if (latestVersion !== appVersion) {
            document.getElementById('img_button_update').hidden = false;
        } else {
            document.getElementById('img_button_update').hidden = true;
        }
    } catch (error) {
        console.log(error);
        document.getElementById('img_button_update').hidden = false;
    }
}