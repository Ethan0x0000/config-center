import { v4 as uuidV4 } from 'uuid';
import { ElMessage } from 'element-plus';

import { ARRAY_NAMES, createNewItem } from './profile/constants.js';
import { deepCopy } from './profile/utils.js';
import { generateFullConfig } from './profile/generator.js';


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
      createNewItem(ARRAY_NAMES.PROFILES)
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
      const newProfile = createNewItem(ARRAY_NAMES.PROFILES);
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
      try {
        const profile = state.profilesMap[id];
        const config = await generateFullConfig(state.subs, state.nodeList, profile, state.global, rootState);
        const jsonConfig = JSON.stringify(config, null, 2);
        commit('setProfileValue', { profileID: id, value: jsonConfig });
        ElMessage.success('配置生成成功');
      } catch (error) {
        ElMessage.error('配置生成失败: ' + error.message);
      }
    },
  }
}

export default profile
