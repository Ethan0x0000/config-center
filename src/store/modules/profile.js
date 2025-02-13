import { v4 as uuidV4 } from 'uuid';
import { experimental, log, dns, inbounds, outbounds, route } from './config';
import { ElMessage } from 'element-plus';

const ARRAY_NAMES = {
  SUBS: 'subs',
  SUB_NODES: 'subNodes',
  MANUAL_NODES: 'manualNodes',
  DNS_ITEMS: 'dnsItems',
  PROXY_RULES: 'proxyRules',
  DIRECT_RULES: 'directRules',
  BLOCK_RULES: 'blockRules',
  UD_RULES: 'udRules',
};

const createNewItem = (arrayName) => {
  switch (arrayName) {
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
      return { id: uuidV4(), name: '', url: '' };
    case ARRAY_NAMES.UD_RULES:
      return { id: uuidV4(), name: '', type: '', isGroup: false, isUse: true, isPriority: true, content: '' };
    default:
      throw new Error(`Invalid array name: ${arrayName}`);
  }
};

function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const newObj = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    newObj[key] = deepCopy(obj[key]);
  }

  return newObj;
}
// 全局配置
function modifyGlobal(config, profile, global) {
  if (profile.isUseGlobal) {
    config.log.disabled = !global.isLog;
    for (let i = 0; i < config.inbounds.length; i++) {
      if (Object.prototype.hasOwnProperty.call(config.inbounds[i], 'sniff_override_destination')) {
        config.inbounds[i].sniff_override_destination = global.isOverDst;
      }
    }
  } else {
    config.log.disabled = !profile.isLog;
    for (let i = 0; i < config.inbounds.length; i++) {
      if (Object.prototype.hasOwnProperty.call(config.inbounds[i], 'sniff_override_destination')) {
        config.inbounds[i].sniff_override_destination = profile.isOverDst;
      }
    }
  }

  // 修改 clash-api 地址
  if (profile.target == 'linux') {
    config.experimental.clash_api.external_controller = '0.0.0.0:9090';
  }
}

