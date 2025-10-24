// 国家搜索功能
class CountrySearch {
    constructor() {
        this.searchInput = document.getElementById('countrySearch');
        this.searchResults = document.getElementById('searchResults');
        this.countrySelect = document.getElementById('country');
        this.quickSelectButtons = document.getElementById('quickSelectButtons');
        this.selectedIndex = -1;
        this.filteredCountries = [];
        
        // 常用国家列表
        this.popularCountries = [
            '美国', '英国', '德国', '法国', '意大利', '西班牙', 
            '日本', '韩国', '澳大利亚1区', '加拿大', '巴西'
        ];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.populateCountries();
        this.createQuickSelectButtons();
    }

    // 绑定事件
    bindEvents() {
        // 搜索输入事件
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // 搜索框焦点事件
        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value) {
                this.showResults();
            }
        });

        // 搜索框失焦事件（延迟隐藏，允许点击结果）
        this.searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                this.hideResults();
            }, 200);
        });

        // 键盘导航
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e);
        });

        // 点击外部隐藏结果
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.country-search-container')) {
                this.hideResults();
            }
        });
    }

    // 填充国家列表到隐藏的select
    populateCountries() {
        const countries = Object.keys(shippingData).sort();
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            this.countrySelect.appendChild(option);
        });
    }

    // 创建常用国家快速选择按钮
    createQuickSelectButtons() {
        this.popularCountries.forEach(country => {
            if (shippingData[country]) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'quick-select-btn';
                button.textContent = country;
                button.dataset.country = country;
                
                button.addEventListener('click', () => {
                    this.selectCountry(country);
                });
                
                this.quickSelectButtons.appendChild(button);
            }
        });
    }

    // 处理搜索
    handleSearch(query) {
        if (!query.trim()) {
            this.hideResults();
            return;
        }

        this.filteredCountries = this.searchCountries(query.trim());
        this.selectedIndex = -1;
        this.displayResults();
    }

    // 搜索国家
    searchCountries(query) {
        const countries = Object.keys(shippingData);
        const results = [];

        countries.forEach(country => {
            const score = this.calculateMatchScore(country, query);
            if (score > 0) {
                results.push({
                    name: country,
                    score: score,
                    deliveryTime: shippingData[country].时效
                });
            }
        });

        // 按匹配度排序
        return results.sort((a, b) => b.score - a.score).slice(0, 10);
    }

    // 计算匹配分数
    calculateMatchScore(country, query) {
        const countryLower = country.toLowerCase();
        const queryLower = query.toLowerCase();

        // 1. 完全匹配
        if (country === query) return 100;

        // 2. 开头匹配
        if (countryLower.startsWith(queryLower)) return 90;

        // 3. 包含匹配
        if (countryLower.includes(queryLower)) return 80;

        // 4. 拼音首字母匹配（简单实现）
        const pinyinInitials = this.getPinyinInitials(country);
        if (pinyinInitials.includes(queryLower)) return 70;

        // 5. 模糊匹配
        if (this.fuzzyMatch(countryLower, queryLower)) return 60;

        return 0;
    }

    // 获取拼音首字母（简化版）
    getPinyinInitials(country) {
        const pinyinMap = {
            '美国': 'mg', '英国': 'yg', '德国': 'dg', '法国': 'fg', '意大利': 'ydl',
            '西班牙': 'xby', '日本': 'rb', '韩国': 'hg', '澳大利亚': 'adly',
            '加拿大': 'jnd', '巴西': 'bx', '印度': 'yd', '俄罗斯': 'els',
            '荷兰': 'hl', '比利时': 'bls', '奥地利': 'adl', '瑞典': 'rd',
            '挪威': 'nw', '丹麦': 'dm', '芬兰': 'fl', '瑞士': 'rs',
            '新加坡': 'xjp', '马来西亚': 'mlxy', '泰国': 'tg', '越南': 'yn',
            '菲律宾': 'flb', '印度尼西亚': 'ydnxy', '土耳其': 'teq',
            '以色列': 'ysl', '沙特阿拉伯': 'stalb', '阿联酋': 'alq',
            '南非': 'nf', '埃及': 'aj', '摩洛哥': 'mlg', '尼日利亚': 'nrly',
            '肯尼亚': 'kny', '墨西哥': 'mxg', '阿根廷': 'agt', '智利': 'zl',
            '秘鲁': 'ml', '哥伦比亚': 'glby', '委内瑞拉': 'wnrl'
        };
        return pinyinMap[country] || '';
    }

    // 模糊匹配
    fuzzyMatch(text, pattern) {
        let patternIdx = 0;
        for (let i = 0; i < text.length && patternIdx < pattern.length; i++) {
            if (text[i] === pattern[patternIdx]) {
                patternIdx++;
            }
        }
        return patternIdx === pattern.length;
    }

    // 显示搜索结果
    displayResults() {
        if (this.filteredCountries.length === 0) {
            this.showNoResults();
            return;
        }

        this.searchResults.innerHTML = '';
        this.filteredCountries.forEach((country, index) => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.dataset.country = country.name;
            item.dataset.index = index;

            // 高亮匹配文本
            const highlightedName = this.highlightMatch(country.name, this.searchInput.value);

            item.innerHTML = `
                <span class="country-name">${highlightedName}</span>
                <span class="country-delivery-time">${country.deliveryTime}</span>
            `;

            // 点击选择
            item.addEventListener('click', () => {
                this.selectCountry(country.name);
            });

            // 鼠标悬停
            item.addEventListener('mouseenter', () => {
                this.selectedIndex = index;
                this.updateSelection();
            });

            this.searchResults.appendChild(item);
        });

        this.showResults();
    }

    // 高亮匹配文本
    highlightMatch(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    // 显示无结果
    showNoResults() {
        this.searchResults.innerHTML = '<div class="no-results">未找到匹配的国家</div>';
        this.showResults();
    }

    // 显示结果
    showResults() {
        this.searchResults.classList.add('show');
    }

    // 隐藏结果
    hideResults() {
        this.searchResults.classList.remove('show');
        this.selectedIndex = -1;
    }

    // 处理键盘导航
    handleKeyNavigation(e) {
        if (!this.searchResults.classList.contains('show')) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredCountries.length - 1);
                this.updateSelection();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateSelection();
                break;
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0) {
                    this.selectCountry(this.filteredCountries[this.selectedIndex].name);
                }
                break;
            case 'Escape':
                this.hideResults();
                this.searchInput.blur();
                break;
        }
    }

    // 更新选择状态
    updateSelection() {
        const items = this.searchResults.querySelectorAll('.search-result-item');
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // 选择国家
    selectCountry(countryName) {
        this.searchInput.value = countryName;
        this.countrySelect.value = countryName;
        this.hideResults();
        
        // 触发change事件，确保表单验证
        this.countrySelect.dispatchEvent(new Event('change'));
        
        // 聚焦到下一个输入框
        document.getElementById('weight').focus();
    }

    // 获取当前选择的国家
    getSelectedCountry() {
        return this.countrySelect.value;
    }

    // 设置国家（用于外部调用）
    setCountry(countryName) {
        this.searchInput.value = countryName;
        this.countrySelect.value = countryName;
    }
}
