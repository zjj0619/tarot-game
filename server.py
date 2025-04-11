from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import logging

app = Flask(__name__)
CORS(app)

# 配置日志
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

API_KEY = 'sk-hueusilujkhclmbvweaisnxtirysetzwtyvcbshsxkypwaoq'
API_ENDPOINT = 'https://api.siliconflow.cn/v1/chat/completions'

@app.route('/api/tarot', methods=['POST'])
def get_tarot_reading():
    try:
        data = request.json
        logger.debug(f"收到请求数据: {data}")
        
        # 构建请求体
        request_body = {
            "model": "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
            "messages": [
                {
                    "role": "system",
                    "content": "你是一位经验丰富的塔罗牌解读师，擅长通过塔罗牌为人们提供洞察和指导。"
                },
                {
                    "role": "user",
                    "content": data['prompt']
                }
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        logger.debug(f"发送到 DeepSeek API 的请求体: {request_body}")
        
        # 发送请求到 DeepSeek API
        response = requests.post(
            API_ENDPOINT,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {API_KEY}'
            },
            json=request_body
        )
        
        logger.debug(f"DeepSeek API 响应状态码: {response.status_code}")
        logger.debug(f"DeepSeek API 响应内容: {response.text}")
        
        if response.status_code != 200:
            error_msg = f'API请求失败: {response.status_code} {response.text}'
            logger.error(error_msg)
            return jsonify({
                'error': error_msg
            }), 500
        
        response_data = response.json()
        logger.debug(f"处理后的响应数据: {response_data}")
        return jsonify(response_data)
        
    except Exception as e:
        error_msg = f'服务器错误: {str(e)}'
        logger.error(error_msg, exc_info=True)
        return jsonify({'error': error_msg}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
