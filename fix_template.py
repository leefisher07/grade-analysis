# 读取文件
with open('src/App.vue', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 找到标签管理弹窗的开始和结束
start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if '<!-- 标签管理弹窗 -->' in line:
        start_idx = i
    if start_idx and '</Transition>' in line and 'tagManagement' in ''.join(lines[max(0,i-20):i]):
        end_idx = i + 1
        break

if not start_idx or not end_idx:
    print("Cannot find popup section")
    exit(1)

print(f"Found popup section: lines {start_idx+1} to {end_idx+1}")

# 删除整个标签管理弹窗部分
new_lines = lines[:start_idx] + lines[end_idx:]

# 写回文件
with open('src/App.vue', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Successfully removed tag management popup")
print("File saved")
