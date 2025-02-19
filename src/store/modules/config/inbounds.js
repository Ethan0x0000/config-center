
export const Inbounds = {
  pc: [
    {
      type: 'mixed',
      tag: 'mixed-in',
      listen: '::',
      listen_port: 8888,
      sniff: true
    },
    {
      type: 'tun',
      interface_name: 'sb-tun',
      address: '172.19.0.1/30',
      stack: 'system',
      sniff: true,
      auto_route: true,
      strict_route: true,
      sniff_override_destination: true,
      gso: false
    }
  ],
  mobile: [
    {
      type: 'mixed',
      tag: 'mixed-in',
      listen: '::',
      listen_port: 8888,
      sniff: true
    },
    {
      type: 'tun',
      interface_name: 'tun-in',
      address: '172.19.0.1/30',
      stack: 'system',
      sniff: true,
      auto_route: true,
      sniff_override_destination: true,
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
      listen_port: 8888,
      sniff: true
    },
    {
      type: 'tproxy',
      tag: 'tproxy-in',
      listen: '::',
      listen_port: 9888,
      sniff: true,
      sniff_override_destination: true
    }
  ]
}