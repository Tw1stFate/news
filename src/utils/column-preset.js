/**
 * 列配置预设工具类
 * 用于处理布局中的列配置预设相关逻辑
 */

// 预设选项列表
export const PRESET_OPTIONS = [
  { label: "不分列", value: "none" },
  { label: "等宽两列 (1:1)", value: "1:1" },
  { label: "两列 (1:2)", value: "1:2" },
  { label: "等宽三列 (1:1:1)", value: "1:1:1" },
  { label: "三列 (1:2:1)", value: "1:2:1" },
  { label: "自定义", value: "custom" }
];

/**
 * 验证比例字符串格式是否有效
 * @param {string} ratio - 比例字符串，如 "1:2:1"
 * @returns {boolean} - 是否有效
 */
export function validateRatio(ratio) {
  const ratioPattern = /^\d+(?::\d+)+$/;
  return ratioPattern.test(ratio);
}

/**
 * 计算列宽度数组
 * @param {string} ratioString - 比例字符串，如 "1:2:1"
 * @returns {Array} - 列宽度数组，百分比值
 */
export function calculateColumnWidths(ratioString) {
  if (!ratioString || ratioString === "none") {
    return [];
  }

  // 解析比例
  const ratios = ratioString.split(":").map((r) => parseInt(r.trim()) || 1);
  const total = ratios.reduce((sum, r) => sum + r, 0);
  const widths = [];

  // 计算百分比宽度
  let sum = 0;
  for (let i = 0; i < ratios.length - 1; i++) {
    const width = parseFloat(((ratios[i] / total) * 100).toFixed(2));
    widths.push(width);
    sum += width;
  }

  // 最后一列计算，避免小数误差
  widths.push(parseFloat((100 - sum).toFixed(2)));
  return widths;
}

/**
 * 解析列配置，生成列节点数据
 * @param {string} preset - 预设值或比例字符串
 * @param {string} parentId - 父节点ID
 * @param {Function} generateId - 生成唯一ID的函数
 * @returns {Array} - 列节点数组
 */
export function generateColumnNodes(preset, parentId, generateId) {
  if (!preset || preset === "none") {
    return [];
  }

  // 解析预设比例
  const ratios = preset.split(":").map(r => parseInt(r) || 1);
  
  // 计算总比例
  const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
  
  // 创建列节点
  return ratios.map((ratio) => {
    const percent = (ratio / totalRatio) * 100;
    const span = Math.round((ratio / totalRatio) * 10);
    
    return {
      id: generateId(),
      type: "column",
      span,
      percentWidth: `${percent.toFixed(2)}%`,
      height: "100%",
      parent: parentId,
      children: [],
    };
  });
}

/**
 * 检测现有列节点的配置类型
 * @param {Array} columnNodes - 列节点数组
 * @returns {string} - 检测到的预设类型
 */
export function detectColumnPreset(columnNodes) {
  if (!columnNodes || columnNodes.length === 0) {
    return "none";
  }
  
  const count = columnNodes.length;
  
  // 检查是否为等宽列
  const isEqualWidth = columnNodes.every((col) => {
    return col.percentWidth === columnNodes[0].percentWidth;
  });

  // 根据列数和宽度比例确定预设类型
  if (count === 2) {
    if (isEqualWidth) {
      return "1:1";
    } else {
      // 检查是否为1:2比例
      const widths = columnNodes.map((col) => parseFloat(col.percentWidth));
      if (Math.abs(widths[1] / widths[0] - 2) < 0.2) {
        return "1:2";
      } else {
        return "custom";
      }
    }
  } else if (count === 3) {
    if (isEqualWidth) {
      return "1:1:1";
    } else {
      // 检查是否为1:2:1比例
      const widths = columnNodes.map((col) => parseFloat(col.percentWidth));
      if (
        Math.abs(widths[0] - widths[2]) < 1 &&
        Math.abs(widths[1] / widths[0] - 2) < 0.2
      ) {
        return "1:2:1";
      } else {
        return "custom";
      }
    }
  } else {
    return "custom";
  }
}

/**
 * 将百分比宽度转换为比例字符串
 * @param {Array} widths - 列宽度数组，百分比值
 * @returns {string} - 比例字符串，如 "1:2:1"
 */
export function widthsToRatio(widths) {
  if (!widths || widths.length === 0) {
    return "none";
  }
  
  // 将百分比转换为最小整数比例
  const total = 100;
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const findGCD = (arr) => arr.reduce((a, b) => gcd(a, b));
  
  // 将百分比转换为整数
  const intValues = widths.map(w => Math.round(w));
  
  // 找到最大公约数
  const divisor = findGCD(intValues);
  
  // 转换为最简比例
  const ratio = intValues.map(v => v / divisor).join(":");
  
  return ratio;
}

/**
 * 获取预设选项的标签
 * @param {string} value - 预设值
 * @returns {string} - 预设标签
 */
export function getPresetLabel(value) {
  const option = PRESET_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
}

/**
 * 判断是否为预定义的预设值
 * @param {string} value - 预设值
 * @returns {boolean} - 是否为预定义预设
 */
export function isPredefinedPreset(value) {
  return PRESET_OPTIONS.some(opt => opt.value === value && opt.value !== "custom" && opt.value !== "none");
} 