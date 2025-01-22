export const experimental = {
  cache_file: {
    enabled: true,
    path: 'cache.db',
    cache_id: 'my_profile',
    store_fakeip: true,
  },
  clash_api: {
    external_ui: 'ui',
    external_controller: '127.0.0.1:9090',
    external_ui_download_detour: 'Proxy',
    default_mode: 'rule',
    external_ui_download_url: 'https://github.com/Ethan0x0000/rule-set/releases/download/1.0/MetaXCubed.zip'
  }
}

export const log = {
  disabled: false,
  level: 'info',
  timestamp: true,
}

export const dns = {
  fakeip: {
    servers: [
      {
        tag: 'local-dns',
        address: '223.5.5.5',
        address_resolver: 'resolver-dns',
        detour: 'direct'
      },
      {
        tag: 'remote-dns',
        address: '8.8.8.8',
        address_resolver: 'resolver-dns',
        detour: 'direct'
      },
      {
        tag: 'resolver-dns',
        address: '223.5.5.5',
        detour: 'direct'
      },
      {
        tag: 'fakeip-dns',
        address: 'fakeip'
      },
      {
        tag: 'block-dns',
        address: 'rcode://success'
      }
    ],
    rules: [
      {
        rule_set: [],
        query_type: [
          'HTTPS',
          'SVCB'
        ],
        server: 'block-dns'
      },
      {
        outbound: 'any',
        server: 'remote-dns'
      },
      {
        domain_suffix: [
          'edu.cn',
          'gov.cn',
          'mil.cn',
          'ac.cn',
          'com.cn',
          'net.cn',
          'org.cn',
          'xn--fiqz9s',
          'xn--fiqs8s',
          'xn--fiq228c'
        ],
        server: 'local-dns'
      },
      {
        domain_keyword: [
          '中国',
          '中國'
        ],
        server: 'local-dns'
      },
      {
        rule_set: [],
        rewrite_ttl: 1,
        server: 'fakeip-dns'
      },
      {
        rule_set: [],
        server: 'local-dns'
      },
      {
        query_type: [
          'A'
        ],
        rewrite_ttl: 1,
        server: 'fakeip-dns'
      }
    ],
    strategy: 'ipv4_only',
    fakeip: {
      enabled: true,
      inet4_range: '198.18.0.0/15'
    }
  },
  realip: {
    servers: [
      {
        tag: 'local-dns',
        address: '223.5.5.5',
        address_resolver: 'resolver-dns',
        detour: 'direct'
      },
      {
        tag: 'remote-dns',
        address: '8.8.8.8',
        address_resolver: 'resolver-dns',
        detour: 'direct'
      },
      {
        tag: 'resolver-dns',
        address: '223.5.5.5',
        detour: 'direct'
      },
      {
        tag: 'block-dns',
        address: 'rcode://success'
      }
    ],
    rules: [
      {
        rule_set: [],
        query_type: [
          'HTTPS',
          'SVCB'
        ],
        server: 'block-dns'
      },
      {
        outbound: 'any',
        server: 'remote-dns'
      },
      {
        domain_suffix: [
          'edu.cn',
          'gov.cn',
          'mil.cn',
          'ac.cn',
          'com.cn',
          'net.cn',
          'org.cn',
          'xn--fiqz9s',
          'xn--fiqs8s',
          'xn--fiq228c'
        ],
        server: 'local-dns'
      },
      {
        domain_keyword: [
          '中国',
          '中國'
        ],
        server: 'local-dns'
      },
      {
        rule_set: [],
        server: 'remote-dns'
      },
      {
        rule_set: [],
        server: 'local-dns'
      }
    ],
    strategy: 'ipv4_only',
    final: 'remote-dns'
  }
}

export const inbounds = {
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
      type: 'tun',
      tag: 'tun-in',
      interface_name: 'tun0',
      address: [
        '172.18.0.1/30',
        'fdfe:dcba:9876::1/126'
      ],
      mtu: 9000,
      auto_route: true,
      iproute2_table_index: 2022,
      iproute2_rule_index: 9000,
      auto_redirect: true,
      auto_redirect_input_mark: '0x2023',
      auto_redirect_output_mark: '0x2024',
      strict_route: true,
      sniff: true,
      sniff_override_destination: true
    }
  ]
}

export const outbounds = [
  {
    type: 'direct',
    tag: 'direct'
  },
  {
    type: 'direct',
    tag: '🇨🇳 Direct'
  },
  {
    type: 'dns',
    tag: 'dns-out'
  },
  {
    type: 'block',
    tag: 'block'
  }
]

export const route = {
  rule_set: [],
  rules: [
    {
      protocol: [
        'dns'
      ],
      outbound: 'dns-out'
    },
    {
      port: 53,
      outbound: 'dns-out'
    },
    {
      type: 'logical',
      mode: 'or',
      rules: [
        {
          port: 853
        },
        {
          network: 'udp',
          port: 443
        },
        {
          protocol: 'stun'
        }
      ],
      outbound: 'block'
    },
    {
      domain_suffix: [
        'edu.cn',
        'gov.cn',
        'mil.cn',
        'ac.cn',
        'com.cn',
        'net.cn',
        'org.cn',
        'xn--fiqz9s',
        'xn--fiqs8s',
        'xn--fiq228c',
      ],
      outbound: 'direct'
    },
    {
      domain_keyword: [
        '中国',
        '中國'
      ],
      outbound: 'direct'
    },
    {
      ip_is_private: true,
      outbound: 'direct'
    },
    {
      clash_mode: 'Direct',
      outbound: 'direct'
    },
    {
      clash_mode: 'Global',
      outbound: 'Proxy'
    }
  ],
  auto_detect_interface: true,
  final: '🏁 Final'
}