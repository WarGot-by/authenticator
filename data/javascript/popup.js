var otp = new KeyUtilities();
var getCode = otp.generate;
var _secret = [];
var deleteIdList = [];
var deleteKeyList = [];

var dragBox;
var notificationTimeout;
var editTimeout;
var decodedPhrase;
var shownPassphrase = false;


if (localStorage.phrase) {
    console.log(1);
    decodedPhrase = localStorage.phrase;
    if (localStorage.notRememberPassphrase) {
        document.cookie = 'passphrase=' + CryptoJS.AES.encrypt(phrase, '').toString();
        localStorage.removeItem('encodedPhrase');
    } else {
        localStorage.encodedPhrase = CryptoJS.AES.encrypt(phrase, '').toString();
    }
    localStorage.removeItem('phrase');
} else if (localStorage.encodedPhrase) {
    console.log(2);
    decodedPhrase = CryptoJS.AES.decrypt(localStorage.encodedPhrase, '').toString(CryptoJS.enc.Utf8);
} else if (document.cookie) {
    console.log(3);
    decodedPhrase = CryptoJS.AES.decrypt(document.cookie.split('passphrase=')[1], '').toString(CryptoJS.enc.Utf8);
}

document.getElementById('extName').innerText = chrome.i18n.getMessage('extShortName');
document.getElementById('add_qr').innerText = chrome.i18n.getMessage('add_qr');
document.getElementById('add_secret').innerText = chrome.i18n.getMessage('add_secret');
document.getElementById('totp_label').innerText = chrome.i18n.getMessage('based_on_time');
document.getElementById('hotp_label').innerText = chrome.i18n.getMessage('based_on_counter');
document.getElementById('add_button').innerText = chrome.i18n.getMessage('ok');
document.getElementById('message_close').innerText = chrome.i18n.getMessage('ok');
document.getElementById('account_label').innerText = chrome.i18n.getMessage('account');
document.getElementById('secret_label').innerText = chrome.i18n.getMessage('secret');
document.getElementById('menuName').innerText = chrome.i18n.getMessage('settings');
document.getElementById('security_new_phrase_label').innerText = chrome.i18n.getMessage('phrase');
document.getElementById('security_confirm_phrase_label').innerText = chrome.i18n.getMessage('confirm_phrase');
document.getElementById('security_warning').innerText = chrome.i18n.getMessage('security_warning');
document.getElementById('exportButton').innerText = chrome.i18n.getMessage('update');
document.getElementById('resize_save').innerText = chrome.i18n.getMessage('ok');
document.getElementById('security_save').innerText = chrome.i18n.getMessage('ok');
document.getElementById('passphrase_info').innerText = chrome.i18n.getMessage('passphrase_info');
document.getElementById('passphrase_phrase_label').innerText = chrome.i18n.getMessage('passphrase');
document.getElementById('remember_new_phrase_label').innerText = chrome.i18n.getMessage('remember_phrase');
document.getElementById('remember_phrase_label').innerText = chrome.i18n.getMessage('remember_phrase');
document.getElementById('resize_list_label').innerText = chrome.i18n.getMessage('scale');
document.getElementById('passphrase_ok').innerText = chrome.i18n.getMessage('ok');
document.getElementById('version').innerText = 'Version ' + chrome.runtime.getManifest().version;

document.getElementById('menuAbout').innerHTML += chrome.i18n.getMessage('about');
document.getElementById('menuExImport').innerHTML += chrome.i18n.getMessage('export_import');
document.getElementById('menuSecurity').innerHTML += chrome.i18n.getMessage('security');
document.getElementById('menuSyncTime').innerHTML += chrome.i18n.getMessage('sync_clock');
document.getElementById('menuResize').innerHTML += chrome.i18n.getMessage('resize_popup_page');
document.getElementById('menuSource').innerHTML += chrome.i18n.getMessage('source');
document.getElementById('menuFeedback').innerHTML += chrome.i18n.getMessage('feedback');

if (localStorage.notRememberPassphrase === 'true') {
    document.getElementById('remember_new_phrase').checked = false;
    document.getElementById('remember_phrase').checked = false;
}

chrome.storage.sync.get(showCodes);

document.getElementById('menuExImport').onclick = showExport;

document.getElementById('menuAbout').onclick = function () {
    document.getElementById('info').className = 'fadein';
    setTimeout(function () {
        document.getElementById('info').style.opacity = 1;
        document.getElementById('infoContent').innerHTML = chrome.i18n.getMessage('info');
    }, 200);
}

document.getElementById('menuSecurity').onclick = function () {
    document.getElementById('security').className = 'fadein';
    setTimeout(function () {
        document.getElementById('security').style.opacity = 1;
    }, 200);
}

chrome.permissions.contains({
    origins : ['https://www.google.com/']
}, function (hasPermission) {
    if (hasPermission) {
        syncTimeWithGoogle(false);
    }
});

