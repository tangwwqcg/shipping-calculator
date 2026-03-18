const fs = require('fs');
const iconv = require('iconv-lite');

// 读取CSV文件的函数
function readCSV(filename, encoding = 'utf8') {
    try {
        if (encoding === 'utf8') {
            const data = fs.readFileSync(filename, 'utf8');
            return data;
        } else {
            const data = fs.readFileSync(filename);
            return iconv.decode(data, encoding);
        }
    } catch (error) {
        console.log(`读取 ${filename} 失败 (${encoding}):`, error.message);
        return null;
    }
}

// 详细解析文件A
function parseFileADetailed(content) {
    const lines = content.split('\n');
    console.log('\n=== 文件A详细解析 ===');
    console.log('总行数:', lines.length);
    
    const data = {};
    
    for (let i = 6; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith(',')) continue;
        
        console.log(`第${i+1}行: ${line}`);
        
        const parts = line.split(',');
        console.log(`  分割后: ${parts.length} 个部分`);
        parts.forEach((part, idx) => {
            console.log(`    [${idx}]: "${part.trim()}"`);
        });
        
        if (parts.length >= 9) {
            const country = parts[2].trim();
            const weightRange = parts[5].trim();
            const unitPrice = parseFloat(parts[6].trim()) || 0;
            const registrationFee = parseFloat(parts[7].trim()) || 0;
            
            console.log(`  解析结果: 国家="${country}", 重量="${weightRange}", 单价=${unitPrice}, 挂号费=${registrationFee}`);
            
            if (country && weightRange && unitPrice > 0 && country !== '国家/地区') {
                if (!data[country]) {
                    data[country] = [];
                }
                
                let formattedRange = weightRange;
                if (weightRange.includes('-')) {
                    const [min, max] = weightRange.split('-');
                    formattedRange = `${min}＜W≤${max}`;
                }
                
                data[country].push({
                    weightRange: formattedRange,
                    unitPrice: unitPrice,
                    registrationFee: registrationFee
                });
            }
        }
        console.log('');
    }
    
    return data;
}

// 详细解析文件B1
function parseFileB1Detailed(content) {
    const lines = content.split('\n');
    console.log('\n=== 文件B1详细解析 ===');
    console.log('总行数:', lines.length);
    
    const data = {};
    
    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        console.log(`第${i+1}行: ${line}`);
        
        const parts = line.split(',');
        console.log(`  分割后: ${parts.length} 个部分`);
        parts.forEach((part, idx) => {
            console.log(`    [${idx}]: "${part.trim()}"`);
        });
        
        if (parts.length >= 5) {
            const country = parts[1].trim();
            const weightRange = parts[2].trim();
            const unitPrice = parseFloat(parts[3].trim()) || 0;
            const registrationFee = parseFloat(parts[4].trim()) || 0;
            
            console.log(`  解析结果: 国家="${country}", 重量="${weightRange}", 单价=${unitPrice}, 挂号费=${registrationFee}`);
            
            if (country && weightRange && unitPrice > 0 && country !== '国家/分区') {
                if (!data[country]) {
                    data[country] = [];
                }
                
                let formattedRange = weightRange;
                if (weightRange.includes('-')) {
                    const [min, max] = weightRange.split('-');
                    formattedRange = `${min}＜W≤${max}`;
                }
                
                data[country].push({
                    weightRange: formattedRange,
                    unitPrice: unitPrice,
                    registrationFee: registrationFee
                });
            }
        }
        console.log('');
    }
    
    return data;
}

// 详细解析文件B2
function parseFileB2Detailed(content) {
    const lines = content.split('\n');
    console.log('\n=== 文件B2详细解析 ===');
    console.log('总行数:', lines.length);
    
    const data = {};
    
    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        console.log(`第${i+1}行: ${line}`);
        
        const parts = line.split(',');
        console.log(`  分割后: ${parts.length} 个部分`);
        parts.forEach((part, idx) => {
            console.log(`    [${idx}]: "${part.trim()}"`);
        });
        
        if (parts.length >= 8) {
            const country = parts[0].trim();
            const weightRange = parts[3].trim();
            const unitPrice = parseFloat(parts[6].trim()) || 0;
            const registrationFee = parseFloat(parts[7].trim()) || 0;
            
            console.log(`  解析结果: 国家="${country}", 重量="${weightRange}", 单价=${unitPrice}, 挂号费=${registrationFee}`);
            
            if (country && weightRange && unitPrice > 0 && country !== '国家/地区') {
                if (!data[country]) {
                    data[country] = [];
                }
                
                data[country].push({
                    weightRange: weightRange,
                    unitPrice: unitPrice,
                    registrationFee: registrationFee
                });
            }
        }
        console.log('');
    }
    
    return data;
}

// 主函数
function main() {
    console.log('🔍 详细解析CSV文件...\n');
    
    // 读取文件
    let fileA = readCSV('a.csv', 'utf8');
    let fileB1 = readCSV('b1.csv', 'utf8');
    let fileB2 = readCSV('b2.csv', 'utf8');
    
    if (!fileA || !fileB1 || !fileB2) {
        console.log('❌ 文件读取失败');
        return;
    }
    
    // 详细解析数据
    const dataA = parseFileADetailed(fileA);
    const dataB1 = parseFileB1Detailed(fileB1);
    const dataB2 = parseFileB2Detailed(fileB2);
    
    console.log('\n📊 解析结果统计:');
    console.log(`- 公司A: ${Object.keys(dataA).length} 个国家`);
    console.log(`- 公司B1: ${Object.keys(dataB1).length} 个国家`);
    console.log(`- 公司B2: ${Object.keys(dataB2).length} 个国家`);
    
    console.log('\n🌍 公司A解析到的国家:');
    Object.keys(dataA).forEach(country => {
        console.log(`- ${country}: ${dataA[country].length} 个价格分段`);
    });
    
    console.log('\n🌍 公司B1解析到的国家:');
    Object.keys(dataB1).forEach(country => {
        console.log(`- ${country}: ${dataB1[country].length} 个价格分段`);
    });
    
    console.log('\n🌍 公司B2解析到的国家:');
    Object.keys(dataB2).forEach(country => {
        console.log(`- ${country}: ${dataB2[country].length} 个价格分段`);
    });
}

main();


