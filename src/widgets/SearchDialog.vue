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
            @keyup.enter.native="handleSearch"
            autofocus
          >
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
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
            <div
              v-for="(item, index) in searchHistory"
              :key="index"
              class="history-item"
              @click="useHistoryItem(item)"
            >
              <i class="el-icon-time"></i>
              <span>{{ item }}</span>
            </div>
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
              v-for="(item, index) in results"
              :key="index"
              class="result-item"
              @click="viewResult(item)"
            >
              <div class="result-content">
                <h4 class="result-title" v-html="highlightText(item.title)"></h4>
                <p class="result-summary" v-html="highlightText(item.summary)"></p>
                <div class="result-meta">
                  <span class="result-date">
                    <i class="el-icon-date"></i> {{ item.date }}
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
    };
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
    // 高亮关键字
    highlightText(text) {
      if (!text || !this.keyword.trim()) return text;
      
      // 转义正则表达式中的特殊字符
      const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      };
      
      const keywords = this.keyword.trim().split(/\s+/);
      let highlightedText = text;
      
      keywords.forEach(keyword => {
        if (keyword) {
          const regex = new RegExp(escapeRegExp(keyword), 'gi');
          highlightedText = highlightedText.replace(
            regex,
            match => `<span class="highlight">${match}</span>`
          );
        }
      });
      
      return highlightedText;
    }
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
          padding-left: 45px;

          &:focus {
            border-color: #c00;
          }
        }

        ::v-deep .el-input__prefix {
          left: 15px;
          display: flex;
          align-items: center;
          height: 100%;
          
          .el-input__icon {
            font-size: 18px;
            line-height: 1;
          }
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

    .search-history {
      background-color: #fff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

      .history-header {
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

      .history-list {
        display: flex;
        flex-wrap: wrap;

        .history-item {
          display: inline-flex;
          align-items: center;
          margin-right: 12px;
          margin-bottom: 12px;
          cursor: pointer;
          padding: 8px 15px;
          font-size: 14px;
          border-radius: 20px;
          background-color: #f7f7f7;
          color: #555;
          border: 1px solid #eee;
          transition: all 0.2s ease;

          i {
            color: #999;
            margin-right: 6px;
          }

          &:hover {
            background-color: #fff;
            border-color: #ddd;
            transform: translateY(-2px);
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);

            i {
              color: #c00;
            }
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
        margin-bottom: 20px;

        h3 {
          margin: 0;
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
          padding: 16px 0;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          transition: background-color 0.2s;

          &:hover {
            background-color: #f9f9f9;
          }

          &:last-child {
            border-bottom: none;
          }

          .result-content {
            .result-title {
              margin: 0 0 10px 0;
              font-size: 16px;
              font-weight: bold;
              color: #333;
              line-height: 1.4;

              &:hover {
                color: #c00;
              }
            }

            .result-summary {
              margin: 0 0 10px 0;
              font-size: 14px;
              color: #666;
              line-height: 1.6;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .result-meta {
              font-size: 13px;
              color: #999;

              .result-date {
                display: flex;
                align-items: center;

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

::v-deep .highlight {
  background-color: #fff2cc;
  color: #c00;
  font-weight: bold;
  padding: 0 2px;
  border-radius: 2px;
}
</style>
