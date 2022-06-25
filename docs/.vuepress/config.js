module.exports = {
  title: '点滴记录',
  description: '点击记录',
  base: '/blog/',
  theme: 'reco',
  themeConfig: {
    nav: [
      {
        text: '首页',
        link: '/'
      },
      // {
      //   text: 'Vue',
      //   link: '/vue/'
      // },
      //  {
      //   text: 'Nuxt',
      //   link: '/nuxt/'
      // },
      {
        text: 'Uniapp',
        link: '/uniapp/'
      },
      {
        text: '微信公众号',
        link: '/wechat-public/'
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
      {
        text: '博客',
        items: [
          {
            text: 'GitHub',
            link: 'https://github.com/wangjing013/blog'
          }
        ]
      }
    ],
    sidebar: {
      '/nuxt/': [
        {
          title: "使用",
          collapsable: false,
          sidebarDepth: 2,
          children: [
          ]
        }
      ],
      '/vue/': [
        {
          title: "使用",
          collapsable: false,
          sidebarDepth: 2,
          children: [
          ]
        }
      ],
      '/uniapp/': [
        {
          title: "Uniapp",
          collapsable: false,
          sidebarDepth: 2,
          children: [
            '',
            'created',
            'upx',
            'uviewui',
            'request',
            'router',
            'vuex',
            'persistence',
            'login',
            'get-user-info',
            'get-phone-number',
            'poster',
            'save-image-to-photos-album',
            'scope',
            'upload',
            'download',
            'open-id',
            'schemes',
            'open-app',
            'h5',
            'hybird',
            'channel',
            'pay',
            'keystore',
            'android',
            'ios',
            'faq',
          ]
        }
      ],
      '/flutter/': [
        {
          title: "使用",
          collapsable: false,
          sidebarDepth: 2,
          children: [
          ]
        }
      ],
      '/wechat-public/': [
        {
          title: "公众号",
          collapsable: false,
          sidebarDepth: 2,
          children: [
            '',
            'faq'
          ]
        }
      ],
    },
    lastUpdated: 'Last Updated',
  }
}