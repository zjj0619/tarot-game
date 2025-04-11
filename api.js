// 后端API端点
const API_ENDPOINT = 'http://localhost:5000/api/tarot';

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
        
        // 构建请求体
        const requestBody = {
            prompt: prompt
        };
        
        console.log('发送请求到后端服务');

        // 发送请求
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('API 响应错误:', response.status, errorData);
            throw new Error(`API 请求失败: ${response.status} ${errorData}`);
        }

        const data = await response.json();
        console.log('API 响应:', data);

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('API 响应格式不正确');
        }

        // 获取AI回复
        const interpretation = data.choices[0].message.content;
        
        // 格式化解读结果
        return formatInterpretation(interpretation);
        
    } catch (error) {
        console.error('AI解读错误:', error);
        return `
            <h3>暂时无法获取AI解读</h3>
            <p>抱歉，当前无法连接到AI服务。错误信息：${error.message}</p>
            
            <h4>临时解读</h4>
            <p>在等待AI服务恢复期间，您可以：</p>
            <ul>
                <li>查看每张牌的基本含义</li>
                <li>思考牌面之间的关联</li>
                <li>相信自己的直觉解读</li>
            </ul>
            
            <p>请稍后再试。如果问题持续，请检查网络连接或联系技术支持。</p>
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
    let prompt = `作为一位专业的塔罗牌解读师，请为以下问题提供详细的解读：

问题：${question}

牌阵：${spreadType}

抽取的卡牌：
${cards.map((card, index) => `${index + 1}. ${card.name} (${card.isReversed ? '逆位' : '正位'})`).join('\n')}

请按照以下结构提供解读：

1. 总体印象：
   - 简要概述这次抽牌的整体能量
   - 与提问者的问题的直接关联

2. 每张牌的详细解读：
${cards.map((card, index) => `   ${index + 1}. ${card.name} (${card.isReversed ? '逆位' : '正位'})：
      - 牌面象征和基本含义
      - 在当前位置的特殊意义
      - ${card.isReversed ? '逆位' : '正位'}带来的影响
      - 与问题的具体关联`).join('\n\n')}

3. 牌阵整体分析：
   - 牌与牌之间的关系
   - 能量流动和故事线
   - 对问题的综合启示

4. 具体建议：
   - 基于解读给出的实际行动建议
   - 需要注意的潜在挑战
   - 可以把握的机会

请用温和、积极但实事求是的语气进行解读，既要照顾提问者的感受，也要传达真实的信息。解读要具体明确，避免模棱两可的表述。`;

    return prompt;
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