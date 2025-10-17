// 简单的图标生成器 - 使用Canvas生成PNG图标
function generateIcon(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // 创建渐变背景
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    // 绘制圆形背景
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // 绘制包裹图标
    ctx.fillStyle = 'white';
    ctx.font = `${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📦', size/2, size/2);
    
    return canvas.toDataURL('image/png');
}

// 生成所有尺寸的图标
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

iconSizes.forEach(size => {
    const iconData = generateIcon(size);
    console.log(`${size}x${size} icon:`, iconData);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = `icon-${size}x${size}.png`;
    link.href = iconData;
    link.textContent = `下载 ${size}x${size} 图标`;
    link.style.display = 'block';
    link.style.margin = '10px';
    document.body.appendChild(link);
});
