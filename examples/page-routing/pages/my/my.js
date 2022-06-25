// logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: []
  },
  onLoad(){
    console.log("my - onLoad");
  },
  onShow(){
    console.log("my - onShow");
  },
  onReady(){
    console.log("my - onReady");
  },
  onHide(){
    console.log("my - onHide");
  },
  onUnload(){
    console.log("my - onUnload");
  },
})
