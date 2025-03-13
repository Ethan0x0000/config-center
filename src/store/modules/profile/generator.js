import { deepCopy, processString } from "./utils.js";
import configModule from '../config/index.js';

const {
  Experimental,
  Log,
  DNS,
  Inbounds,
  Outbounds,
  Route
} = configModule;


/**
 * 根据配置文件和全局设置修改主配置对象
 * 
 * @param {Object} config - 主配置对象，将被直接修改
 * @param {Object} profile - 当前配置文件对象，包含用户特定设置
 * @param {Object} global - 全局配置对象，包含默认/全局设置
 * @returns {void} 无返回值，直接修改传入的config对象
 */
function modifyGlobal(config, profile, global) {
  /* 根据是否使用全局设置，选择配置来源更新日志和入站设置 */
  if (profile.isUseGlobal) {
    // 使用全局设置覆盖日志禁用状态
    config.log.disabled = !global.isLog;
  } else {
    // 使用配置文件自身设置覆盖日志禁用状态
    if (!config.log) {
      config.log = {};
    }
    config.log.disabled = !profile.isLog;
  }

  /* 针对Linux平台的特殊配置 */
  if (profile.target == 'linux') {
    // 强制设置Clash API控制器监听地址
    config.experimental.clash_api.external_controller = '0.0.0.0:9090';
  }
}

/**
 * 根据节点列表、订阅信息、节点ID生成出站配置
 * 
 * @param {Array} nodeList 节点列表
 * @param {Array} subs 订阅信息
 * @param {Array} nodeIDs 节点ID列表
 * @param {Object} rootState 全局状态对象，用于获取版本信息
 * @returns {Promise<Array>} 返回处理后的出站配置数组
 */
async function generateOutbounds(nodeList, subs, nodeIDs, rootState) {
  // 过滤节点列表，只保留节点ID在nodeIDs中的节点
  let nodes = nodeList.filter(node => nodeIDs.includes(node.id));

  // 遍历订阅信息，处理每个订阅
  for (let i = 0; i < subs.length; i++) {
    // 如果当前订阅是组，则处理其包含的节点
    if (subs[i].isGroup) {
      // 映射订阅中的节点，提取其标签和内容
      let subNodes = subs[i].usedNodes.map(index => {
        return {
          name: subs[i].subNodes[index].content.tag,
          content: subs[i].subNodes[index].content
        }
      });
      // 将订阅中的节点与之前的节点合并
      nodes = nodes.concat(subNodes);
    }
  }

  // 处理并返回最终的出站配置数组
  return nodes.map(node => {
    // 深拷贝节点内容，以避免修改原始数据
    let outbound = deepCopy(node.content);
    // 设置标签为节点名称
    outbound.tag = node.name;

    // 版本判断逻辑
    // 如果当前配置包含domain_resolver且版本低于1.12.0，则删除该配置项
    if (outbound.domain_resolver && rootState.user.kernelVersionInfo.current < "1.12.0") {
      delete outbound.domain_resolver;
    }

    // 返回处理后的出站配置
    return outbound;
  });
}

/**
 * 生成出站组配置
 * 
 * @param {Array} outbounds - 出站节点列表
 * @param {Array} subs - 订阅组列表
 * @param {Array} rules - 规则列表
 * @param {Array} udRules - 用户定义规则列表
 * @param {boolean} isTogShut - 是否中断现有连接
 * @returns {Array} - 生成的出站组配置列表
 */
