/**
 * 牌阵隐藏/展开功能
 * 为所有牌阵图添加默认隐藏和点击展开的功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 获取SVG元素
    const svgElement = document.querySelector('svg');
    if (!svgElement) return;
    
    // 保存原始尺寸
    const originalWidth = svgElement.getAttribute('width');
    const originalHeight = svgElement.getAttribute('height');
    const originalViewBox = svgElement.getAttribute('viewBox');
    
    // 创建展开/收起指示器
    const toggleIndicator = document.createElement('div');
    toggleIndicator.className = 'toggle-indicator';
    toggleIndicator.innerHTML = '<span>点击展开</span>';
    document.body.appendChild(toggleIndicator);
    
    // 设置初始状态为折叠
    let isExpanded = false;
    
    // 设置折叠状态的尺寸（只显示一小部分）
    function collapseSpread() {
        // 获取原始尺寸的30%作为折叠状态的尺寸
        const collapsedWidth = parseInt(originalWidth) * 0.3;
        const collapsedHeight = parseInt(originalHeight) * 0.3;
        
        // 更新SVG尺寸
        svgElement.setAttribute('width', collapsedWidth);
        svgElement.setAttribute('height', collapsedHeight);
        
        // 更新指示器文本
        toggleIndicator.innerHTML = '<span>点击展开</span>';
        toggleIndicator.classList.remove('expanded');
        
        isExpanded = false;
    }
    
    // 设置展开状态的尺寸（显示完整牌阵）
    function expandSpread() {
        // 恢复原始尺寸
        svgElement.setAttribute('width', originalWidth);
        svgElement.setAttribute('height', originalHeight);
        
        // 更新指示器文本
        toggleIndicator.innerHTML = '<span>点击收起</span>';
        toggleIndicator.classList.add('expanded');
        
        isExpanded = true;
    }
    
    // 初始化为折叠状态
    collapseSpread();
    
    // 添加点击事件监听器
    svgElement.addEventListener('click', function() {
        if (isExpanded) {
            collapseSpread();
        } else {
            expandSpread();
        }
    });
    
    // 指示器也可以点击切换状态
    toggleIndicator.addEventListener('click', function() {
        if (isExpanded) {
            collapseSpread();
        } else {
            expandSpread();
        }
    });
});