#!/bin/bash
# Wrapper env for offline software-GL chromium (@sparticuz/chromium 153)
export LD_LIBRARY_PATH=/tmp/al2023/lib:/tmp:${LD_LIBRARY_PATH:-}
export FONTCONFIG_PATH=/tmp/fonts
export VK_ICD_FILENAMES=/tmp/vk_swiftshader_icd.json
export VK_DRIVER_FILES=/tmp/vk_swiftshader_icd.json
export HOME=/tmp
exec /tmp/chromium "$@"
