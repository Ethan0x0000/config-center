export const DNS = {
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
          'org.cn'
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
    strategy: 'prefer_ipv4',
    fakeip: {
      enabled: true,
      inet4_range: '198.18.0.0/15',
      inet6_range: 'fc00::/18'
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
          'org.cn'
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
    strategy: 'prefer_ipv4',
    final: 'remote-dns'
  }
}
