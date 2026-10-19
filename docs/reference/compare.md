# 场景像素比对：原版 app 纯场景帧 vs 参考台（同一渲染器字节）

| 场景 | app 帧 | harness | 差异像素 | 备注 |
|---|---|---|---|---|
| milky-way | 1920x1224 | 1920x1224 | 20.112% | diff-milky-way.png |
| glow-horizon | 1920x1224 | 1920x1224 | 0.000% | diff-glow-horizon.png |
| mountain | 1920x1224 | 1920x1224 | 0.437% | diff-mountain.png |
| heavenly-cloud | 1920x1224 | 1920x1224 | 28.518% | diff-heavenly-cloud.png |
| aurora-ionosphere | 1920x1224 | 1920x1224 | 7.343% | diff-aurora-ionosphere.png |
| black-hole | 1920x1224 | 1920x1224 | 5.422% | diff-black-hole.png |
| cloud-train | 1920x1224 | 1920x1224 | 46.024% | diff-cloud-train.png |
| blinking-squares | 1920x1224 | 1920x1224 | 6.464% | diff-blinking-squares.png |
| particle-image | 1920x1224 | 1920x1224 | 50.722% | diff-particle-image.png |
| pixel-sculpt | 1920x1224 | 1920x1224 | 20.831% | diff-pixel-sculpt.png |

> 阈值 0.1；动态场景（星流/粒子）有天然帧相位差，差异率是"结构性差异"的粗筛指标：
> 结构一致时应为低个位数百分比（仅噪声/相位），构图或颜色错误时会是 30%+。