// 出站配置
async function generateOutbounds(nodeList, subs, nodeIDs, rootState) {
  let nodes = nodeList.filter(node => nodeIDs.includes(node.id));
  for (let i = 0; i < subs.length; i++) {
    if (subs[i].isGroup) {
      let subNodes = subs[i].usedNodes.map(index => {
        return {
          name: subs[i].subNodes[index].content.tag,
          content: subs[i].subNodes[index].content
        }
      });
      nodes = nodes.concat(subNodes);
    }
  }
  return nodes.map(node => {
    let outbound = deepCopy(node.content);
    outbound.tag = node.name;

    // 版本判断逻辑
    if (outbound.domain_resolver && rootState.user.kernelVersionInfo.current < "1.12.0") {
      delete outbound.domain_resolver;
    }

    return outbound;
  });
}
function processString(str) {
  // 使用正则表达式检查字符串是否以 geosite- 或 geoip- 开头
  const regex = /^(geosite-|geoip-)/;
  let result = str.replace(regex, '');
  // 去掉开头的 geosite- 或 geoip-
  // 将字符串首字母大写
  result = result.charAt(0).toUpperCase() + result.slice(1);
  return result.replace('ai', 'AI');
}
function generateOutboundGroups(outbounds, subs, rules, blocks, udRules, isTogShut) {
  let subGroupNames = subs.filter(sub => sub.isGroup && sub.usedNodes.length > 0).map(item => item.name);
  let subGroups = subs.filter(sub => sub.isGroup && sub.usedNodes.length > 0).map(sub => {
    return {
      tag: sub.name,
      outbounds: sub.usedNodes.map(index => sub.subNodes[index].name),
      type: 'urltest',
      url: 'https://www.gstatic.com/generate_204',
      interval: '5m',
      tolerance: 50,
      idle_timeout: '30m',
      interrupt_exist_connections: false
    }
  });
  let outboundNames = outbounds.map(item => item.tag).concat(subGroupNames);
  for (let i = 0; i < outboundNames.length; i++) {
    if (subGroups.some(group => group.outbounds.includes(outboundNames[i]))) {
      outboundNames.splice(i, 1);
      i--;
    }
  }
  let proxyGroup = {
    tag: 'Proxy',
    outbounds: ['⚡️ Auto'].concat(outboundNames, ['🇨🇳 Direct']),
    interrupt_exist_connections: isTogShut,
    type: 'selector'
  };
  let autoGroup = {
    tag: '⚡️ Auto',
    outbounds: outboundNames,
    type: 'urltest',
    url: 'https://www.gstatic.com/generate_204',
    interval: '3m',
    tolerance: 50,
    idle_timeout: '30m',
    interrupt_exist_connections: false
  };
  let finalGroup = {
    tag: '🏁 Final',
    outbounds: ['Proxy', '⚡️ Auto', '🇨🇳 Direct'],
    interrupt_exist_connections: isTogShut,
    type: 'selector'
  };
  let ruleGroups = rules.map(rule => {
    return {
      tag: processString(rule.name),
      outbounds: ['Proxy'].concat(outboundNames, ['🇨🇳 Direct']),
      interrupt_exist_connections: isTogShut,
      type: 'selector'
    }
  }).filter((item, index, self) =>
    index === self.findIndex(obj => obj.tag === item.tag)
  );
  let blockGroups = blocks.map(rule => {
    return {
      tag: processString(rule.name),
      outbounds: ['block', '🇨🇳 Direct'],
      interrupt_exist_connections: isTogShut,
      type: 'selector'
    }
  }).filter((item, index, self) =>
    index === self.findIndex(obj => obj.tag === item.tag)
  );
  let priorityUdRuleGroups = udRules.filter(rule => {
    return rule.isGroup && rule.isPriority && rule.type === 'proxy';
  }).map(rule => {
    return {
      tag: rule.name,
      outbounds: ['Proxy'].concat(outboundNames, ['🇨🇳 Direct', 'block']),
      interrupt_exist_connections: isTogShut,
      type: 'selector'
    }
  });
  let nonPriorityUdRuleGroups = udRules.filter(rule => {
    return rule.isGroup && !rule.isPriority && rule.type === 'proxy';
  }).map(rule => {
    return {
      tag: rule.name,
      outbounds: ['Proxy'].concat(outboundNames, ['🇨🇳 Direct', 'block']),
      interrupt_exist_connections: isTogShut,
      type: 'selector'
    }
  });

  let groups = [];

  if (priorityUdRuleGroups !== null) {
    groups = groups.concat(proxyGroup, autoGroup, priorityUdRuleGroups, ruleGroups, blockGroups);
  } else {
    groups = groups.concat(proxyGroup, autoGroup, ruleGroups, blockGroups);
  }
  if (nonPriorityUdRuleGroups !== null) {
    groups = groups.concat(nonPriorityUdRuleGroups);
  }

  return groups.concat(subGroups, finalGroup);
}

