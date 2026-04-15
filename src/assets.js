export function collectAssetUrls(gameConfig) {
  const urls = new Set([
    gameConfig.bgUrl,
    gameConfig.scoreUIUrl,
    gameConfig.player.url,
  ]);

  gameConfig.fishVariants.forEach((variant) => urls.add(variant.url));
  gameConfig.rewardVariants.forEach((variant) => urls.add(variant.url));
  gameConfig.punishVariants.forEach((variant) => urls.add(variant.url));

  return Array.from(urls);
}

export function updateLoadingText(progress) {
  const loadingText = document.getElementById("loading-text");
  if (loadingText) {
    loadingText.innerText = `资源加载中 (${Math.round(progress * 100)}%)...`;
  }
}