function generateOutboundGroups(outbounds, subs, rules, udRules, outGroups, isTogShut) {
  // 过滤并提取订阅组名称
  let subGroupNames = subs.filter(sub => sub.isGroup && sub.usedNodes.length > 0).map(item => item.name);

  // 构建订阅组配置
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

  // 合并出站节点和订阅组名称
  let outboundNames = outbounds.map(item => item.tag).concat(subGroupNames);

  // 移除被订阅组包含的出站节点
  for (let i = 0; i < outboundNames.length; i++) {
    if (subGroups.some(group => group.outbounds.includes(outboundNames[i]))) {
      outboundNames.splice(i, 1);
      i--;
    }
  }

  // 构建代理组配置
  let proxyGroup = {
    tag: '📦 Proxy',
    outbounds: ['⚡️ Auto'].concat(outGroups.map(group => group.name), outboundNames, ['🇨🇳 Direct']),
    interrupt_exist_connections: isTogShut,
    type: 'selector'
  };

  // 构建自动组配置
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

  // 构建最终组配置
  let finalGroup = {
    tag: '🏁 Final',
    outbounds: ['📦 Proxy', '⚡️ Auto'].concat(outGroups.map(group => group.name), ['🇨🇳 Direct']),
    interrupt_exist_connections: isTogShut,
    type: 'selector'
  };

  // 构建规则组配置
  let ruleGroups = rules.map(rule => {
    return {
      tag: rule.groupName === '自动生成' ? processString(rule.name) : rule.groupName,
      outbounds: ['📦 Proxy'].concat(outGroups.map(group => group.name), outboundNames, ['🇨🇳 Direct']),
      interrupt_exist_connections: isTogShut,
      type: 'selector'
    }
  }).filter((item, index, self) =>
    index === self.findIndex(obj => obj.tag === item.tag)
  );

  // 构建高优先级用户定义规则组配置
  let priorityUdRuleGroups = udRules.filter(rule => {
    return rule.isGroup && rule.isPriority && rule.type === 'proxy';
  }).map(rule => {
    return {
      tag: rule.name,
      outbounds: ['📦 Proxy'].concat(outGroups.map(group => group.name), outboundNames, ['🇨🇳 Direct']),
      interrupt_exist_connections: isTogShut,
      type: 'selector'
    }
  });

  // 构建非高优先级用户定义规则组配置
  let nonPriorityUdRuleGroups = udRules.filter(rule => {
    return rule.isGroup && !rule.isPriority && rule.type === 'proxy';
  }).map(rule => {
    return {
      tag: rule.name,
      outbounds: ['📦 Proxy'].concat(outGroups.map(group => group.name), outboundNames, ['🇨🇳 Direct']),
      interrupt_exist_connections: isTogShut,
      type: 'selector'
    }
  });

  // 构建自定义出站分组配置
  let customOutGroups = outGroups.map(group => {
    if (group.type === 'selector') {
      return {
        tag: group.name,
        outbounds: group.nodes,
        interrupt_exist_connections: isTogShut,
        type: 'selector'
      }
    }
    else {
      return {
        tag: group.name,
        outbounds: group.nodes,
        type: 'urltest',
        url: 'https://www.gstatic.com/generate_204',
        interval: '3m',
        tolerance: 50,
        idle_timeout: '30m',
        interrupt_exist_connections: false
      }
    }
  });

  // 初始化组列表
  let groups = [];

  // 添加高优先级用户定义规则组到组列表
  if (priorityUdRuleGroups !== null) {
    groups = groups.concat(proxyGroup, autoGroup, priorityUdRuleGroups, ruleGroups);
  } else {
    groups = groups.concat(proxyGroup, autoGroup, ruleGroups);
  }

  // 添加非高优先级用户定义规则组到组列表
  if (nonPriorityUdRuleGroups !== null) {
    groups = groups.concat(nonPriorityUdRuleGroups);
  }

  // 去重并返回去重后的组配置列表
  return groups.concat(subGroups, finalGroup, customOutGroups).reduce((acc, group) => {
    if (!acc.seen[group.tag]) {
      acc.seen[group.tag] = true;
      acc.result.push(group);
    }
    return acc;
  }, { seen: {}, result: [] }).result;
}

/**
 * 修改DNS配置
 * @param {Object} config - DNS配置对象
 * @param {Object} profile - 用户配置文件对象
 * @param {boolean} isFakeIP - 是否使用假IP
 */
