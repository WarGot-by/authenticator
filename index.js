var self = require("sdk/self");
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var panels = require("sdk/panel")
var ss = require("sdk/simple-storage");
var notifications = require("sdk/notifications");

var button = buttons.ActionButton({
  id: "mozilla-link",
  label: "PassSecurium",
  icon: {
    "16": "./images/icon16.png",
    "38": "./images/icon38.png",
    "128": "./images/icon128.png"
  },
  onClick: handleMenu
});

var loginPanel = panels.Panel({
  width: 400,
  height: 500,
  //contentURL: "./index.html"
  contentURL: self.data.url("popup.html"),
  //contentScriptFile: [self.data.url("app.js"), self.data.url('addon-window.js')]
});

function handleMenu(){
  loginPanel.show({
    position: button
  });
}