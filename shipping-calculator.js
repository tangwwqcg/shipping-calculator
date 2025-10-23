// 运费计算器主逻辑
class ShippingCalculator {
    constructor() {
        this.init();
    }

    init() {
        this.populateCountries();
        this.bindEvents();
        this.checkOfflineStatus();
        this.setupOfflineHandlers();
    }

    // 填充国家选择列表
    populateCountries() {
        const countrySelect = document.getElementById('country');
        const countries = Object.keys(shippingData).sort();
        
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
    }

    // 绑定事件
    bindEvents() {
        const form = document.getElementById('shippingForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculate();
        });
    }

    // 检查离线状态
    checkOfflineStatus() {
        const offlineIndicator = document.getElementById('offlineIndicator');
        if (!navigator.onLine) {
            offlineIndicator.classList.add('show');
        }
    }

    // 设置离线处理
    setupOfflineHandlers() {
        window.addEventListener('online', () => {
            document.getElementById('offlineIndicator').classList.remove('show');
        });

        window.addEventListener('offline', () => {
            document.getElementById('offlineIndicator').classList.add('show');
        });
    }

    // 根据重量找到对应的价格分段
    findPriceSegment(country, weight) {
        const countryData = shippingData[country];
        if (!countryData) return null;

        for (let segment of countryData.价格分段) {
            const range = segment.重量范围;
            // 解析重量范围，例如 "0 < W ≤ 0.1"
            const match = range.match(/(\d+(?:\.\d+)?)\s*<\s*W\s*≤\s*(\d+(?:\.\d+)?)/);
            if (match) {
                const minWeight = parseFloat(match[1]);
                const maxWeight = parseFloat(match[2]);
                if (weight > minWeight && weight <= maxWeight) {
                    return segment;
                }
            }
        }
        return null;
    }

    // 计算利润
    calculateProfit(cost) {
        if (cost > 60) {
            return { amount: 25, level: '高' };
        } else if (cost >= 30) {
            return { amount: 20, level: '中' };
        } else {
            return { amount: 15, level: '低' };
        }
    }

    // 格式化货币
    formatCurrency(amount, currency = 'RMB') {
        if (currency === 'RMB') {
            return `¥${amount.toFixed(2)}`;
        } else if (currency === 'USD') {
            return `$${amount.toFixed(2)}`;
        }
        return amount.toFixed(2);
    }

    // 显示错误信息
    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        
        // 3秒后自动隐藏
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 3000);
    }

    // 隐藏错误信息
    hideError() {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.classList.remove('show');
    }

    // 主计算函数
    calculate() {
        try {
            // 获取输入值
            const country = document.getElementById('country').value;
            const weight = parseFloat(document.getElementById('weight').value);
            const cost = parseFloat(document.getElementById('cost').value);

            // 验证输入
            if (!country) {
                this.showError('请选择目的国家');
                return;
            }

            if (!weight || weight <= 0) {
                this.showError('请输入有效的重量');
                return;
            }

            if (!cost || cost < 0) {
                this.showError('请输入有效的成本');
                return;
            }

            // 查找价格分段
            const priceSegment = this.findPriceSegment(country, weight);
            if (!priceSegment) {
                this.showError('未找到对应的重量区间，请检查重量是否在有效范围内');
                return;
            }

            // 计算运费
            const shippingFee = weight * priceSegment.单价 + priceSegment.挂号费;

            // 计算利润
            const profit = this.calculateProfit(cost);

            // 计算总价
            const totalRMB = cost + shippingFee + profit.amount;
            const totalUSD = totalRMB / exchangeRate;

            // 隐藏错误信息
            this.hideError();

            // 显示结果
            this.displayResults({
                country: country,
                weight: weight,
                cost: cost,
                priceSegment: priceSegment,
                shippingFee: shippingFee,
                profit: profit,
                totalRMB: totalRMB,
                totalUSD: totalUSD
            });

        } catch (error) {
            console.error('计算错误:', error);
            this.showError('计算过程中出现错误，请检查输入数据');
        }
    }

    // 显示计算结果
    displayResults(results) {
        const resultSection = document.getElementById('resultSection');
        
        // 更新主要结果
        document.getElementById('shippingFee').textContent = this.formatCurrency(results.shippingFee);
        document.getElementById('profit').textContent = this.formatCurrency(results.profit.amount);
        document.getElementById('totalRMB').textContent = this.formatCurrency(results.totalRMB);
        document.getElementById('totalUSD').textContent = this.formatCurrency(results.totalUSD, 'USD');

        // 更新详细信息
        this.updateDetails(results);

        // 显示结果区域
        resultSection.classList.add('show');
        
        // 滚动到结果区域
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    // 更新详细信息
    updateDetails(results) {
        const detailsList = document.getElementById('detailsList');
        detailsList.innerHTML = '';

        const details = [
            { label: '目的国家', value: results.country },
            { label: '包裹重量', value: `${results.weight} KG` },
            { label: '重量区间', value: results.priceSegment.重量范围 },
            { label: '单价', value: `¥${results.priceSegment.单价}/KG` },
            { label: '挂号费', value: `¥${results.priceSegment.挂号费}` },
            { label: '运费计算', value: `${results.weight} × ${results.priceSegment.单价} + ${results.priceSegment.挂号费} = ¥${results.shippingFee.toFixed(2)}` },
            { label: '商品成本', value: this.formatCurrency(results.cost) },
            { label: '利润等级', value: `${results.profit.level} (${this.formatCurrency(results.profit.amount)})` },
            { label: '汇率', value: `1 USD = ${exchangeRate} CNY` }
        ];

        details.forEach(detail => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="label">${detail.label}</span>
                <span class="value">${detail.value}</span>
            `;
            detailsList.appendChild(li);
        });
    }
}

// 计算器类定义完成，等待外部调用初始化

