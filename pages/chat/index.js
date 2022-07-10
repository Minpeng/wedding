// pages/chat/index.js
const app = getApp();
const utils = require('../../utils/util')
Page({
    /**
     * 页面的初始数据
     */
    data: {
        chatNum: 0,
        inputValue: '',
        chatList: [],
        limit: 9,
        skip: 0,
        count: 0,
        loading: false,
        userInfo: {},
        hasUserInfo: false,
        canIUseGetUserProfile: false,
    },
    async getComment() {
        const mainInfo = await app.globalData.db.collection('comment').orderBy('create_time', 'desc')
            .limit(this.data.limit)
            .skip(this.data.skip)
            .get()
        if (!mainInfo.data.length) {
            wx.showToast({
                title: '已经到底了',
                icon: 'none',
                duration: 2000
            })
        } else {
            let chatNum = mainInfo.data.length + this.data.chatNum
            let chatList = this.data.chatList.concat(mainInfo.data)
            this.setData({
                chatNum: chatNum,
                chatList: chatList
            })
            const skip = mainInfo.data.length + this.data.skip
            if (this.data.limit === 9) {
                this.setData({
                    limit: 10,
                    count: mainInfo.data.length,
                    skip: skip
                })
            } else {
                this.setData({
                    limit: 9,
                    count: mainInfo.data.length,
                    skip: skip
                })
            }
        }
    },
    bindgetuserinfo(e) {
        console.log(e.detail.userInfo)
        this.loading = true
        wx.cloud.callFunction({
            // 云函数名称
            name: 'get_openId'
        })
            .then(res => {
                let sendData = {
                    nickName: e.detail.userInfo.nickName,
                    avatarUrl: e.detail.userInfo.avatarUrl,
                    words: this.data.inputValue==''?"祝福":this.data.inputValue,
                    openId: res.result.openid,
                    create_time: utils.formatTime()
                }
                app.globalData.db.collection('comment').add({
                    data: sendData
                })
                    .then(async res => {
                        this.setData({
                            inputValue: ''
                        })
                        await this.getComment()
                        this.loading = false
                    })
                    .catch(err => {
                        console.log(err);
                        this.loading = false
                    })
            })
            .catch(err => {
                this.loading = false
                console.log(err);
            })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        await this.getComment();
        if (wx.getUserProfile) {
            this.setData({
              canIUseGetUserProfile: false
            })
          }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: async function () {
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: async function () {
        await this.getComment()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        app.shareHandle();
    },
    bindKeyInput: function (e) {
        this.setData({
            inputValue: e.detail.value
        })
    },
    getUserProfile(e) {

        // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
        // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        wx.getUserProfile({
            desc: '获取昵称和头像', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }

        });

    },
    getUserInfo(e) {
        // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },
})