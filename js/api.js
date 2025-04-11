// DeepSeek AI API集成

// API密钥
const API_KEY = 'sk-gcxbvblpnyeoxouyhkcunffyxcvqzbwiklrfsjaylanwwrlw';

// API端点 - 根据DeepSeek文档更新
const API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

/**
 * 获取AI对塔罗牌的解读
 * @param {string} question - 用户的问题
 * @param {string} spreadType - 牌阵类型
 * @param {Array} cards - 抽取的卡牌信息
 * @returns {Promise<string>} - 解读结果HTML
 */
async function getAIInterpretation(question, spreadType, cards) {
    try {
        // 构建提示信息
        const prompt = buildPrompt(question, spreadType, cards);
        
        // 构建请求体 - 根据DeepSeek文档更新
        const requestBody = {
            model: "deepseek-v3",
            messages: [
                {
                    role: "system",
                    content: "你是一位经验丰富的塔罗牌解读师，擅长通过塔罗牌为人们提供洞察和指导。请根据用户提供的问题和抽取的塔罗牌，给出详细、有深度且个性化的解读。你的解读应该包含每张牌的基本含义，牌与牌之间的关系，以及对用户问题的具体指导。"
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        };
        
        // 发送请求
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });
        
        // 检查响应状态
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API请求失败: ${errorData.error?.message || response.statusText}`);
        }
        
        // 解析响应
        const data = await response.json();
        const interpretation = data.choices[0].message.content;
        
        // 格式化解读结果为HTML
        return formatInterpretation(interpretation);
    } catch (error) {
        console.error('获取AI解读失败:', error);
        
        // 如果API调用失败，提供一个备用解读
        return `
            <p>抱歉，目前无法连接到AI服务。以下是基于您抽取的塔罗牌的一般性解读：</p>
            
            <h4>塔罗牌解读概览</h4>
            <p>您抽取的塔罗牌组合显示了一个有趣的能量模式。这些牌面反映了您当前所处的情境以及可能的发展方向。</p>
            
            <p>请记住，塔罗牌是一种反思和自我探索的工具，最终的决定权始终在您手中。</p>
            
            <h4>建议</h4>
            <p>根据这些牌面，建议您：</p>
            <ul>
                <li>留意周围环境中的细微变化</li>
                <li>相信自己的直觉</li>
                <li>保持开放的心态，接纳新的可能性</li>
            </ul>
            
            <p>当AI服务恢复后，您可以重新进行占卜以获取更详细的解读。</p>
        `;
    }
}

/**
 * 构建提示信息
 * @param {string} question - 用户的问题
 * @param {string} spreadType - 牌阵类型
 * @param {Array} cards - 抽取的卡牌信息
 * @returns {string} - 提示信息
 */
function buildPrompt(question, spreadType, cards) {
    // 获取牌阵名称
    let spreadName = '';
    switch(spreadType) {
        case 'single':
            spreadName = '单卡牌阵';
            break;
        case 'three':
            spreadName = '三卡牌阵（过去、现在、未来）';
            break;
        case 'celtic':
            spreadName = '凯尔特十字牌阵';
            break;
        case 'relationship':
            spreadName = '关系牌阵';
            break;
        case 'career':
            spreadName = '职业发展牌阵';
            break;
        default:
            spreadName = '塔罗牌阵';
    }
    
    // 构建卡牌信息
    let cardsInfo = '';
    cards.forEach((card, index) => {
        let position = '';
        
        // 根据牌阵类型确定位置名称
        switch(spreadType) {
            case 'single':
                position = '当前情况';
                break;
            case 'three':
                position = ['过去', '现在', '未来'][index];
                break;
            case 'celtic':
                position = [
                    '当前情况', '挑战', '过去', '未来', 
                    '意识', '潜意识', '自我认知', '外部影响', 
                    '希望或恐惧', '最终结果'
                ][index];
                break;
            case 'relationship':
                position = [
                    '你自己', '对方', '关系现状', 
                    '关系基础', '过去影响', '未来发展'
                ][index];
                break;
            case 'career':
                position = [
                    '当前职业状况', '挑战', '优势', 
                    '应该避免的', '应该追求的'
                ][index];
                break;
            default:
                position = `位置${index + 1}`;
        }
        
        cardsInfo += `${position}: ${card.name} (${card.position})\n`;
    });
    
    // 构建完整提示
    return `
用户问题: ${question}

牌阵类型: ${spreadName}

抽取的卡牌:
${cardsInfo}

请根据以上信息，给出详细的塔罗牌解读。解读应包括:
1. 每张牌在其位置上的基本含义
2. 牌与牌之间的关系和整体故事
3. 对用户问题的具体指导和建议
4. 可能的未来发展方向

请使用专业但易于理解的语言，并提供有深度的洞察。
`;
}

/**
 * 格式化解读结果为HTML
 * @param {string} text - 原始解读文本
 * @returns {string} - 格式化后的HTML
 */
function formatInterpretation(text) {
    // 替换换行符为段落
    let html = text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
    
    // 添加段落标签
    html = `<p>${html}</p>`;
    
    // 格式化标题
    html = html.replace(/^(#+)\s+(.*?)$/gm, (match, hashes, content) => {
        const level = hashes.length;
        return `<h${level + 3}>${content}</h${level + 3}>`;
    });
    
    // 格式化粗体
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 格式化斜体
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return html;
}

// 导出函数
window.getAIInterpretation = getAIInterpretation;