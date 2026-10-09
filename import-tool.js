#!/usr/bin/env node
/**
 * 运费数据导入工具
 * 将客户提供的 CSV/Excel 转换为 shipping-data.js
 *
 * 用法: node import-tool.js <数据文件.xlsx/csv> [选项]
 */

const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const xlsx = require('xlsx');

// ==================== 配置区：适配不同客户的格式 ====================

/**
 * 列名映射表 - 支持多种常见列名
 * 如果你的客户用了不同的列名，在这里添加
 */
const COLUMN_MAPPINGS = {
    // 国家/地区
    country: ['国家', '国家/地区', '国家/分区', '目的地', '国家名', 'Country', '国家地区'],
    // 重量范围
    weightRange: ['重量区间', '重量范围', '重量', 'Weight Range', '重量段', '区间', '分区/重量段', '分区/重量段（kg）'],
    // 单价 (元/kg) - 支持含换行符的表头
    unitPrice: ['单价', '价格', '元/kg', '单价(元)', 'Unit Price', '价格/kg', '运费', '运费（RMB/KG）', '运费\n（RMB/KG）'],
    // 挂号费/处理费 - 支持含换行符的表头
    registrationFee: ['挂号费', '处理费', '操作费', 'Registration Fee', '挂号', '挂号费（RMB/票）', '挂号费\n（RMB/票）'],
    // 时效/运输时间 - 支持含换行符的表头
    deliveryTime: ['时效', '运输时间', '参考时效', 'Delivery Time', '时效(天)', '天数', '参考时效（工作日）', '参考时效\n（工作日）']
};

/**
 * 重量范围格式解析器
 * 支持多种格式自动转换
 */
const WEIGHT_PARSERS = [
    // 格式: "0-0.1" 或 "0-100g" → "0＜W≤0.1"
    {
        name: '范围格式',
        pattern: /^(\d+(?:\.\d+)?)\s*[-~～]\s*(\d+(?:\.\d+)?)\s*(g|kg)?$/i,
        parse: (match) => {
            let min = parseFloat(match[1]);
            let max = parseFloat(match[2]);
            const unit = match[3]?.toLowerCase();

            // 统一转换为 kg
            if (unit === 'g') {
                min = min / 1000;
                max = max / 1000;
            }

            return `${min}＜W≤${max}`;
        }
    },
    // 格式: "0<W≤0.1" 或 "0＜W≤0.1"（已经是标准格式）
    {
        name: '不等式格式',
        pattern: /(\d+(?:\.\d+)?)\s*[<＜]\s*W\s*[≤<=]\s*(\d+(?:\.\d+)?)/i,
        parse: (match) => {
            return `${match[1]}＜W≤${match[2]}`;
        }
    },
    // 格式: "0.1kg以下" 或 "0.1kg及以下"
    {
        name: '以下格式',
        pattern: /^(\d+(?:\.\d+)?)\s*(kg|g)?\s*(?:以下|及以下|以内)/,
        parse: (match) => {
            let max = parseFloat(match[1]);
            const unit = match[2]?.toLowerCase();
            if (unit === 'g') max = max / 1000;
            return `0＜W≤${max}`;
        }
    },
    // 格式: "0.1kg以上" 或 "0.1kg及以上"
    {
        name: '以上格式',
        pattern: /^(\d+(?:\.\d+)?)\s*(kg|g)?\s*(?:以上|及以上)/,
        parse: (match) => {
            let min = parseFloat(match[1]);
            const unit = match[2]?.toLowerCase();
            if (unit === 'g') min = min / 1000;
            return `${min}＜W≤100`; // 假设最大100kg
        }
    }
];

// ==================== 核心功能 ====================

/**
 * 读取 Excel (.xlsx) 文件，返回数组格式数据
 */
function readExcel(filename) {
    try {
        const workbook = xlsx.readFile(filename);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        // 使用 sheet_to_json 读取为数组，保留空值
        return xlsx.utils.sheet_to_json(firstSheet, { header: 1, defval: '', blankrows: true });
    } catch (error) {
        throw new Error(`读取 Excel 失败: ${error.message}`);
    }
}