// DNS配置
function modifyDNS(config, profile, isFakeIP) {
  // 重置 DNS 配置
  if (config.dns) {
    config.dns = {};
  }
  config.dns = isFakeIP ? deepCopy(dns.fakeip) : deepCopy(dns.realip);

  const localDNS = config.dns.servers.find(rule => rule.tag === 'local-dns');
  if (localDNS) {
    localDNS.address = profile.dns.local;
  }

  const remoteDNS = config.dns.servers.find(rule => rule.tag === 'remote-dns');
  if (remoteDNS) {
    remoteDNS.address = profile.dns.remote;
  }

  const resolverDNS = config.dns.servers.find(rule => rule.tag === 'resolver-dns');
  if (resolverDNS) {
    resolverDNS.address = profile.dns.resolver;
  }

  // 处理 local-dns
  const localRules = config.dns.rules.filter(rule => rule.server === 'local-dns');
  if (localRules.length > 0) {
    const lastLocalRule = localRules[localRules.length - 1];
    lastLocalRule.rule_set = profile.directRules.filter(item => {
      const regex = /geoip-/;
      return !regex.test(item.name);
    }).map(item => item.name).concat(profile.blockRules.filter(item => {
      const regex = /geoip-/;
      return !regex.test(item.name);
    }).map(item => item.name));
  }

  // 处理 remote-dns
  if (isFakeIP) {
    const remoteRule = config.dns.rules.find(rule => rule.server === 'fakeip-dns');
    if (remoteRule) {
      remoteRule.rule_set = profile.proxyRules.filter(item => {
        const regex = /geoip-/;
        return !regex.test(item.name);
      }).map(item => item.name);
    }
  } else {
    const remoteRule = config.dns.rules.find(rule => rule.server === 'remote-dns');
    if (remoteRule.length > 0) {
      const lastRemoteRule = remoteRule[remoteRule.length - 1];
      lastRemoteRule.rule_set = profile.proxyRules.filter(item => {
        const regex = /geoip-/;
        return !regex.test(item.name);
      }).map(item => item.name);
    }
  }

  let priorityRules = [];
  let nonPriorityRules = [];
  let allowedKeys = [
    'inbound',
    'ip_version',
    'query_type',
    'auth_user',
    'protocol',
    'domain',
    'domain_suffix',
    'domain_keyword',
    'domain_regex',
    'geosite',
    'process_name',
    'process_path',
    'package_name',
    'user',
    'user_id',
    'clash_mode',
    'wifi_ssid',
    'wifi_bssid',
    'rule_set',
    'invert',
    'outbound',
    'rewrite_ttl',
    'client_subnet',
  ];

  if (Array.isArray(profile.udRules) && profile.udRules.length > 0) {
    priorityRules = profile.udRules.filter(item => {
      return item.isPriority && item.content;
    }).map(item => {
      let ruleObj;
      try {
        ruleObj = JSON.parse(item.content);
      } catch (error) {
        console.error(`Error parsing content for rule ${item.name}: ${error.message}`);
        return null;
      }
      const filteredObject = Object.fromEntries(
        Object.entries(ruleObj)
          .filter(([key]) => allowedKeys.includes(key))
      );
      switch (item.type) {
        case 'direct':
          filteredObject.server = 'local-dns';
          break;
        case 'block':
          filteredObject.server = 'block-dns';
          break;
        case 'proxy':
          filteredObject.server = isFakeIP ? 'fakeip-dns' : 'remote-dns';
          break;
        default:
          break;
      }
      return filteredObject;
    }).filter(ruleObj => ruleObj !== null);

    nonPriorityRules = profile.udRules.filter(item => {
      return !item.isPriority && item.content;
    }).map(item => {
      let ruleObj;
      try {
        ruleObj = JSON.parse(item.content);
      } catch (error) {
        console.error(`Error parsing content for rule ${item.name}: ${error.message}`);
        return null;
      }
      const filteredObject = Object.fromEntries(
        Object.entries(ruleObj)
          .filter(([key]) => allowedKeys.includes(key))
      );
      switch (item.type) {
        case 'direct':
          filteredObject.server = 'local-dns';
          break;
        case 'block':
          filteredObject.server = 'block-dns';
          break;
        case 'proxy':
          filteredObject.server = isFakeIP ? 'fakeip-dns' : 'remote-dns';
          break;
        default:
          break;
      }
      return filteredObject;
    }).filter(content => content !== null);
  }
  if (priorityRules.length > 0) {
    config.dns.rules.splice(0, 0, ...priorityRules);
  }
  if (nonPriorityRules.length > 0) {
    config.dns.rules.splice(config.dns.rules.length - 2, 0, ...nonPriorityRules);
  }

  // 过滤元素
  config.dns.rules = config.dns.rules.filter(rule => {
    // 获取所有的键，排除 'server'
    const keys = Object.keys(rule).filter(key => key !== 'server');

    // 检查非 'server' 属性是否全部为空
    const isEmpty = keys.every(key => {
      const value = rule[key];
      if (Array.isArray(value)) {
        return value.length === 0;
      }
      return !value;
    });

    // 如果非 'server' 属性全部为空，返回 false (过滤掉)
    if (isEmpty) {
      return false;
    }

    // 否则，删除空属性或空数组
    keys.forEach(key => {
      const value = rule[key];
      if (Array.isArray(value) && value.length === 0) {
        delete rule[key];
      } else if (!value) {
        delete rule[key];
      }
    });

    return true;
  });
}

// 入站配置
function modifyInbounds(config, profile, global) {
  switch (profile.target) {
    case 'pc':
      config.inbounds = [...inbounds.pc];
      break;
    case 'mobile':
      config.inbounds = [...inbounds.mobile];
      break;
    case 'linux':
      config.inbounds = [...inbounds.linux];
      break;
    default:
      break;
  }
  for (let i = 0; i < config.inbounds.length; i++) {
    if (Object.prototype.hasOwnProperty.call(config.inbounds[i], 'sniff_override_destination')) {
      config.inbounds[i].sniff_override_destination = profile.isUseGlobal ? global.isOverDst : profile.isOverDst;
    }
  }
}

