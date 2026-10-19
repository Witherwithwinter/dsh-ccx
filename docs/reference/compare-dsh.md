# DSH 实机纯场景帧 vs 参考台（同字节渲染器 + 默认参数）

| 场景 | A | B | 差异像素 | 备注 |
|---|---|---|---|---|
| milky-way | 1920x1224 | 1920x1224 | 90.962% | diff-dsh-milky-way.png |
| glow-horizon | 1920x1224 | 1920x1224 | 13.713% | diff-dsh-glow-horizon.png |
| mountain | 1920x1224 | 1920x1224 | 17.330% | diff-dsh-mountain.png |
| heavenly-cloud | 1920x1224 | 1920x1224 | 58.244% | diff-dsh-heavenly-cloud.png |
| aurora-ionosphere | 1920x1224 | 1920x1224 | 41.668% | diff-dsh-aurora-ionosphere.png |
| black-hole | 1920x1224 | 1920x1224 | 8.192% | diff-dsh-black-hole.png |
| cloud-train | 1920x1224 | 1920x1224 | 61.430% | diff-dsh-cloud-train.png |
| blinking-squares | 1920x1224 | 1920x1224 | 4.553% | diff-dsh-blinking-squares.png |
| particle-image | 1920x1224 | 1920x1224 | 42.731% | diff-dsh-particle-image.png |
| pixel-sculpt | 1920x1224 | 1920x1224 | 20.837% | diff-dsh-pixel-sculpt.png |

> 阈值 0.1。时变场景（星流/粒子/云/隧道）存在天然帧相位差：结构一致时为噪声级差异，
> 构图或颜色错误会呈现为实心几何块（看 diff 图）。glow-horizon 为确定性 DOM 场景，应≈0%。
