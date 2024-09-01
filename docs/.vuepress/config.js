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
      // {
      //   text: 'Vue',
      //   link: '/vue/'
      // },
      //  {
      //   text: 'Nuxt',
      //   link: '/nuxt/'
      // },
      // {
      //   text: 'React',
      //   link: '/react/'
      // },
      {
        text: 'Uniapp',
        link: '/uniapp/',
      },
      {
        text: '微信公众号',
        link: '/wechat-public/',
      },
      // {
      //   text: 'Flutter',
      //   link: '/flutter/'
      // },
      // {
      //   text: 'Webpack',
      //   link: '/webpack/'
      // },
      // {
      //   text: 'NodeJS',
      //   link: '/nodejs/'
      // },
      // {
      //   text: '博客',
      //   items: [
      //     {
      //       text: 'GitHub',
      //       link: 'https://github.com/wangjing013/blog',
      //     },
      //   ],
      // },
    ],
    sidebar: {
      '/nuxt/': [
        {
          title: '使用',
          collapsable: false,
          sidebarDepth: 2,
          children: [],
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
              title: '使用',
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
      '/flutter/': [
        {
          title: '使用',
          collapsable: false,
          sidebarDepth: 2,
          children: [],
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
