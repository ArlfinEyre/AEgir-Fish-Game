import { BinaryInput, TextureAtlas } from "@pixi-spine/base";
import * as spine37 from "@pixi-spine/runtime-3.7";
import * as spine38 from "@pixi-spine/runtime-3.8";
import * as spine41 from "@pixi-spine/runtime-4.1";
import { PIXI } from "./runtime/pixi.js";

function collectAssetConfigs(gameConfig) {
  const entries = new Map([
    [gameConfig.bgUrl, { type: "image", url: gameConfig.bgUrl }],
    [gameConfig.scoreUIUrl, { type: "image", url: gameConfig.scoreUIUrl }],
    [gameConfig.player.url, { type: gameConfig.player.type, url: gameConfig.player.url }],
  ]);

  gameConfig.fishVariants.forEach((variant) => {
    entries.set(variant.url, { type: variant.type, url: variant.url });
  });
  gameConfig.rewardVariants.forEach((variant) => {
    entries.set(variant.url, { type: variant.type, url: variant.url });
  });
  gameConfig.punishVariants.forEach((variant) => {
    entries.set(variant.url, { type: variant.type, url: variant.url });
  });
  (gameConfig.bossVariants || []).forEach((variant) => {
    entries.set(variant.url, { type: variant.type, url: variant.url });
  });

  return Array.from(entries.values());
}

function detectSpineVersion(version) {
  const ver3 = version.substr(0, 3);
  const verNum = Math.floor(Number(ver3) * 10 + 1e-3);

  if (ver3 === "3.7") {
    return 37;
  }
  if (ver3 === "3.8") {
    return 38;
  }
  if (ver3 === "4.0") {
    return 40;
  }
  if (ver3 === "4.1") {
    return 41;
  }
  if (verNum < 37) {
    return 37;
  }

  return 0;
}

function isSupportedVersionString(version) {
  return /^\d+\.\d+(?:\.\d+)?$/.test(version);
}

function readVersionOldFormat(data) {
  const input = new BinaryInput(data);
  try {
    input.readString();
    return input.readString() || "";
  } catch {
    return "";
  }
}

function readVersionNewFormat(data) {
  const input = new BinaryInput(data);
  input.readInt32();
  input.readInt32();
  try {
    return input.readString() || "";
  } catch {
    return "";
  }
}

function createBinaryParser(atlas, version) {
  if (version === 38) {
    return new spine38.SkeletonBinary(new spine38.AtlasAttachmentLoader(atlas));
  }

  if (version === 40 || version === 41) {
    return new spine41.SkeletonBinary(new spine41.AtlasAttachmentLoader(atlas));
  }

  return null;
}

async function loadTextureAtlas(atlasUrl) {
  const atlasText = await fetch(atlasUrl).then((response) => response.text());

  return await new Promise((resolve, reject) => {
    const atlas = new TextureAtlas(
      atlasText,
      async (pageName, done) => {
        try {
          const textureUrl = new URL(pageName, new URL(atlasUrl, window.location.href)).toString();
          const texture = await PIXI.Assets.load(textureUrl);
          done(texture.baseTexture);
        } catch (error) {
          reject(error);
          done(null);
        }
      },
      (loadedAtlas) => {
        if (!loadedAtlas) {
          reject(new Error(`Failed to load atlas for ${atlasUrl}`));
          return;
        }

        resolve(atlas);
      },
    );
  });
}

async function loadSpineResource(url) {
  const atlasUrl = url.replace(/\.(skel|json)$/i, ".atlas");
  const [atlas, binaryData] = await Promise.all([
    loadTextureAtlas(atlasUrl),
    fetch(url).then((response) => response.arrayBuffer()),
  ]);

  const data = new Uint8Array(binaryData);
  const oldVersion = readVersionOldFormat(data);
  const newVersion = readVersionNewFormat(data);
  const versionString = isSupportedVersionString(oldVersion)
    ? oldVersion
    : isSupportedVersionString(newVersion)
      ? newVersion
      : "";
  const version = detectSpineVersion(versionString);
  const parser = createBinaryParser(atlas, version);

  if (!parser) {
    throw new Error(
      `Unsupported spine version for ${url}: ${versionString || "unknown"}`,
    );
  }

  return {
    spineData: parser.readSkeletonData(data),
    spineAtlas: atlas,
  };
}

export async function loadGameAssets(gameConfig, onProgress) {
  const assetConfigs = collectAssetConfigs(gameConfig);
  const loadedEntries = await Promise.all(
    assetConfigs.map(async (assetConfig, index) => {
      const resource =
        assetConfig.type === "spine"
          ? await loadSpineResource(assetConfig.url)
          : await PIXI.Assets.load(assetConfig.url);

      if (onProgress) {
        onProgress((index + 1) / assetConfigs.length);
      }

      return [assetConfig.url, resource];
    }),
  );

  return Object.fromEntries(loadedEntries);
}

export function updateLoadingText(progress) {
  const loadingText = document.getElementById("loading-text");
  if (loadingText) {
    loadingText.innerText = `资源加载中 (${Math.round(progress * 100)}%)...`;
  }
}
