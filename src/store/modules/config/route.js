export const Route = {
  rule_set: [],
  rules: [
    {
      "protocol": "dns",
      "action": "hijack-dns"
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