document.getElementById('menuSyncTime').onclick = function () {
    chrome.permissions.request({
        origins : ['https://www.google.com/']
    }, function (granted) {
        if (granted) {
            syncTimeWithGoogle(true);
        }
    });
}

document.getElementById('menuResize').onclick = function () {
    document.getElementById('resize').className = 'fadein';
    setTimeout(function () {
        document.getElementById('resize').style.opacity = 1;
    }, 200);
}

document.getElementById('resize_save').onclick = function () {
    var zoom = document.getElementById('resize_list').value;
    localStorage.zoom = zoom;
    window.close();
}

document.getElementById('security_save').onclick = function () {
    var phrase = document.getElementById('security_new_phrase').value;
    var phrase2 = document.getElementById('security_confirm_phrase').value;
    if (phrase === phrase2) {
        document.getElementById('security_new_phrase').value = '';
        document.getElementById('security_confirm_phrase').value = '';
        localStorage.notRememberPassphrase = (!document.getElementById('remember_new_phrase').checked).toString();
        document.getElementById('remember_phrase').checked = document.getElementById('remember_new_phrase').checked;
        encryptSecret(phrase, true, function () {
            showMessage(chrome.i18n.getMessage('updateSuccess'), function () {
                document.getElementById('security').className = 'fadeout';
                setTimeout(function () {
                    document.getElementById('security').className = '';
                    document.getElementById('security').style.opacity = 0;
                }, 200);
            });
        }, function () {
            showMessage(chrome.i18n.getMessage('phrase_incorrect'));
        });
    } else {
        showMessage(chrome.i18n.getMessage('phrase_not_match'));
    }
}

document.getElementById('phrase').onkeydown = function(e) {
    if (e.keyCode === 13) {
        var phrase = document.getElementById('phrase').value;
        document.getElementById('phrase').value = '';
        localStorage.notRememberPassphrase = (!document.getElementById('remember_phrase').checked).toString();
        document.getElementById('remember_new_phrase').checked = document.getElementById('remember_phrase').checked;
        encryptSecret(phrase, false, function () {
            document.getElementById('passphrase').className = 'fadeout';
            setTimeout(function () {
                document.getElementById('passphrase').className = '';
                document.getElementById('passphrase').style.opacity = 0;
            }, 200);
        }, function () {
            showMessage(chrome.i18n.getMessage('phrase_incorrect'));
        });
    }
}

document.getElementById('passphrase_ok').onclick = function () {
    var phrase = document.getElementById('phrase').value;
    document.getElementById('phrase').value = '';
    localStorage.notRememberPassphrase = (!document.getElementById('remember_phrase').checked).toString();
    document.getElementById('remember_new_phrase').checked = document.getElementById('remember_phrase').checked;
    encryptSecret(phrase, false, function () {
        document.getElementById('passphrase').className = 'fadeout';
        setTimeout(function () {
            document.getElementById('passphrase').className = '';
            document.getElementById('passphrase').style.opacity = 0;
        }, 200);
    }, function () {
        showMessage(chrome.i18n.getMessage('phrase_incorrect'));
    });
}

document.getElementById('securityClose').onclick = function () {
    document.getElementById('security').className = 'fadeout';
    setTimeout(function () {
        document.getElementById('security').className = '';
        document.getElementById('security').style.opacity = 0;
    }, 200);
}

document.getElementById('resizeClose').onclick = function () {
    document.getElementById('resize').className = 'fadeout';
    setTimeout(function () {
        document.getElementById('resize').className = '';
        document.getElementById('resize').style.opacity = 0;
    }, 200);
}

document.getElementById('passphraseClose').onclick = function () {
    document.getElementById('passphrase').className = 'fadeout';
    setTimeout(function () {
        document.getElementById('passphrase').className = '';
        document.getElementById('passphrase').style.opacity = 0;
    }, 200);
}







(function () {
    // Remind backup
    var clientTime = new Date();
    clientTime = Math.floor(clientTime.getTime() / 1000 / 3600 / 24);
    if (!localStorage.lastRemindingBackupTime) {
        localStorage.lastRemindingBackupTime = clientTime;
    } else if (clientTime - localStorage.lastRemindingBackupTime >= 30 || clientTime - localStorage.lastRemindingBackupTime < 0) {
        showMessage(chrome.i18n.getMessage('remind_backup'));
        localStorage.lastRemindingBackupTime = clientTime;
    }

    // Resize
    var zoom = localStorage.zoom || '100';
    document.getElementById('resize_list').value = zoom;
    resize(zoom);

    // Click extension name 5 times to show export box
    var extName = document.getElementById('extName');
    var count = 0;
    var timer;
    extName.onclick = function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
                count = 0;
            }, 1000);

        count++;
        if (count == 5) {
            count = 0;
            showExport();
        }
    };
})();