// 路由配置
function modifyRoutes(config, profile) {
  let proxyRuleSets = profile.proxyRules.map(item => {
    return {
      type: 'remote',
      format: 'binary',
      download_detour: 'Proxy',
      tag: item.name,
      url: item.url,
    }
  });
  let directRuleSets = profile.directRules.map(item => {
    return {
      type: 'remote',
      format: 'binary',
      download_detour: 'Proxy',
      tag: item.name,
      url: item.url,
    }
  });
  let blockRuleSets = profile.blockRules.map(item => {
    return {
      type: 'remote',
      format: 'binary',
      download_detour: 'Proxy',
      tag: item.name,
      url: item.url,
    }
  });
  config.route.rule_set = proxyRuleSets.concat(directRuleSets, blockRuleSets);

  let proxyRules = profile.proxyRules.map(item => {
    return { rule_set: item.name, outbound: processString(item.name) }
  });
  let directRules = profile.directRules.map(item => {
    return { rule_set: item.name, outbound: 'direct' }
  });
  let blockRules = profile.blockRules.map(item => {
    return { rule_set: item.name, outbound: processString(item.name) }
  });

  let priorityUdRules = [];
  let nonPriorityUdRules = [];

  if (Array.isArray(profile.udRules) && profile.udRules.length > 0) {
    priorityUdRules = profile.udRules.filter(item => {
      return item.isPriority && item.type !== 'block' && item.content;
    }).map(item => {
      let ruleObj;
      try {
        ruleObj = JSON.parse(item.content);
      } catch (error) {
        console.error(`Error parsing content for rule ${item.name}: ${error.message}`);
        return null;
      }
      switch (item.type) {
        case 'direct':
          ruleObj.outbound = 'direct';
          break;
        case 'proxy':
          if (item.isGroup) {
            ruleObj.outbound = item.name;
          } else {
            ruleObj.outbound = 'Proxy';
          }
          break;
        default:
          break;
      }
      return ruleObj;
    }).filter(ruleObj => ruleObj !== null);

    nonPriorityUdRules = profile.udRules.filter(item => {
      return !item.isPriority && item.content;
    }).map(item => {
      let ruleObj;
      try {
        ruleObj = JSON.parse(item.content);
      } catch (error) {
        console.error(`Error parsing content for rule ${item.name}: ${error.message}`);
        return null;
      }
      switch (item.type) {
        case 'direct':
          ruleObj.outbound = 'direct';
          break;
        case 'block':
          ruleObj.outbound = 'block';
          break;
        case 'proxy':
          if (item.isGroup) {
            ruleObj.outbound = item.name;
          } else {
            ruleObj.outbound = 'Proxy';
          }
          break;
        default:
          break;
      }
      return ruleObj;
    }).filter(ruleObj => ruleObj !== null);
  }

  config.route.rules = config.route.rules.concat(blockRules, priorityUdRules, proxyRules, nonPriorityUdRules, directRules);
}

async function modifyConfig(config, subs, nodeList, profile, global, rootState) {
  try {
    // 全局配置
    modifyGlobal(config, profile, global);

    // DNS配置
    modifyDNS(config, profile, profile.isUseGlobal ? global.isFakeIP : profile.isFakeIP);

    // 入站配置
    modifyInbounds(config, profile, global);

    // 出站配置
    let outbounds = await generateOutbounds(nodeList, subs, profile.nodeIDs, rootState);
    let outboundGroups = generateOutboundGroups(outbounds, subs, profile.proxyRules, profile.blockRules, profile.udRules, profile.isUseGlobal ? global.isTogShut : profile.isTogShut);
    config.outbounds = config.outbounds.concat(outbounds, outboundGroups);

    // 路由配置
    modifyRoutes(config, profile);
    console.log('modifyConfig success:', config);
    return config;
  } catch (error) {
    console.error('modifyConfig error:', error, config);
  }
}