/**
 * 检测文件编码并读取 CSV，返回数组格式数据
 */
function readCSV(filename) {
    const encodings = ['utf8', 'gbk', 'gb2312', 'big5'];

    for (const encoding of encodings) {
        try {
            const buffer = fs.readFileSync(filename);
            let content;
            if (encoding === 'utf8') {
                if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
                    content = buffer.toString('utf8', 3);
                } else {
                    content = buffer.toString('utf8');
                }
            } else {
                content = iconv.decode(buffer, encoding);
            }

            // 解析为数组
            return content.split(/\r?\n/).map(line => parseCSVLine(line));
        } catch (err) {
            continue;
        }
    }
    throw new Error(`无法读取文件: ${filename}`);
}

/**
 * 根据扩展名自动选择读取方式
 */
function readFile(filename) {
    const ext = path.extname(filename).toLowerCase();

    if (ext === '.xlsx' || ext === '.xls') {
        console.log('📊 检测到 Excel 文件，自动解析...');
        return readExcel(filename);
    } else {
        return readCSV(filename);
    }
}

/**
 * 解析 CSV 行（处理引号内的逗号）
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

/**
 * 自动识别列索引
 */
function detectColumns(headers) {
    const mapping = {};

    for (const [field, possibleNames] of Object.entries(COLUMN_MAPPINGS)) {
        mapping[field] = -1;

        for (let i = 0; i < headers.length; i++) {
            // 处理表头中的换行符和多余空格
            const header = headers[i]?.toString().toLowerCase().replace(/\s+/g, ' ').trim() || '';

            // 跳过空表头，防止空字符串匹配
            if (!header) continue;

            for (const name of possibleNames) {
                const normalizedName = name.toLowerCase().replace(/\s+/g, ' ').trim();
                if (header.includes(normalizedName) || normalizedName.includes(header)) {
                    mapping[field] = i;
                    break;
                }
            }

            if (mapping[field] !== -1) break;
        }
    }

    return mapping;
}

/**
 * 解析重量范围
 */
function parseWeightRange(value) {
    if (!value) return null;

    const trimmed = value.toString().trim();

    for (const parser of WEIGHT_PARSERS) {
        const match = trimmed.match(parser.pattern);
        if (match) {
            return parser.parse(match);
        }
    }

    return null; // 无法解析
}

/**
 * 解析数字（处理各种格式）
 */
