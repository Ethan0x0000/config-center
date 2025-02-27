import { v4 as uuidV4 } from 'uuid';

export const ARRAY_NAMES = {
  PROFILES: 'profiles',
  SUBS: 'subs',
  SUB_NODES: 'subNodes',
  MANUAL_NODES: 'manualNodes',
  DNS_ITEMS: 'dnsItems',
  PROXY_RULES: 'proxyRules',
  DIRECT_RULES: 'directRules',
  BLOCK_RULES: 'blockRules',
  UD_RULES: 'udRules',
  OUT_GROUPS: 'outGroups',
  RULE_GROUPS: 'ruleGroups'
};

export const createNewItem = (arrayName) => {
  switch (arrayName) {
    case ARRAY_NAMES.PROFILES:
      return {
        id: uuidV4(),
        name: '新配置',
        isUseGlobal: true,
        isLog: true,
        isFakeIP: true,
        isOverDst: true,
        isTogShut: false,
        target: 'pc',
        dns: {
          local: '223.5.5.5',
          remote: '8.8.8.8',
          resolver: '223.5.5.5',
        },
        nodeIDs: [],
        proxyRules: [
          {
            id: uuidV4(),
            name: 'geoip-telegram',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geoip/telegram.srs',
            groupName: '自动生成'
          },
          {
            id: uuidV4(),
            name: 'geosite-telegram',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/telegram.srs',
            groupName: '自动生成'
          },
          {
            id: uuidV4(),
            name: 'geosite-youtube',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/youtube.srs',
            groupName: '自动生成'
          },
          {
            id: uuidV4(),
            name: 'geosite-google',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/google.srs',
            groupName: '自动生成'
          }
        ],
        directRules: [
          {
            id: uuidV4(),
            name: 'geoip-cn',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geoip/cn.srs',
            groupName: '自动生成'
          },
          {
            id: uuidV4(),
            name: 'geosite-cn',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/cn.srs',
            groupName: '自动生成'
          }
        ],
        blockRules: [
          {
            id: uuidV4(),
            name: 'geosite-category-ads-all',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/category-ads-all.srs',
            groupName: '自动生成'
          }
        ],
        udRules: [],
        outGroups: [],
        ruleGroups: [],
        value: '',
      };
    case ARRAY_NAMES.SUBS:
      return { id: uuidV4(), name: '新订阅', url: '', subNodes: [], usedNodes: [], expirationDate: '', remainingData: '', isGroup: false, isUse: true, isEnhanced: false };
    case ARRAY_NAMES.MANUAL_NODES:
      return { id: uuidV4(), name: '', link: '', content: {} };
    case ARRAY_NAMES.SUB_NODES:
      return { name: '', content: {} };
    case ARRAY_NAMES.DNS_ITEMS:
      return { id: uuidV4(), name: '', address: '' };
    case ARRAY_NAMES.PROXY_RULES:
    case ARRAY_NAMES.DIRECT_RULES:
    case ARRAY_NAMES.BLOCK_RULES:
      return { id: uuidV4(), name: '', url: '', groupName: '自动生成' };
    case ARRAY_NAMES.UD_RULES:
      return { id: uuidV4(), name: '', type: '', isGroup: false, isUse: true, isPriority: true, content: '' };
    case ARRAY_NAMES.OUT_GROUPS:
      return { id: uuidV4(), name: '', type: 'url_test' };
    case ARRAY_NAMES.RULE_GROUPS:
      return { id: uuidV4(), name: '' };
    default:
      throw new Error(`Invalid array name: ${arrayName}`);
  }
};