const profile = {
  namespaced: true,
  state: {
    global: {
      isLog: true,
      isFakeIP: true,
      isOverDst: true,
      isTogShut: false,
    },
    currentProfileID: '',
    subs: [],
    nodeList: [],
    profiles: [
      {
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
            name: 'geosite-bing',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/bing.srs'
          },
          {
            id: uuidV4(),
            name: 'geoip-telegram',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geoip/telegram.srs'
          },
          {
            id: uuidV4(),
            name: 'geosite-telegram',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/telegram.srs'
          },
          {
            id: uuidV4(),
            name: 'geosite-youtube',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/youtube.srs'
          },
          {
            id: uuidV4(),
            name: 'geosite-google',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/google.srs'
          }
        ],
        directRules: [
          {
            id: uuidV4(),
            name: 'geoip-cn',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geoip/cn.srs'
          },
          {
            id: uuidV4(),
            name: 'geosite-cn',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/cn.srs'
          }
        ],
        blockRules: [
          {
            id: uuidV4(),
            name: 'geosite-category-ads-all',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/category-ads-all.srs'
          }
        ],
        udRules: [
          {
            id: uuidV4(),
            name: '云手机',
            type: 'direct',
            isGroup: false,
            isUse: true,
            isPriority: true,
            content: '{\n  "domain_suffix": [\n    ".mogume.com",\n    ".dutils.com"\n  ]\n}\n'
          }
        ],
        value: '',
      }
    ],
    profilesMap: {},
  },
  mutations: {
    setGlobal(state, value) {
      state.global = value;
    },
    initCurrentProfileID(state) {
      // 根据情况赋值 currentProfileID
      if (state.currentProfileID === '') {
        if (state.profiles.length > 0) {
          state.currentProfileID = state.profiles[0].id;
        } else {
          state.currentProfileID = '';
        }
      }
    },
    setCurrentProfileID(state, id) {
      state.currentProfileID = id;
    },
    // 针对 subs 数组进行操作
    setSubs(state, subs) {
      state.subs = subs;
    },
    setSub(state, sub) {
      const index = state.subs.findIndex(item => item.id === sub.id);
      if (index > -1) {
        state.subs.splice(index, 1, sub);
      }
    },
    addSub(state) {
      const newSub = createNewItem(ARRAY_NAMES.SUBS);
      state.subs.push(newSub);
    },
    deleteSub(state, id) {
      const index = state.subs.findIndex(item => item.id === id);
      if (index > -1) {
        state.subs.splice(index, 1);
      }
    },
    // 针对 manualNodes 数组进行操作
    setNodeList(state, nodes) {
      state.nodeList = nodes;
    },
    setNode(state, node) {
      const index = state.nodeList.findIndex(item => item.id === node.id);
      if (index > -1) {
        state.nodeList.splice(index, 1, node);
      }
    },
    addNodeList(state) {
      const newNode = createNewItem(ARRAY_NAMES.MANUAL_NODES);
      state.nodeList.push(newNode);
    },
    deleteNodeList(state, id) {
      const index = state.nodeList.findIndex(item => item.id === id);
      if (index > -1) {
        state.nodeList.splice(index, 1);
      }
    },
    // 针对整个 profiles 数组进行操作
    setProfiles(state, profiles) {
      state.profiles = profiles;
    },
    addProfile(state) {
      const newProfile = {
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
            name: 'geosite-bing',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/bing.srs'
          },
          {
            id: uuidV4(),
            name: 'geoip-telegram',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geoip/telegram.srs'
          },
          {
            id: uuidV4(),
            name: 'geosite-telegram',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/telegram.srs'
          },
          {
            id: uuidV4(),
            name: 'geosite-youtube',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/youtube.srs'
          },
          {
            id: uuidV4(),
            name: 'geosite-google',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/google.srs'
          }
        ],
        directRules: [
          {
            id: uuidV4(),
            name: 'geoip-cn',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geoip/cn.srs'
          },
          {
            id: uuidV4(),
            name: 'geosite-cn',
            url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/geosite/cn.srs'
          }
        ],
        blockRules: [
        ],
        udRules: [
        ],
        value: '',
      };
      state.profiles.push(newProfile);
    },
    deleteProfile(state, id) {
      const index = state.profiles.findIndex(profile => profile.id === id);
      if (index > -1) {
        state.profiles.splice(index, 1);
      }
    },
    copyProfile(state, id) {
      const index = state.profiles.findIndex(profile => profile.id === id);
      if (index > -1) {
        const targetProfile = state.profiles[index];
        const newProfile = deepCopy(targetProfile);
        newProfile.id = uuidV4();
        newProfile.name = targetProfile.name + '-副本';
        state.profiles.splice(index + 1, 0, newProfile);
      }
    },
    // 针对单个 profile 进行操作
    setProfileProperty(state, { profileID, propertyName, value }) {
      const index = state.profiles.findIndex(profile => profile.id === profileID);
      if (index > -1) {
        if (propertyName === 'name' && value === '') {
          value = '新配置';
        }
        state.profiles[index][propertyName] = value;
      }
    },
    addProfileArrayItem(state, { profileID, arrayName }) {
      if (typeof profileID !== 'string' || typeof arrayName !== 'string') {
        throw new Error('Invalid arguments');
      }

      const profileIndex = state.profiles.findIndex((profile) => profile.id === profileID);
      if (profileIndex === -1) {
        throw new Error(`Profile with id ${profileID} not found`);
      }
      const profile = state.profiles[profileIndex];
      const arrayKey = arrayName.charAt(0).toLowerCase() + arrayName.slice(1);

      if (!Object.prototype.hasOwnProperty.call(profile, arrayKey)) {
        throw new Error(`Invalid array name: ${arrayName}`);
      }

      profile[arrayKey].push(createNewItem(arrayName));
    },
    deleteProfileArrayItem(state, { profileID, arrayName, itemID }) {
      if (typeof profileID !== 'string' || typeof arrayName !== 'string' || typeof itemID !== 'string') {
        throw new Error('Invalid arguments');
      }

      const profileIndex = state.profiles.findIndex((profile) => profile.id === profileID);
      if (profileIndex === -1) {
        throw new Error(`Profile with id ${profileID} not found`);
      }

      const profile = state.profiles[profileIndex];
      const arrayKey = arrayName.charAt(0).toLowerCase() + arrayName.slice(1);

      if (!Object.prototype.hasOwnProperty.call(profile, arrayKey)) {
        throw new Error(`Invalid array name: ${arrayName}`);
      }

      const itemIndex = profile[arrayKey].findIndex((item) => item.id === itemID);
      if (itemIndex === -1) {
        throw new Error(`Item with id ${itemID} not found in ${arrayName}`);
      }

      profile[arrayKey].splice(itemIndex, 1);
    },
    setProfileArrayItem(state, { profileID, arrayName, payload }) {
      const index0 = state.profiles.findIndex(profile => profile.id === profileID);
      if (index0 > -1) {
        const index1 = state.profiles[index0][arrayName].findIndex(item => item.id === payload.id);
        state.profiles[index0][arrayName].splice(index1, 1, payload);
      }
    },
    setProfileValue(state, { profileID, value }) {
      const index = state.profiles.findIndex(profile => profile.id === profileID);
      if (index > -1) {
        state.profiles[index].value = value;
      }
    },
    addNodeID(state, { profileID, nodeID }) {
      state.profilesMap[profileID].nodeIDs.push(nodeID);
    },
    deleteNodeID(state, { profileID, nodeID }) {
      const index = state.profilesMap[profileID].nodeIDs.findIndex(item => item === nodeID);
      if (index > -1) {
        state.profilesMap[profileID].nodeIDs.splice(index, 1);
      }
    },
    // 针对 profilesMap 进行操作
    setProfilesMap(state) {
      state.profilesMap = state.profiles.reduce((map, profile) => {
        map[profile.id] = profile;
        return map;
      }, {});
    },
  },
  actions: {
    setProfile({ commit }, payload) {
      commit('setGlobal', payload.global);
      commit('setCurrentProfileID', payload.currentProfileID);
      commit('setSubs', payload.subs);
      commit('setNodeList', payload.nodeList);
      commit('setProfiles', payload.profiles);
      commit('setProfilesMap');
    },
    initProfile({ commit, state }) {
      if (state.profiles.length == 0) {
        commit('addProfile');
      }
      commit('initCurrentProfileID');
      commit('setProfilesMap');
    },
    addProfile({ commit, state }) {
      if (state.profiles.length == 0) {
        commit('addProfile');
        commit('setProfilesMap');
        commit('setCurrentProfileID', state.profiles[0].id);
      } else {
        commit('addProfile');
        commit('setProfilesMap');
      }
    },
    deleteProfile({ commit, state, dispatch }, id) {
      commit('deleteProfile', id);
      commit('setProfilesMap');
      if (state.currentProfileID === id && state.profiles.length > 0) {
        commit('setCurrentProfileID', state.profiles[0].id);
      }
      if (state.profiles.length == 0) {
        dispatch('addProfile');
      }
    },
    copyProfile({ commit }, id) {
      commit('copyProfile', id);
      commit('setProfilesMap');
    },
    async generateConfig({ commit, state, rootState }, id) {
      const profile = state.profilesMap[id];
      let config = {
        experimental: deepCopy(experimental),
        log: deepCopy(log),
        dns: {},
        inbounds: [],
        outbounds: deepCopy(outbounds),
        route: deepCopy(route)
      };


      try {
        config = await modifyConfig(config, state.subs, state.nodeList, profile, state.global, rootState);
        const jsonConfig = JSON.stringify(config, null, 2);
        commit('setProfileValue', { profileID: id, value: jsonConfig });
        ElMessage.success('配置生成成功');
      } catch (error) {
        ElMessage.error('配置生成失败', error.message);
      }
    },
  }
}

export default profile