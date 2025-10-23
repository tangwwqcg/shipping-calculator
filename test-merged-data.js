const fs = require('fs');

// 读取合并后的数据
const data = fs.readFileSync('shipping-data-merged.js', 'utf8');
const func = new Function('context', data + '; context.shippingData = shippingData; context.exchangeRate = exchangeRate;');
const context = {};
func(context);
const shippingData = context.shippingData;

console.log('✅ 合并数据加载成功！');
console.log('📊 统计信息:');
console.log('- 总国家数量:', Object.keys(shippingData).length, '个');
console.log('- 汇率:', context.exchangeRate);

console.log('\n🌍 新增的国家:');
['美国', '英国', '德国', '法国', '意大利', '西班牙'].forEach(country => {
    if (shippingData[country]) {
        console.log('  -', country + ':', shippingData[country]['价格分段'].length, '个价格分段');
    }
});

console.log('\n🎯 测试美国计算:');
const testCountry = '美国';
const testWeight = 0.5;
const testCost = 50;

const segments = shippingData[testCountry]['价格分段'];
console.log('美国的价格分段:', segments);

const segment = segments.find(s => {
    const range = s['重量范围'];
    if (range.includes('0.05＜W≤0.1')) return testWeight > 0.05 && testWeight <= 0.1;
    if (range.includes('0.1＜W≤0.2')) return testWeight > 0.1 && testWeight <= 0.2;
    if (range.includes('0.2＜W≤0.45')) return testWeight > 0.2 && testWeight <= 0.45;
    if (range.includes('0.45＜W≤0.7')) return testWeight > 0.45 && testWeight <= 0.7;
    if (range.includes('0.7＜W≤1')) return testWeight > 0.7 && testWeight <= 1;
    if (range.includes('1＜W≤3')) return testWeight > 1 && testWeight <= 3;
    if (range.includes('3＜W≤6')) return testWeight > 3 && testWeight <= 6;
    if (range.includes('6＜W≤30')) return testWeight > 6 && testWeight <= 30;
    return false;
});

if (segment) {
    const totalPrice = testCost + (testWeight * segment['单价']) + segment['挂号费'];
    const usdPrice = totalPrice / context.exchangeRate;
    console.log('测试:', testCountry, testWeight + 'KG，成本' + testCost + '元');
    console.log('匹配分段:', segment['重量范围']);
    console.log('单价:', segment['单价'], '元/KG');
    console.log('挂号费:', segment['挂号费'], '元');
    console.log('结果: ¥' + totalPrice.toFixed(2) + ' / $' + usdPrice.toFixed(2));
}

console.log('\n🎉 数据合并完成！现在包含66个国家的运费数据。');