function modifyDNS(config, profile, isFakeIP) {
  // 重置 DNS 配置
  if (config.dns) {
    config.dns = {};
  }
  config.dns = isFakeIP ? deepCopy(DNS.fakeip) : deepCopy(DNS.realip);

  // 更新本地DNS配置
  const localDNS = config.dns.servers.find(rule => rule.tag === 'local-dns');
  if (localDNS) {
    localDNS.address = profile.dns.local;
  }

  // 更新远程DNS配置
  const remoteDNS = config.dns.servers.find(rule => rule.tag === 'remote-dns');
  if (remoteDNS) {
    remoteDNS.address = profile.dns.remote;
  }

  // 更新解析器DNS配置
  const resolverDNS = config.dns.servers.find(rule => rule.tag === 'resolver-dns');
  if (resolverDNS) {
    resolverDNS.address = profile.dns.resolver;
  }

  // 处理 local-dns 规则
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

  // 处理 remote-dns 规则
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

  // 初始化优先级和非优先级规则数组
  let priorityRules = [];
  let nonPriorityRules = [];
  // 定义允许的规则关键字
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

  // 处理用户定义的规则
  if (Array.isArray(profile.udRules) && profile.udRules.length > 0) {
    // 过滤并处理优先级规则
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

    // 过滤并处理非优先级规则
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
  // 将优先级规则添加到配置的规则列表开头
  if (priorityRules.length > 0) {
    config.dns.rules.splice(0, 0, ...priorityRules);
  }
  // 将非优先级规则添加到配置的规则列表中
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

/**
 * 修改入站配置
 * 根据用户设备类型和配置文件，更新入站配置
 * @param {Object} config - 主配置对象，包含入站配置信息
 * @param {Object} profile - 用户配置对象，包含目标设备类型和代理设置
 * @param {Object} global - 全局配置对象，包含全局代理设置
 */
function modifyInbounds(config, profile) {
  // 根据目标设备类型选择相应的入站配置
  switch (profile.target) {
    case 'pc':
      config.inbounds = deepCopy(Inbounds.pc);
      break;
    case 'mobile':
      config.inbounds = deepCopy(Inbounds.mobile);
      break;
    case 'linux':
      config.inbounds = deepCopy(Inbounds.linux);
      break;
    default:
      break;
  }
}

/**
 * 修改路由配置
 * 该函数根据提供的配置文件和用户配置文件来修改路由配置
 * 主要目的是整合用户定义的规则和默认规则，并按照一定的优先级排序
 * 
 * @param {Object} config - 原始的配置文件对象，将被修改以包含新的路由规则
 * @param {Object} profile - 用户配置文件对象，包含代理、直连和阻止规则
 */
function modifyRoutes(config, profile, global) {
  // 根据要求配置嗅探
  if ((profile.isUseGlobal && global.isSniff) || (!profile.isUseGlobal && profile.isSniff)) {
    config.route.rules.splice(0, 0, { action: 'sniff' });
  }

  // 将用户配置中的代理规则转换为路由规则集
  let proxyRuleSets = profile.proxyRules.map(item => {
    return {
      type: 'remote',
      format: 'binary',
      download_detour: '📦 Proxy',
      tag: item.name,
      url: item.url,
    }
  });

  // 将用户配置中的直连规则转换为路由规则集
  let directRuleSets = profile.directRules.map(item => {
    return {
      type: 'remote',
      format: 'binary',
      download_detour: '📦 Proxy',
      tag: item.name,
      url: item.url,
    }
  });

  // 将用户配置中的阻止规则转换为路由规则集
  let blockRuleSets = profile.blockRules.map(item => {
    return {
      type: 'remote',
      format: 'binary',
      download_detour: '📦 Proxy',
      tag: item.name,
      url: item.url,
    }
  });

  // 合并所有规则集到配置文件的路由规则集中
  config.route.rule_set = proxyRuleSets.concat(directRuleSets, blockRuleSets);

  // 将用户配置中的代理规则转换为路由规则
  let proxyRules = profile.proxyRules.map(item => {
    return { rule_set: item.name, outbound: item.groupName !== '自动生成' ? item.groupName : processString(item.name) }
  });

  // 将用户配置中的直连规则转换为路由规则
  let directRules = profile.directRules.map(item => {
    return { rule_set: item.name, outbound: 'direct' }
  });

  // 将用户配置中的阻止规则转换为路由规则
  let blockRules = profile.blockRules.map(item => {
    return { rule_set: item.name, action: 'reject' }
  });

  // 初始化优先级和非优先级的用户定义规则数组
  let priorityUdRules = [];
  let nonPriorityUdRules = [];

  // 如果用户配置了用户定义规则，并且规则数量大于0
  if (Array.isArray(profile.udRules) && profile.udRules.length > 0) {
    // 过滤并处理优先级规则，排除阻断规则和内容为空的规则
    priorityUdRules = profile.udRules.filter(item => {
      return item.isPriority && item.isUse && item.content;
    }).map(item => {
      let ruleObj;
      try {
        ruleObj = JSON.parse(item.content);
      } catch (error) {
        console.error(`Error parsing content for rule ${item.name}: ${error.message}`);
        return null;
      }
      // 根据规则类型设置出站代理
      switch (item.type) {
        case 'direct':
          ruleObj.outbound = 'direct';
          break;
        case 'proxy':
          if (item.isGroup) {
            ruleObj.outbound = item.name;
          } else {
            ruleObj.outbound = '📦 Proxy';
          }
          break;
        case 'block':
          ruleObj.action = 'reject';
          break;
        default:
          break;
      }
      return ruleObj;
    }).filter(ruleObj => ruleObj !== null);

    // 过滤并处理非优先级规则，排除内容为空的规则
    nonPriorityUdRules = profile.udRules.filter(item => {
      return !item.isPriority && item.isUse && item.content;
    }).map(item => {
      let ruleObj;
      try {
        ruleObj = JSON.parse(item.content);
      } catch (error) {
        console.error(`Error parsing content for rule ${item.name}: ${error.message}`);
        return null;
      }
      // 根据规则类型设置出站代理
      switch (item.type) {
        case 'direct':
          ruleObj.outbound = 'direct';
          break;
        case 'block':
          ruleObj.action = 'reject';
          break;
        case 'proxy':
          if (item.isGroup) {
            ruleObj.outbound = item.name;
          } else {
            ruleObj.outbound = '📦 Proxy';
          }
          break;
        default:
          break;
      }
      return ruleObj;
    }).filter(ruleObj => ruleObj !== null);
  }

  // 合并所有规则到配置文件的路由规则中，按照阻断、优先级用户定义、代理、非优先级用户定义、直连的顺序
  config.route.rules = config.route.rules.concat(blockRules, priorityUdRules, proxyRules, nonPriorityUdRules, directRules);
}

/**
 * 异步函数，用于根据提供的参数修改配置对象
 * 此函数全面修改配置对象，包括全局配置、DNS配置、入站配置、出站配置和路由配置
 * @param {Object} config - 待修改的配置对象
 * @param {Object} subs - 订阅信息对象
 * @param {Array} nodeList - 节点列表数组
 * @param {Object} profile - 用户配置对象
 * @param {Object} global - 全局配置对象
 * @param {Object} rootState - 根状态对象，用于获取全局状态
 * @returns {Promise<Object>} - 返回修改后的配置对象的Promise
 */
export async function generateFullConfig(subs, nodeList, profile, global, rootState) {
  try {
    let config;
    try {
      config = {
        experimental: deepCopy(Experimental),
        log: deepCopy(Log),
        dns: {},
        inbounds: [],
        outbounds: deepCopy(Outbounds),
        route: deepCopy(Route)
      };
      //console.log('Config object initialized successfully:', config);
    } catch (initError) {
      console.error('Error during config initialization:', initError.message);
      throw initError;
    }

    console.log('Modifying global configuration...');
    modifyGlobal(config, profile, global);

    // DNS配置
    modifyDNS(config, profile, profile.isUseGlobal ? global.isFakeIP : profile.isFakeIP);

    // 入站配置
    modifyInbounds(config, profile);

    // 出站配置
    let outbounds = await generateOutbounds(nodeList, subs, profile.nodeIDs, rootState);
    let outboundGroups = generateOutboundGroups(outbounds, subs, profile.proxyRules, profile.udRules, profile.outGroups, profile.isUseGlobal ? global.isTogShut : profile.isTogShut);
    config.outbounds = config.outbounds.concat(outbounds, outboundGroups);

    // 路由配置
    modifyRoutes(config, profile, global);
    // 成功日志
    console.log('Config generation successful');
    return config;
  } catch (error) {
    // 错误处理
    console.error('Config generation failed:', error.message);
    throw error; // 抛出错误以便在actions中处理消息
  }
}

