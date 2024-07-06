import axios from 'axios'
const user = {
  namespaced: true,
  state: {
    asideOpen: false,
    backendUrl: '',
    gitToken: '',
    kernelStatus: {
      status: 'loading',
      type: 'warning',
      text: '未连接后端...'
    },
    kernelVersionInfo: {
      current: '',
      latest: ''
    }
  },
  mutations: {
    setAsideOpen(state, value) {
      state.asideOpen = value
    },
    setBackendUrl(state, value) {
      state.backendUrl = value;
    },
    setGitToken(state, value) {
      state.gitToken = value;
    },
    setKernelStatus(state, value) {
      switch (value) {
        case 'active':
          state.kernelStatus = {
            status: 'active',
            type: 'success',
            text: '运行中'
          }
          break;
        case 'inactive':
          state.kernelStatus = {
            status: 'inactive',
            type: 'info',
            text: '已停止'
          }
          break;
        case 'failed':
          state.kernelStatus = {
            status: 'failed',
            type: 'error',
            text: '启动失败'
          }
          break;
        default:
          state.kernelStatus = {
            status: 'loading',
            type: 'warning',
            text: '未连接后端...'
          }
          break;
      }
    },
    setKernelVersionInfo(state, value) {
      state.kernelVersionInfo = value;
    }
  },
  actions: {
    async getKernelStatus({ state, commit }) {
      try {
        const res = await axios.post(`http://${state.backendUrl}/get-kernel-status`);
        if (res.status === 200) {
          commit('setKernelStatus', res.data);
          console.log('Kernel Status:', res.data);
        } else {
          console.error(`获取内核状态失败: ${res.data}`);
          commit('setKernelStatus', 'failed');
        }
      } catch (error) {
        console.error(error);
      }
    },
    async getKernelVersionInfo({ state, commit }) {
      try {
        const res = await axios.get(`http://${state.backendUrl}/get-version-info`);
        if (res.status === 200) {
          commit('setKernelVersionInfo', res.data);
          // console.log(`获取内核版本信息成功:`, res.data);
          // console.log('Response Headers:', res.headers);
          console.log('Version Info:', res.data);
        } else {
          throw new Error(`获取内核版本信息失败: ${res.status} ${res.statusText}`);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}

export default user

