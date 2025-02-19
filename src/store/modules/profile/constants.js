import { v4 as uuidV4 } from 'uuid';

export const ARRAY_NAMES = {
  SUBS: 'subs',
  SUB_NODES: 'subNodes',
  MANUAL_NODES: 'manualNodes',
  DNS_ITEMS: 'dnsItems',
  PROXY_RULES: 'proxyRules',
  DIRECT_RULES: 'directRules',
  BLOCK_RULES: 'blockRules',
  UD_RULES: 'udRules',
};

export const createNewItem = (arrayName) => {
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