function parseNumber(value) {
    if (!value) return 0;
    const cleaned = value.toString().replace(/[￥$,，\s]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

/**
 * 主解析函数 - 支持数组格式的数据
 */
function parseData(rows, options = {}) {
    const result = {};
    const errors = [];
    const stats = { total: 0, success: 0, failed: 0 };

    // 找到表头行（包含"国家"和"运费/单价"的行）
    let headerLine = 0;
    let headers = [];

    for (let i = 0; i < Math.min(15, rows.length); i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const rowText = row.join(' ').toLowerCase();
        // 检查是否包含国家/单价/运费等关键词
        if (rowText.includes('国家') && (rowText.includes('单价') || rowText.includes('运费') || rowText.includes('价格'))) {
            headers = row;
            headerLine = i;
            break;
        }
    }

    if (headers.length === 0) {
        throw new Error('无法找到表头行，请检查文件格式');
    }

    console.log(`📋 检测到表头 (第 ${headerLine + 1} 行):`);
    console.log('   ' + headers.map(h => String(h || '').replace(/\n/g, ' ').trim()).join(' | '));

    // 自动识别列
    const columns = detectColumns(headers);
    console.log('\n🔍 列识别结果:');
    for (const [field, index] of Object.entries(columns)) {
        const colName = headers[index] ? String(headers[index]).replace(/\n/g, ' ').trim() : '';
        const status = index >= 0 ? `✅ 第 ${index + 1} 列 (${colName})` : '❌ 未找到';
        console.log(`   ${field}: ${status}`);
    }

    if (columns.country === -1 || columns.unitPrice === -1) {
        throw new Error('必须包含「国家」和「单价」列');
    }

    // 解析数据行
    let currentCountry = null;
    let currentDeliveryTime = '6-10工作日';

    for (let i = headerLine + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        stats.total++;

        // 获取国家，如果为空则沿用上一个
        let country = String(row[columns.country] || '').trim();
        if (!country || country === '国家/地区' || country === '国家/分区') {
            if (currentCountry) {
                country = currentCountry;
            } else {
                continue; // 跳过无国家的行
            }
        } else {
            currentCountry = country;
        }

        const weightRangeRaw = String(row[columns.weightRange] || '').trim();
        const unitPrice = parseNumber(row[columns.unitPrice]);
        const registrationFee = parseNumber(row[columns.registrationFee]);

        // 时效列可能有/或备注信息
        let deliveryTime = String(row[columns.deliveryTime] || '').trim();
        if (deliveryTime && deliveryTime !== '/' && !deliveryTime.includes('偏远') && deliveryTime.length < 20) {
            currentDeliveryTime = deliveryTime;
        }

        // 跳过无效数据行
        if (!unitPrice && !registrationFee) {
            continue;
        }

        // 解析重量范围
        let weightRange = parseWeightRange(weightRangeRaw);
        if (!weightRange && options.defaultRange) {
            weightRange = options.defaultRange;
        }

        if (!weightRange) {
            errors.push({ line: i + 1, country, reason: `无法解析重量范围: "${weightRangeRaw}"` });
            stats.failed++;
            continue;
        }

        // 初始化国家数据
        if (!result[country]) {
            result[country] = {
                时效: currentDeliveryTime,
                价格分段: []
            };
        }

        // 添加价格分段
        result[country].价格分段.push({
            重量范围: weightRange,
            单价: unitPrice,
            挂号费: registrationFee
        });

        stats.success++;
    }

    return { data: result, errors, stats, columns };
}

/**
 * 生成 shipping-data.js 内容
 */
function generateShippingData(data, exchangeRate = 6.7411) {
    // 按国家名排序
    const sortedCountries = Object.keys(data).sort();
    const sortedData = {};

    for (const country of sortedCountries) {
        // 按重量范围排序价格分段
        const segments = data[country].价格分段;
        segments.sort((a, b) => {
            const aMatch = a.重量范围.match(/(\d+(?:\.\d+)?)/);
            const bMatch = b.重量范围.match(/(\d+(?:\.\d+)?)/);
            const aMin = aMatch ? parseFloat(aMatch[1]) : 0;
            const bMin = bMatch ? parseFloat(bMatch[1]) : 0;
            return aMin - bMin;
        });

        sortedData[country] = data[country];
    }

    // 生成 JS 文件内容
    const jsonStr = JSON.stringify(sortedData, null, 2)
        .replace(/"([^"]+)":/g, '$1:')  // 移除 key 的引号
        .replace(/"/g, "'");  // 单引号更美观

    return `const shippingData = ${jsonStr};

const exchangeRate = ${exchangeRate};

// 导出供 Node.js 使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { shippingData, exchangeRate };
}
`;
}

/**
 * 显示预览
 */
function showPreview(data, maxCountries = 5) {
    const countries = Object.keys(data).slice(0, maxCountries);

    console.log('\n📊 数据预览 (前 ' + countries.length + ' 个国家):');
    console.log('='.repeat(60));

    for (const country of countries) {
        const info = data[country];
        console.log(`\n🇨🇳 ${country} (时效: ${info.时效})`);

        for (const segment of info.价格分段) {
            console.log(`   ${segment.重量范围}: ¥${segment.单价}/kg + ¥${segment.挂号费}挂号费`);
        }
    }

    if (Object.keys(data).length > maxCountries) {
        console.log(`\n... 还有 ${Object.keys(data).length - maxCountries} 个国家 ...`);
    }
}

// ==================== 命令行交互 ====================

function showHelp() {
    console.log(`
📦 运费数据导入工具

用法:
  node import-tool.js <数据文件.xlsx/csv> [选项]

支持的格式:
  - Excel (.xlsx, .xls)  ← 推荐，直接读取
  - CSV (.csv)           ← 自动检测编码

选项:
  -o, --output <文件>    输出文件路径 (默认: shipping-data.js)
  -r, --rate <数字>      汇率 (默认: 6.7411)
  --preview-only         仅预览，不写入文件
  --dry-run              试运行，显示详细信息但不写入
  -h, --help             显示帮助

示例:
  node import-tool.js "全球 空运小包2026年3月.xlsx"
  node import-tool.js 客户价格表.csv -o shipping-data-new.js -r 7.2
  node import-tool.js 价格表.xlsx --preview-only
`);
}

function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
        showHelp();
        process.exit(0);
    }

    const inputFile = args[0];
    let outputFile = 'shipping-data.js';
    let exchangeRate = 6.7411;
    let previewOnly = false;
    let dryRun = false;

    // 解析参数
    for (let i = 1; i < args.length; i++) {
        switch (args[i]) {
            case '-o':
            case '--output':
                outputFile = args[++i];
                break;
            case '-r':
            case '--rate':
                exchangeRate = parseFloat(args[++i]) || 6.7411;
                break;
            case '--preview-only':
                previewOnly = true;
                break;
            case '--dry-run':
                dryRun = true;
                break;
        }
    }

    console.log('🔧 运费数据导入工具\n');

    // 检查文件
    if (!fs.existsSync(inputFile)) {
        console.error(`❌ 文件不存在: ${inputFile}`);
        process.exit(1);
    }

    // 检查文件扩展名
    const ext = path.extname(inputFile).toLowerCase();
    if (!['.xlsx', '.xls', '.csv'].includes(ext)) {
        console.error(`❌ 不支持的文件格式: ${ext}`);
        console.error('   请使用 .xlsx, .xls 或 .csv 文件');
        process.exit(1);
    }

    try {
        // 读取文件
        console.log(`📖 读取文件: ${inputFile}`);
        const content = readFile(inputFile);

        // 解析数据
        console.log('🔄 解析数据中...\n');
        const { data, errors, stats, columns } = parseData(content);

        // 显示统计
        console.log('\n📈 解析统计:');
        console.log(`   总行数: ${stats.total}`);
        console.log(`   成功: ${stats.success}`);
        console.log(`   失败: ${stats.failed}`);
        console.log(`   国家数: ${Object.keys(data).length}`);

        // 显示错误
        if (errors.length > 0) {
            console.log('\n⚠️  解析警告:');
            errors.slice(0, 10).forEach(err => {
                console.log(`   第 ${err.line} 行: ${err.country} - ${err.reason}`);
            });
            if (errors.length > 10) {
                console.log(`   ... 还有 ${errors.length - 10} 个错误 ...`);
            }
        }

        // 显示预览
        showPreview(data);

        if (previewOnly || dryRun) {
            console.log('\n✅ 预览完成，未写入文件');
            process.exit(0);
        }

        // 确认覆盖
        if (fs.existsSync(outputFile)) {
            console.log(`\n⚠️  文件已存在: ${outputFile}`);
            console.log('   按 Ctrl+C 取消，或直接按回车覆盖...');

            // 简单延迟等待用户
            const start = Date.now();
            while (Date.now() - start < 2000) {
                // 2秒等待
            }
        }

        // 生成并写入文件
        const output = generateShippingData(data, exchangeRate);
        fs.writeFileSync(outputFile, output, 'utf8');

        console.log(`\n✅ 成功写入: ${outputFile}`);
        console.log(`   包含 ${Object.keys(data).length} 个国家的数据`);
        console.log(`   汇率: 1 USD = ${exchangeRate} CNY`);

    } catch (error) {
        console.error(`\n❌ 错误: ${error.message}`);
        process.exit(1);
    }
}

main();
