import axios from 'axios'

const rule_set = {
  namespaced: true,
  state: {
    ruleSets: [],
    // 要获取规则集列表的仓库信息
    repositories: [
      {
        owner: 'Ethan0x0000',
        repo: 'rule-set',
        branch: 'main',
        targetPath: 'singbox'
      },
    ],
  },
  mutations: {
    // 设置规则集列表
    setRuleSets(state, ruleSets) {
      state.ruleSets = ruleSets;
    },
  },
  actions: {
    // 异步获取规则集列表
    async fetchRuleSets({ commit, state }) {
      try {
        const promises = state.repositories.map(async ({ owner, repo, branch, targetPath }) => {
          const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
          const response = await axios.get(apiUrl);
          const data = response.data;
          const tree = data.tree;

          const findFiles = (path, tree) => {
            return tree.reduce((files, item) => {
              if (item.type === 'blob') {
                const parts = item.path.split('/');
                if (parts[0] === path) {
                  files.push(item.path);
                }
              } else if (item.type === 'tree') {
                // 只对子树递归，避免对整个树递归
                const subPath = path ? `${path}/${item.path}` : item.path;
                // 使用filter来获取下一层的tree项，避免重复遍历整个树
                const subTree = tree.filter(subItem => subItem.path.startsWith(subPath) && subItem.type === 'tree');
                files = files.concat(findFiles(subPath, subTree)); // 递归调用
              }
              return files;
            }, []);
          };

          const transformFileName = (ruleSet) => {
            // 分割路径，获取文件名和目录名
            const parts = ruleSet.split('/');
            const directoryName = parts[parts.length - 2]; // 获取倒数第二个元素作为目录名
            const baseName = parts.pop().split('.').shift(); // 移除文件扩展名
            // 按照需要的格式拼接目录名和文件名
            return `${directoryName}-${baseName}`;
          };

          const allRuleSets = findFiles(targetPath, tree);
          const srsRuleSets = allRuleSets.filter(ruleSet => {
            // 检查文件是否在 targetPath 路径下，并且以 .srs 结尾
            return ruleSet.startsWith(`${targetPath}/`) && ruleSet.endsWith('.srs');
          });

          // 应用转换函数
          const formattedRuleSets = srsRuleSets.map(transformFileName);
          const finalRuleSets = formattedRuleSets
            .filter(item => item.trim() !== '')
            .map(item => ({
              value: item,
              repo: `${owner}/${repo}`,
              url: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${targetPath}/${item.replace(/(-)(.*?)/, (_, m1, m2) => m1 ? '/' + m2 : m2)}.srs`,
            }));
          return finalRuleSets;
        });

        const results = await Promise.all(promises);
        const mergedRuleSets = results.flat();
        commit('setRuleSets', mergedRuleSets);
      } catch (error) {
        console.error('Error:', error);
      }
    },
    // 初始化规则集列表
    initRuleSets({ dispatch, state }) {
      if (state.ruleSets.length > 0) {
        console.log('有缓存，从<本地缓存>中获取<规则列表>');
      } else {
        // 如果没有缓存数据，则执行数据获取操作
        console.log('无缓存，从<远程仓库>拉取<规则列表>');
        dispatch('fetchRuleSets');
      }
    }
  },
}

export default rule_set;