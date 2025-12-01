module.exports = {
  title: '点滴记录',
  description: '点击记录',
  base: '/blog/',
  theme: 'reco',
  themeConfig: {
    nav: [
      {
        text: '首页',
        link: '/',
      },
      {
        text: 'React',
        link: '/react/'
      },
       {
        text: 'Vue',
        link: '/vue/'
      },
       {
        text: 'Nuxt',
        link: '/nuxt/'
      },
      {
        text: 'Uniapp',
        link: '/uniapp/',
      },
      {
        text: '微信公众号',
        link: '/wechat-public/',
      },
    ],
    sidebar: {
      '/react/':[
        {
          title: '通用',
          collapsable: false,
          children: [
            '',
            'create/',
            'context/',
            'faq/'
          ],
        },
      ],
      '/nuxt/': [
        {
          title: '使用',
          collapsable: false,
          sidebarDepth: 2,
          children: [
            '',
            'pages',
            'style',
            'icons',
            'lifecycle',
            'plugins',
            'middleware',
            'utils',
            'state-management',
            'deployment'
          ],
        },
      ],
      '/vue/': [
        {
          title: '使用',
          collapsable: false,
          sidebarDepth: 2,
          children: [],
        },
      ],
      '/uniapp/': [
        {
          title: 'Uniapp',
          sidebarDepth: 2,
          children: [
            {
              title: '通用',
              sidebarDepth: 3,
              children: [
                '',
                'created',
                'request',
                'state',
                'event-channel',
                'animation'
              ],
            },
            {
              title: 'H5',
              sidebarDepth: 3,
              children: [
                'hybird',
                'h5-album',
                'open-app',
              ],
            },
            {
              title: '小程序',
              sidebarDepth: 3,
              children: [
                'open-id',
                'login',
                'auth',
                'file-md5',
                'upload',
                // 'poster',
                'mini-album',
                'scope',
                'faq',
              ],
            },
            {
              title: 'APP',
              sidebarDepth: 3,
              children: [
                'keystore',
                'android',
                'ios',
                'channel',
                'app-album',
                'pay',
              ],
            }
          ],
        },
      ],
      '/wechat-public/': [
        {
          title: '公众号',
          collapsable: false,
          sidebarDepth: 2,
          children: ['', 'faq'],
        },
      ],
    },
    lastUpdated: 'Last Updated',
  },
};
