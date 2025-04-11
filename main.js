// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', function() {
    // 初始化变量
    let selectedSpread = null;
    let drawnCards = [];
    let requiredCards = 0;
    let currentStep = 1;
    
    // 获取DOM元素
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    const spreadCards = document.querySelectorAll('.spread-card');
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');
    const selectButtons = document.querySelectorAll('.select-btn');
    const questionInput = document.getElementById('question-input');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const cutBtn = document.getElementById('cut-btn');
    const tarotDeck = document.querySelector('.tarot-deck');
    const drawnCountElement = document.getElementById('drawn-count');
    const requiredCountElement = document.getElementById('required-count');
    const spreadDisplay = document.querySelector('.spread-display');
    const interpretationContent = document.querySelector('.interpretation-content');
    const loadingIndicator = document.querySelector('.loading-indicator');
    const saveReadingBtn = document.getElementById('save-reading');
    const shareReadingBtn = document.getElementById('share-reading');
    const newReadingBtn = document.getElementById('new-reading');
    const cardModal = document.getElementById('card-modal');
    const closeModal = document.querySelector('.close-modal');
    const modalBody = document.querySelector('.modal-body');
    
    // 导航栏滚动效果
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // 移动端菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // 如果是移动端，点击后关闭菜单
                if (nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            }
        });
    });
    
    // 步骤导航功能
    function goToStep(stepNumber) {
        // 隐藏所有步骤内容
        stepContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // 更新步骤指示器
        steps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            if (stepNum <= stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // 显示当前步骤内容
        document.getElementById(`step-${stepNumber}`).classList.add('active');
        currentStep = stepNumber;
        
        // 如果是第三步，初始化塔罗牌堆
        if (stepNumber === 3) {
            initTarotDeck();
        }
    }
    
    // 下一步按钮事件
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStepElement = this.closest('.step-content');
            const currentStepId = currentStepElement.id;
            const currentStepNumber = parseInt(currentStepId.split('-')[1]);
            goToStep(currentStepNumber + 1);
        });
    });
    
    // 上一步按钮事件
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStepElement = this.closest('.step-content');
            const currentStepId = currentStepElement.id;
            const currentStepNumber = parseInt(currentStepId.split('-')[1]);
            goToStep(currentStepNumber - 1);
        });
    });
    
    // 牌阵选择事件
    spreadCards.forEach(card => {
        card.addEventListener('click', function() {
            // 移除之前的选择
            spreadCards.forEach(c => c.classList.remove('selected'));
            
            // 添加新的选择
            this.classList.add('selected');
            selectedSpread = this.dataset.spread;
            
            // 根据牌阵类型设置所需卡牌数量
            switch(selectedSpread) {
                case 'single':
                    requiredCards = 1;
                    break;
                case 'three':
                    requiredCards = 3;
                    break;
                case 'celtic':
                    requiredCards = 10;
                    break;
                case 'relationship':
                    requiredCards = 6;
                    break;
                case 'career':
                    requiredCards = 5;
                    break;
                default:
                    requiredCards = 3;
            }
            
            // 更新所需卡牌数量显示
            if (requiredCountElement) {
                requiredCountElement.textContent = requiredCards;
            }
            
            // 启用下一步按钮
            const nextBtn = document.querySelector('#step-1 .next-btn');
            if (nextBtn) {
                nextBtn.disabled = false;
            }
        });
    });
    
    // 选择按钮事件（与牌阵卡片点击相同效果）
    selectButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            const spreadCard = this.closest('.spread-card');
            spreadCard.click(); // 触发牌阵卡片的点击事件
        });
    });
    
    // 问题输入事件
    if (questionInput) {
        questionInput.addEventListener('input', function() {
            const nextBtn = document.querySelector('#step-2 .next-btn');
            if (nextBtn) {
                nextBtn.disabled = this.value.trim().length < 5;
            }
        });
    }
    
    // 初始化塔罗牌堆
    function initTarotDeck() {
        if (!tarotDeck) return;
        
        // 清空现有的牌
        tarotDeck.innerHTML = '';
        drawnCards = [];
        
        // 创建78张塔罗牌
        const cards = [
            { name: '愚者', number: '0', description: '新的开始，冒险' },
            { name: '魔术师', number: 'I', description: '创造力，技能' },
            { name: '女祭司', number: 'II', description: '直觉，神秘' },
            { name: '皇后', number: 'III', description: '丰收，母性' },
            { name: '皇帝', number: 'IV', description: '权威，领导' },
            { name: '教皇', number: 'V', description: '传统，信仰' },
            { name: '恋人', number: 'VI', description: '选择，关系' },
            { name: '战车', number: 'VII', description: '胜利，进取' },
            { name: '力量', number: 'VIII', description: '勇气，力量' },
            { name: '隐者', number: 'IX', description: '智慧，独处' },
            { name: '命运之轮', number: 'X', description: '变化，机遇' },
            { name: '正义', number: 'XI', description: '公平，平衡' },
            { name: '倒吊人', number: 'XII', description: '牺牲，新视角' },
            { name: '死神', number: 'XIII', description: '结束，转变' },
            { name: '节制', number: 'XIV', description: '平和，调和' },
            { name: '恶魔', number: 'XV', description: '束缚，欲望' },
            { name: '塔', number: 'XVI', description: '突变，启示' },
            { name: '星星', number: 'XVII', description: '希望，启发' },
            { name: '月亮', number: 'XVIII', description: '幻想，恐惧' },
            { name: '太阳', number: 'XIX', description: '快乐，活力' },
            { name: '审判', number: 'XX', description: '觉醒，重生' },
            { name: '世界', number: 'XXI', description: '圆满，完成' }
        ];
        
        // 洗牌
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        
        // 创建卡牌元素
        cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'tarot-card';
            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <div class="card-design">
                            <div class="card-border">
                                <div class="card-content">
                                    <div class="card-number">${card.number}</div>
                                    <div class="card-symbol">塔罗牌</div>
                                    <div class="card-decoration">
                                        <div class="circle"></div>
                                        <div class="lines">
                                            <div class="line"></div>
                                            <div class="line"></div>
                                            <div class="line"></div>
                                        </div>
                                    </div>
                                    <div class="card-title">${card.name}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-back">
                        <div class="card-design">
                            <div class="card-border">
                                <div class="card-pattern"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            cardElement.dataset.index = index;
            cardElement.dataset.name = card.name;
            cardElement.dataset.description = card.description;
            
            tarotDeck.appendChild(cardElement);
        });
        
        // 更新计数器
        if (drawnCountElement) {
            drawnCountElement.textContent = drawnCards.length;
        }
        if (requiredCountElement) {
            requiredCountElement.textContent = requiredCards;
        }
    }
    
    // 抽牌功能
    function drawCard() {
        if (drawnCards.length >= requiredCards) return;
        
        const availableCards = Array.from(document.querySelectorAll('.tarot-card:not(.drawn)'));
        if (availableCards.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        const selectedCard = availableCards[randomIndex];
        
        // 随机决定正逆位
        const isReversed = Math.random() < 0.5;
        
        // 添加到已抽取的卡牌数组
        drawnCards.push({
            name: selectedCard.dataset.name,
            description: selectedCard.dataset.description,
            isReversed: isReversed
        });
        
        // 标记卡牌为已抽取
        selectedCard.classList.add('drawn');
        
        // 更新计数器
        if (drawnCountElement) {
            drawnCountElement.textContent = drawnCards.length;
        }
        
        // 如果抽够了所需数量的卡牌，启用下一步按钮
        if (drawnCards.length === requiredCards) {
            const nextBtn = document.querySelector('#step-3 .next-btn');
            if (nextBtn) {
                nextBtn.disabled = false;
            }
        }
    }
    
    // 显示牌阵和解读
    function displayReading() {
        if (spreadDisplay) {
            spreadDisplay.innerHTML = '';
            
            // 根据不同牌阵类型显示卡牌
            let positions = [];
            
            switch(selectedSpread) {
                case 'single':
                    positions = ['当前情况'];
                    break;
                case 'three':
                    positions = ['过去', '现在', '未来'];
                    break;
                case 'celtic':
                    positions = [
                        '当前情况', '挑战', '过去', '未来', 
                        '意识', '潜意识', '自我认知', '外部影响', 
                        '希望或恐惧', '最终结果'
                    ];
                    break;
                case 'relationship':
                    positions = [
                        '你自己', '对方', '关系现状', 
                        '关系基础', '过去影响', '未来发展'
                    ];
                    break;
                case 'career':
                    positions = [
                        '当前职业状况', '挑战', '优势', 
                        '应该避免的', '应该追求的'
                    ];
                    break;
                default:
                    positions = ['过去', '现在', '未来'];
            }
            
            // 创建牌阵显示
            drawnCards.forEach((card, index) => {
                if (index < positions.length) {
                    const cardElement = document.createElement('div');
                    cardElement.className = 'card-position';
                    
                    // 使用iframe加载HTML信息图
                    const cardImage = document.createElement('iframe');
                    cardImage.className = 'card-image';
                    cardImage.src = 'images/cards/major/' + card.name.toLowerCase() + '.html';
                    cardImage.frameBorder = "0";
                    cardImage.scrolling = "no";
                    cardImage.style.width = "100%";
                    cardImage.style.height = "100%";
                    
                    // 如果是逆位，添加旋转效果
                    const cardImageWrapper = document.createElement('div');
                    cardImageWrapper.className = 'card-image-wrapper';
                    if (card.isReversed) {
                        cardImageWrapper.style.transform = 'rotate(180deg)';
                    }
                    cardImageWrapper.appendChild(cardImage);
                    
                    const cardTitle = document.createElement('div');
                    cardTitle.className = 'card-title';
                    cardTitle.textContent = card.name + (card.isReversed ? ' (逆位)' : ' (正位)');
                    
                    const positionName = document.createElement('div');
                    positionName.className = 'card-position-name';
                    positionName.textContent = positions[index];
                    
                    cardElement.appendChild(cardImageWrapper);
                    cardElement.appendChild(cardTitle);
                    cardElement.appendChild(positionName);
                    
                    // 添加点击事件查看卡牌详情
                    cardElement.addEventListener('click', () => {
                        showCardDetails(card, positions[index]);
                    });
                    
                    spreadDisplay.appendChild(cardElement);
                }
            });
            
            // 准备AI解读
            prepareAIInterpretation();
        }
    }
    
    // 显示卡牌详情模态框
    function showCardDetails(card, position) {
        if (cardModal && modalBody) {
            modalBody.innerHTML = `
                <div class="card-detail">
                    <iframe class="card-detail-image" src="images/cards/major/${card.name.toLowerCase()}.html" frameborder="0" scrolling="no" 
                        style="${card.isReversed ? 'transform: rotate(180deg);' : ''}"></iframe>
                    <div class="card-detail-info">
                        <h3>${card.name} ${card.isReversed ? '(逆位)' : '(正位)'}</h3>
                        <p class="position"><strong>位置:</strong> ${position}</p>
                        <p class="description"><strong>含义:</strong> ${card.description}</p>
                        <p class="interpretation"><strong>${card.isReversed ? '逆位解读' : '正位解读'}:</strong> 
                            ${card.isReversed ? 
                                '逆位通常表示该牌的能量受阻或内化，可能代表相关特质的不足或过度。' : 
                                '正位通常表示该牌的能量流畅外显，代表相关特质的平衡表达。'}
                        </p>
                    </div>
                </div>
            `;
            
            cardModal.classList.add('active');
        }
    }
    
    // 关闭模态框
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            cardModal.classList.remove('active');
        });
    }
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target === cardModal) {
            cardModal.classList.remove('active');
        }
    });
    
    // 准备AI解读
    function prepareAIInterpretation() {
        if (loadingIndicator && interpretationContent) {
            loadingIndicator.style.display = 'flex';
            interpretationContent.innerHTML = '';
            
            // 构建请求数据
            const question = questionInput ? questionInput.value.trim() : '请解读我的塔罗牌';
            const spreadType = selectedSpread;
            const cards = drawnCards.map(card => {
                return {
                    name: card.name,
                    position: card.isReversed ? '逆位' : '正位'
                };
            });
            
            // 调用API获取解读
            getAIInterpretation(question, spreadType, cards)
                .then(interpretation => {
                    loadingIndicator.style.display = 'none';
                    displayInterpretation(interpretation);
                })
                .catch(error => {
                    console.error('获取AI解读失败:', error);
                    loadingIndicator.style.display = 'none';
                    interpretationContent.innerHTML = '<p>抱歉，获取AI解读时出现错误，请稍后再试。</p>';
                });
        }
    }
    
    // 显示解读结果
    function displayInterpretation(interpretation) {
        if (interpretationContent) {
            interpretationContent.innerHTML = interpretation;
        }
    }
    
    // 保存解读结果
    if (saveReadingBtn) {
        saveReadingBtn.addEventListener('click', function() {
            const readingData = {
                date: new Date().toLocaleString(),
                question: questionInput ? questionInput.value : '',
                spread: selectedSpread,
                cards: drawnCards,
                interpretation: interpretationContent ? interpretationContent.innerHTML : ''
            };
            
            // 保存到本地存储
            const savedReadings = JSON.parse(localStorage.getItem('tarotReadings') || '[]');
            savedReadings.push(readingData);
            localStorage.setItem('tarotReadings', JSON.stringify(savedReadings));
            
            alert('解读已保存！');
        });
    }
    
    // 分享解读结果
    if (shareReadingBtn) {
        shareReadingBtn.addEventListener('click', function() {
            // 这里可以实现社交媒体分享功能
            alert('分享功能即将上线！');
        });
    }
    
    // 开始新的占卜
    if (newReadingBtn) {
        newReadingBtn.addEventListener('click', function() {
            // 重置所有状态
            selectedSpread = null;
            drawnCards = [];
            requiredCards = 0;
            
            // 重置牌阵选择
            spreadCards.forEach(card => {
                card.classList.remove('selected');
            });
            
            // 重置问题输入
            if (questionInput) {
                questionInput.value = '';
            }
            
            // 返回第一步
            goToStep(1);
        });
    }
    
    // 监听步骤4的显示，显示牌阵和解读
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const step4 = document.getElementById('step-4');
                if (step4 && step4.classList.contains('active')) {
                    displayReading();
                }
            }
        });
    });
    
    const step4 = document.getElementById('step-4');
    if (step4) {
        observer.observe(step4, { attributes: true });
    }
    
    // 联系表单提交
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('感谢您的留言！我们会尽快回复。');
            this.reset();
        });
    }
    
    // 订阅表单提交
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('感谢您的订阅！');
            this.reset();
        });
    }
});