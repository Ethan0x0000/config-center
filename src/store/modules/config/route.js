export const Route = {
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
        'org.cn'
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