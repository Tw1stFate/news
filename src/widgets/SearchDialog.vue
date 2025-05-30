<template>
  <el-dialog
    title="新闻搜索"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    custom-class="search-dialog-fullscreen"
    :fullscreen="true"
    :append-to-body="true"
  >
    <div class="search-container">
      <div class="search-header">
        <div class="search-input-wrapper">
          <el-input
            ref="searchInput"
            v-model="keyword"
            placeholder="搜索新闻、公告、资讯..."
            prefix-icon="el-icon-search"
            clearable
            @keyup.enter.native="handleSearch"
            autofocus
          >
          </el-input>
          <el-button type="primary" @click="handleSearch" :loading="loading"
            >搜索</el-button
          >
          <el-button v-if="hasSearched" plain @click="resetSearch"
            >重置</el-button
          >
        </div>
      </div>

      <div class="search-content">
        <div
          class="search-history"
          v-if="!results.length && searchHistory.length && !loading"
        >
          <div class="history-header">
            <h3>搜索历史</h3>
            <span class="clear-history" @click="clearHistory">清空历史</span>
          </div>
          <div class="history-list">
            <el-tag
              v-for="(item, index) in searchHistory"
              :key="index"
              size="medium"
              effect="plain"
              class="history-item"
              @click="useHistoryItem(item)"
            >
              <i class="el-icon-time"></i> {{ item }}
            </el-tag>
          </div>
        </div>

        <div
          class="hot-searches"
          v-if="!results.length && !hasSearched && !loading"
        >
          <div class="hot-searches-header">
            <h3>热门搜索</h3>
          </div>
          <div class="hot-list">
            <el-tag
              v-for="(item, index) in hotSearches"
              :key="index"
              size="medium"
              type="danger"
              effect="plain"
              class="hot-item"
              @click="useHistoryItem(item)"
            >
              <span class="hot-rank">{{ index + 1 }}</span> {{ item }}
            </el-tag>
          </div>
        </div>

        <div v-if="loading" class="loading-container">
          <div class="loading-spinner">
            <i class="el-icon-loading"></i>
          </div>
          <p>正在搜索"{{ keyword }}"，请稍候...</p>
        </div>

        <div class="search-results-wrapper" v-if="hasSearched && !loading">
          <div class="results-header">
            <h3>
              搜索结果 <span v-if="results.length">({{ results.length }})</span>
            </h3>
            <div class="results-filter" v-if="results.length">
              <el-radio-group v-model="currentFilter" size="small">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="综合">综合</el-radio-button>
                <el-radio-button label="科技">科技</el-radio-button>
                <el-radio-button label="娱乐">娱乐</el-radio-button>
                <el-radio-button label="体育">体育</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <el-empty
            v-if="!results.length"
            description="没有找到相关结果"
            :image-size="200"
          >
            <template #description>
              <p>没有找到与"{{ keyword }}"相关的新闻</p>
              <p class="empty-suggestion">建议：</p>
              <ul class="empty-tips">
                <li>请检查关键词拼写是否正确</li>
                <li>尝试使用其他相关关键词</li>
                <li>使用更简短、常见的词语</li>
              </ul>
            </template>
            <el-button type="primary" @click="resetSearch">返回</el-button>
          </el-empty>

          <div v-else class="result-list">
            <div
              v-for="(item, index) in filteredResults"
              :key="index"
              class="result-item"
              @click="viewResult(item)"
            >
              <div class="result-thumbnail" v-if="item.image">
                <img :src="item.image" :alt="item.title" />
              </div>
              <div class="result-content">
                <h4 class="result-title">{{ item.title }}</h4>
                <p class="result-summary">{{ item.summary }}</p>
                <div class="result-meta">
                  <span class="result-date"
                    ><i class="el-icon-date"></i> {{ item.date }}</span
                  >
                  <span class="result-category" v-if="item.category">
                    <el-tag
                      size="mini"
                      :type="getCategoryType(item.category)"
                      >{{ item.category }}</el-tag
                    >
                  </span>
                  <span class="result-views" v-if="item.views">
                    <i class="el-icon-view"></i> {{ formatViews(item.views) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import api from "../services/api";

export default {
  name: "SearchDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialogVisible: false,
      keyword: "",
      loading: false,
      hasSearched: false,
      results: [],
      searchHistory: [],
      currentFilter: "all",
      hotSearches: [
        "经济政策",
        "数字人民币",
        "5G技术应用",
        "金融科技",
        "碳中和",
        "区块链金融",
        "绿色金融",
        "乡村振兴",
      ],
    };
  },
  computed: {
    filteredResults() {
      if (this.currentFilter === "all") {
        return this.results;
      } else {
        return this.results.filter(
          (item) => item.category === this.currentFilter
        );
      }
    },
  },
  watch: {
    visible(val) {
      this.dialogVisible = val;
      if (val) {
        this.loadSearchHistory();
        // 自动聚焦到搜索框
        this.$nextTick(() => {
          if (this.$refs.searchInput) {
            this.$refs.searchInput.focus();
          }
        });
      }
    },
    dialogVisible(val) {
      if (val !== this.visible) {
        this.$emit("update:visible", val);
      }
      if (!val) {
        // 关闭对话框时重置搜索状态，但保留关键词
        this.hasSearched = false;
      }
    },
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
    },
    async handleSearch() {
      if (!this.keyword.trim()) return;

      this.loading = true;
      this.hasSearched = true;
      this.currentFilter = "all";

      try {
        // 添加到搜索历史
        this.addToHistory(this.keyword);

        // 调用API获取搜索结果
        this.results = await api.searchNews(this.keyword);
      } catch (error) {
        console.error("搜索失败:", error);
        this.$message.error("搜索失败，请稍后重试");
        this.results = [];
      } finally {
        this.loading = false;
      }
    },
    loadSearchHistory() {
      const history = localStorage.getItem("searchHistory");
      this.searchHistory = history ? JSON.parse(history) : [];
    },
    addToHistory(keyword) {
      // 去重并限制历史记录数量
      const trimmedKeyword = keyword.trim();
      let history = this.searchHistory.filter(
        (item) => item !== trimmedKeyword
      );
      history.unshift(trimmedKeyword);

      // 只保留最近8个搜索记录
      if (history.length > 8) {
        history = history.slice(0, 8);
      }

      this.searchHistory = history;
      localStorage.setItem("searchHistory", JSON.stringify(history));
    },
    clearHistory() {
      this.searchHistory = [];
      localStorage.removeItem("searchHistory");
    },
    useHistoryItem(keyword) {
      this.keyword = keyword;
      this.handleSearch();
    },
    viewResult(item) {
      // 如果有链接，跳转到新闻详情页
      if (item.link) {
        window.open(item.link, "_blank");
      } else {
        console.log("查看新闻详情:", item);
        this.$message.success(`查看新闻: ${item.title}`);
      }
      this.dialogVisible = false;
    },
    getCategoryType(category) {
      const types = {
        科技: "success",
        娱乐: "warning",
        体育: "info",
        综合: "primary",
      };
      return types[category] || "primary";
    },
    formatViews(views) {
      if (views >= 10000) {
        return (views / 10000).toFixed(1) + "万";
      }
      return views;
    },
    resetSearch() {
      this.hasSearched = false;
      this.results = [];
      this.keyword = "";
      this.$nextTick(() => {
        if (this.$refs.searchInput) {
          this.$refs.searchInput.focus();
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .search-dialog-fullscreen {
  .el-dialog__header {
    padding: 15px 30px;
    border-bottom: 1px solid #eaeaea;
    background-color: #fff;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
    position: relative;
    z-index: 10;
  }

  .el-dialog__body {
    padding: 0;
    height: calc(100vh - 55px);
    overflow-y: auto;
    background-color: #f5f7f9;
  }

  .el-dialog__headerbtn {
    top: 15px;
    right: 20px;
    font-size: 20px;
  }

  .el-dialog__title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
}

.search-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .search-header {
    background-color: #fff;
    padding: 20px 30px;

    .search-input-wrapper {
      display: flex;
      max-width: 900px;
      margin: 0 auto;

      .el-input {
        flex: 1;

        ::v-deep .el-input__inner {
          height: 50px;
          line-height: 50px;
          font-size: 16px;
          border-radius: 4px 0 0 4px;
          border-right: none;
          padding-left: 15px;

          &:focus {
            border-color: #c00;
          }
        }

        ::v-deep .el-input__prefix {
          font-size: 18px;
          left: 15px;
        }

        ::v-deep .el-input__suffix {
          right: 10px;
        }
      }

      .el-button {
        height: 50px;
        font-size: 16px;

        &:first-of-type {
          width: 100px;
          border-radius: 0 4px 4px 0;
          background-color: #c00;
          border-color: #c00;

          &:hover,
          &:focus {
            background-color: #a00;
            border-color: #a00;
          }
        }

        &:last-of-type {
          margin-left: 10px;
          border-radius: 4px;
        }
      }
    }
  }

  .search-content {
    flex: 1;
    padding: 20px 30px;
    overflow-y: auto;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;

    .search-history,
    .hot-searches {
      background-color: #fff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

      .history-header,
      .hot-searches-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;

        h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
          font-weight: 600;
        }

        .clear-history {
          font-size: 14px;
          color: #999;
          cursor: pointer;

          &:hover {
            color: #c00;
          }
        }
      }

      .history-list,
      .hot-list {
        display: flex;
        flex-wrap: wrap;

        .history-item,
        .hot-item {
          margin-right: 12px;
          margin-bottom: 12px;
          cursor: pointer;
          padding: 8px 15px;
          font-size: 14px;
          border-radius: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;

          &:hover {
            color: #c00;
            transform: translateY(-2px);
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
          }
        }

        .history-item {
          background-color: #f7f7f7;
          color: #555;
          border: 1px solid #eee;

          i {
            color: #999;
            margin-right: 6px;
          }

          &:hover {
            background-color: #fff;
            border-color: #ddd;

            i {
              color: #c00;
            }
          }
        }

        .hot-item {
          background-color: #fff5f5;
          border: 1px solid #ffdbdb;
          color: #c00;
          font-weight: 500;

          &:hover {
            background-color: #fff;
            border-color: #ffb3b3;
          }

          .hot-rank {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: 22px;
            height: 22px;
            line-height: 1;
            text-align: center;
            border-radius: 50%;
            background-color: #c00;
            color: #fff;
            font-size: 12px;
            margin-right: 8px;
            font-weight: bold;
          }
        }
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100px 0;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

      .loading-spinner {
        width: 70px;
        height: 70px;
        background-color: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);

        i {
          font-size: 40px;
          color: #c00;
        }
      }

      p {
        color: #666;
        font-size: 16px;
        margin: 0;
      }
    }

    .search-results-wrapper {
      background-color: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

      .results-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;

        h3 {
          margin: 0;
          margin-right: 10px;
          font-size: 16px;
          color: #333;
          font-weight: 600;

          span {
            color: #c00;
            font-weight: normal;
          }
        }
      }

      .result-list {
        .result-item {
          display: flex;
          padding: 20px 0;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          transition: background-color 0.2s;

          &:hover {
            background-color: #f9f9f9;
          }

          &:last-child {
            border-bottom: none;
          }

          .result-thumbnail {
            width: 180px;
            height: 120px;
            margin-right: 20px;
            overflow: hidden;
            border-radius: 6px;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.3s;
            }
          }

          &:hover .result-thumbnail img {
            transform: scale(1.05);
          }

          .result-content {
            flex: 1;
            overflow: hidden;

            .result-title {
              margin: 0 0 10px 0;
              font-size: 18px;
              font-weight: bold;
              color: #333;
              line-height: 1.4;

              &:hover {
                color: #c00;
                text-decoration: underline;
              }
            }

            .result-summary {
              margin: 0 0 15px 0;
              font-size: 14px;
              color: #666;
              line-height: 1.6;
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .result-meta {
              display: flex;
              align-items: center;
              font-size: 13px;
              color: #999;
              flex-wrap: wrap;

              .result-date,
              .result-views {
                display: flex;
                align-items: center;
                margin-right: 15px;

                i {
                  margin-right: 5px;
                }
              }
            }
          }
        }
      }
    }
  }
}

::v-deep .el-empty {
  padding: 40px 0;

  .el-empty__description {
    margin-top: 20px;

    p {
      margin: 10px 0;
      color: #666;
      font-size: 16px;
    }

    .empty-suggestion {
      margin-top: 20px;
      font-weight: bold;
      color: #333;
    }

    .empty-tips {
      text-align: left;
      display: inline-block;
      color: #666;
      margin: 10px 0;
      padding-left: 20px;

      li {
        margin-bottom: 5px;
        line-height: 1.5;
      }
    }
  }

  .el-empty__bottom {
    margin-top: 20px;
  }
}
</style>
