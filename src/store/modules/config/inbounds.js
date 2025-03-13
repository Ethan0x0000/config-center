
export const Inbounds = {
  pc: [
    {
      type: 'mixed',
      tag: 'mixed-in',
      listen: '::',
      listen_port: 8888
    },
    {
      type: 'tun',
      interface_name: 'sb-tun',
      address: '172.19.0.1/30',
      stack: 'system',
      auto_route: true,
      strict_route: true
    }
  ],
  mobile: [
    {
      type: 'mixed',
      tag: 'mixed-in',
      listen: '::',
      listen_port: 8888
    },
    {
      type: 'tun',
      interface_name: 'tun-in',
      address: '172.19.0.1/30',
      stack: 'system',
      auto_route: true,
      gso: false,
      platform: {
        http_proxy: {
          enabled: true,
          server: '127.0.0.1',
          server_port: 8888
        }
      }
    }
  ],
  linux: [
    {
      type: 'mixed',
      tag: 'mixed-in',
      listen: '::',
      listen_port: 8888
    },
    {
      type: 'tproxy',
      tag: 'tproxy-in',
      listen: '::',
      listen_port: 9888
    }
  ]
}