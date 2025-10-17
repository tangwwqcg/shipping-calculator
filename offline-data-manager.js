// 离线数据存储管理器
class OfflineDataManager {
    constructor() {
        this.storageKey = 'shipping-calculator-data';
        this.versionKey = 'shipping-calculator-version';
        this.currentVersion = '1.0.0';
        this.init();
    }

    init() {
        this.loadData();
        this.setupUpdateCheck();
    }

    // 加载数据
    loadData() {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            const storedVersion = localStorage.getItem(this.versionKey);
            
            if (storedData && storedVersion === this.currentVersion) {
                console.log('离线数据管理器: 从本地存储加载数据');
                return JSON.parse(storedData);
            } else {
                console.log('离线数据管理器: 使用默认数据');
                this.saveData(this.getDefaultData());
                return this.getDefaultData();
            }
        } catch (error) {
            console.error('离线数据管理器: 加载数据失败', error);
            return this.getDefaultData();
        }
    }

    // 保存数据
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            localStorage.setItem(this.versionKey, this.currentVersion);
            console.log('离线数据管理器: 数据已保存到本地存储');
        } catch (error) {
            console.error('离线数据管理器: 保存数据失败', error);
        }
    }

    // 获取默认数据
    getDefaultData() {
        return {
            shippingData: {
                "美国": {
                    "时效": "6-10工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 0.1", "单价": 80, "挂号费": 23},
                        {"重量范围": "0.1 < W ≤ 0.2", "单价": 70, "挂号费": 25},
                        {"重量范围": "0.2 < W ≤ 2", "单价": 68, "挂号费": 25},
                        {"重量范围": "2 < W ≤ 20", "单价": 60, "挂号费": 25}
                    ]
                },
                "英国": {
                    "时效": "6-10工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 0.2", "单价": 84, "挂号费": 25},
                        {"重量范围": "0.2 < W ≤ 2", "单价": 82, "挂号费": 23},
                        {"重量范围": "2 < W ≤ 20", "单价": 71, "挂号费": 23}
                    ]
                },
                "德国": {
                    "时效": "6-10工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 2", "单价": 69, "挂号费": 25},
                        {"重量范围": "2 < W ≤ 30", "单价": 69, "挂号费": 25}
                    ]
                },
                "法国": {
                    "时效": "6-10工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 0.3", "单价": 62, "挂号费": 18},
                        {"重量范围": "0.3 < W ≤ 2", "单价": 53, "挂号费": 23},
                        {"重量范围": "2 < W ≤ 20", "单价": 56, "挂号费": 23}
                    ]
                },
                "意大利": {
                    "时效": "6-10工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 0.2", "单价": 69, "挂号费": 13},
                        {"重量范围": "0.2 < W ≤ 2", "单价": 63, "挂号费": 17},
                        {"重量范围": "2 < W ≤ 30", "单价": 63, "挂号费": 17}
                    ]
                },
                "西班牙": {
                    "时效": "8-12工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 2", "单价": 153, "挂号费": 28},
                        {"重量范围": "2 < W ≤ 10", "单价": 153, "挂号费": 28}
                    ]
                },
                "荷兰": {
                    "时效": "6-10工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 0.1", "单价": 80, "挂号费": 23},
                        {"重量范围": "0.1 < W ≤ 0.2", "单价": 70, "挂号费": 25},
                        {"重量范围": "0.2 < W ≤ 2", "单价": 68, "挂号费": 25}
                    ]
                },
                "比利时": {
                    "时效": "8-12工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 2", "单价": 117, "挂号费": 31},
                        {"重量范围": "2 < W ≤ 30", "单价": 122, "挂号费": 31}
                    ]
                },
                "瑞士": {
                    "时效": "6-10工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 20", "单价": 85, "挂号费": 25}
                    ]
                },
                "希腊": {
                    "时效": "8-12工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 30", "单价": 77, "挂号费": 20}
                    ]
                },
                "葡萄牙": {
                    "时效": "6-10工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 30", "单价": 80, "挂号费": 20}
                    ]
                },
                "奥地利": {
                    "时效": "6-10工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 30", "单价": 75, "挂号费": 22}
                    ]
                },
                "瑞典": {
                    "时效": "6-10工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 30", "单价": 63, "挂号费": 23}
                    ]
                },
                "挪威": {
                    "时效": "6-10工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 30", "单价": 72, "挂号费": 23}
                    ]
                },
                "丹麦": {
                    "时效": "6-10工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 2", "单价": 55, "挂号费": 23},
                        {"重量范围": "2 < W ≤ 30", "单价": 61, "挂号费": 23}
                    ]
                },
                "芬兰": {
                    "时效": "6-10工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 30", "单价": 80, "挂号费": 22}
                    ]
                },
                "波兰": {
                    "时效": "6-10工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 30", "单价": 71, "挂号费": 28}
                    ]
                },
                "捷克": {
                    "时效": "6-10工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 0.3", "单价": 87, "挂号费": 26},
                        {"重量范围": "0.3 < W ≤ 2", "单价": 71, "挂号费": 26},
                        {"重量范围": "2 < W ≤ 15", "单价": 67, "挂号费": 26}
                    ]
                },
                "墨西哥": {
                    "时效": "8-12工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 0.2", "单价": 82, "挂号费": 18},
                        {"重量范围": "0.2 < W ≤ 0.5", "单价": 82, "挂号费": 19},
                        {"重量范围": "0.5 < W ≤ 1", "单价": 82, "挂号费": 20},
                        {"重量范围": "1 < W ≤ 3", "单价": 82, "挂号费": 22},
                        {"重量范围": "3 < W ≤ 10", "单价": 82, "挂号费": 22}
                    ]
                },
                "巴西": {
                    "时效": "15-25工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 0.2", "单价": 87, "挂号费": 37},
                        {"重量范围": "0.2 < W ≤ 0.5", "单价": 87, "挂号费": 37},
                        {"重量范围": "0.5 < W ≤ 1", "单价": 87, "挂号费": 39},
                        {"重量范围": "1 < W ≤ 1.5", "单价": 87, "挂号费": 47},
                        {"重量范围": "1.5 < W ≤ 2", "单价": 87, "挂号费": 51},
                        {"重量范围": "2 < W ≤ 5", "单价": 87, "挂号费": 62},
                        {"重量范围": "5 < W ≤ 10", "单价": 87, "挂号费": 102}
                    ]
                },
                "新加坡": {
                    "时效": "6-7工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 30", "单价": 32, "挂号费": 18}
                    ]
                },
                "马来西亚": {
                    "时效": "8-10工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 30", "单价": 24, "挂号费": 18}
                    ]
                },
                "泰国": {
                    "时效": "5-6工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 25", "单价": 28, "挂号费": 10}
                    ]
                },
                "日本": {
                    "时效": "6-7工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 2", "单价": 35, "挂号费": 6},
                        {"重量范围": "2 < W ≤ 10", "单价": 35, "挂号费": 7}
                    ]
                },
                "加拿大": {
                    "时效": "8-15工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 0.15", "单价": 72, "挂号费": 23},
                        {"重量范围": "0.15 < W ≤ 0.3", "单价": 73, "挂号费": 23},
                        {"重量范围": "0.3 < W ≤ 0.45", "单价": 73, "挂号费": 23},
                        {"重量范围": "0.45 < W ≤ 0.75", "单价": 74, "挂号费": 24},
                        {"重量范围": "0.75 < W ≤ 1", "单价": 75, "挂号费": 24},
                        {"重量范围": "1 < W ≤ 1.5", "单价": 75, "挂号费": 25},
                        {"重量范围": "1.5 < W ≤ 2", "单价": 75, "挂号费": 25},
                        {"重量范围": "2 < W ≤ 30", "单价": 79, "挂号费": 25}
                    ]
                },
                "澳大利亚": {
                    "时效": "5-10工作日",
                    "价格分段": [
                        {"重量范围": "0 < W ≤ 0.3", "单价": 24, "挂号费": 23},
                        {"重量范围": "0.3 < W ≤ 0.5", "单价": 24, "挂号费": 26},
                        {"重量范围": "0.5 < W ≤ 1", "单价": 24, "挂号费": 27},
                        {"重量范围": "1 < W ≤ 3", "单价": 24, "挂号费": 29},
                        {"重量范围": "3 < W ≤ 20", "单价": 24, "挂号费": 44}
                    ]
                }
            },
            profitRules: {
                "高": {"条件": "成本 > 60", "利润": 25},
                "中": {"条件": "30 ≤ 成本 ≤ 60", "利润": 20},
                "低": {"条件": "成本 < 30", "利润": 15}
            },
            exchangeRate: 7.1,
            lastUpdated: new Date().toISOString()
        };
    }

    // 设置更新检查
    setupUpdateCheck() {
        // 检查是否有网络连接
        if (navigator.onLine) {
            this.checkForUpdates();
        }

        // 监听网络状态变化
        window.addEventListener('online', () => {
            this.checkForUpdates();
        });
    }

    // 检查更新
    async checkForUpdates() {
        try {
            console.log('离线数据管理器: 检查数据更新');
            
            // 这里可以添加从服务器获取最新数据的逻辑
            // const response = await fetch('/api/shipping-data');
            // if (response.ok) {
            //     const newData = await response.json();
            //     if (this.isDataNewer(newData)) {
            //         this.updateData(newData);
            //     }
            // }
            
        } catch (error) {
            console.log('离线数据管理器: 更新检查失败，使用本地数据');
        }
    }

    // 判断数据是否更新
    isDataNewer(newData) {
        if (!newData.lastUpdated) return false;
        
        const currentData = this.loadData();
        const currentTime = new Date(currentData.lastUpdated);
        const newTime = new Date(newData.lastUpdated);
        
        return newTime > currentTime;
    }

    // 更新数据
    updateData(newData) {
        console.log('离线数据管理器: 更新数据');
        this.saveData(newData);
        
        // 通知应用数据已更新
        window.dispatchEvent(new CustomEvent('dataUpdated', {
            detail: newData
        }));
    }

    // 获取数据
    getData() {
        return this.loadData();
    }

    // 清除数据
    clearData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.versionKey);
        console.log('离线数据管理器: 数据已清除');
    }

    // 获取存储使用情况
    getStorageInfo() {
        try {
            const data = localStorage.getItem(this.storageKey);
            const size = data ? new Blob([data]).size : 0;
            
            return {
                size: size,
                sizeFormatted: this.formatBytes(size),
                version: this.currentVersion,
                lastUpdated: this.loadData().lastUpdated
            };
        } catch (error) {
            return {
                size: 0,
                sizeFormatted: '0 B',
                version: this.currentVersion,
                lastUpdated: null
            };
        }
    }

    // 格式化字节大小
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 导出数据管理器
window.OfflineDataManager = OfflineDataManager;